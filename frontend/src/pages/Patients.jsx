import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  Eye, UserRound, Users, RefreshCw, X,
} from 'lucide-react';

import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Patients.css';

const LIMIT = 10;

const EMPTY = { full_name: '', cin: '', phone: '', birth_date: '', address: '' };

const STATUS = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };

const initials = (name = '') =>
  String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('');

const formatDate = (value) => {
  if (!value) return '—';
  const parts = String(value).slice(0, 10).split('-');
  if (parts.length !== 3 || parts.some((p) => !p)) return '—';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getAge = (value) => {
  if (!value) return null;
  const birth = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
};

const getTodayISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Validation côté formulaire : une erreur par champ
function validatePatient(form) {
  const errors = {};
  const fullName = form.full_name.trim();
  const cin = form.cin.trim();
  const phone = form.phone.trim();

  if (!fullName) errors.full_name = 'Le nom complet est obligatoire.';
  else if (fullName.length < 2) errors.full_name = 'Au moins 2 caractères.';

  if (!cin) errors.cin = 'La CIN est obligatoire.';

  if (!phone) errors.phone = 'Le téléphone est obligatoire.';
  else if (!/^[0-9+\s().-]{6,20}$/.test(phone)) errors.phone = 'Numéro de téléphone invalide.';

  if (!form.birth_date) errors.birth_date = 'La date de naissance est obligatoire.';
  else if (form.birth_date > getTodayISO()) errors.birth_date = 'La date ne peut pas être dans le futur.';

  return errors;
}

// Transforme une erreur de l'API en erreurs par champ + message général
function readServerErrors(err) {
  const data = err.response?.data;
  const list = data?.errors ?? data?.error?.details ?? [];
  const fields = {};
  const others = [];

  if (Array.isArray(list)) {
    list.forEach((item) => {
      const key = String(item.field ?? item.path ?? '').split('.').pop();
      if (key in EMPTY) fields[key] = item.message || 'Valeur invalide.';
      else if (item.message) others.push(item.message);
    });
  }
  if (err.response?.status === 409 && !fields.cin) {
    fields.cin = 'Un patient avec cette CIN existe déjà.';
  }
  const hasField = Object.keys(fields).length > 0;
  return { fields, message: hasField ? '' : others.join(' · ') || getErrorMessage(err) };
}

function Avatar({ name, large = false }) {
  return (
    <div className={`cfp-avatar ${large ? 'is-large' : ''}`} aria-hidden="true">
      {initials(name) || <UserRound size={18} />}
    </div>
  );
}

// Fenêtre centrée, rendue dans <body> : elle couvre tout l'écran
function Dialog({ title, subtitle, onClose, footer, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return createPortal(
    <div className="cfp-overlay" onMouseDown={onClose}>
      <div
        className="cfp-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cfp-dialog-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="cfp-icon-btn" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="cfp-dialog-body">{children}</div>
        {footer && <div className="cfp-dialog-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className={`cfp-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="cfp-field-error">{error}</span>}
    </div>
  );
}

export default function Patients() {
  const { isAdmin } = useAuth();
  const { notify } = useToast();

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const detailsRequestId = useRef(0);

  // Recherche avec délai (évite une requête à chaque lettre)
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  // Chargement de la liste
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/patients', { params: { search: query, page, limit: LIMIT } });
        if (cancelled) return;

        const data = response.data?.data;
        const pag = response.data?.pagination;
        if (!Array.isArray(data) || !pag) throw new Error('Format de réponse inattendu du serveur.');

        setPatients(data);
        setPagination(pag);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
        setPatients([]);
        setPagination({ page, totalPages: 0, total: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [query, page, refreshKey]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setFormError('');
    setFieldErrors({});
  }

  function openEdit(patient) {
    setEditingId(patient.id);
    setForm({
      full_name: patient.full_name || '',
      cin: patient.cin || '',
      phone: patient.phone || '',
      birth_date: patient.birth_date ? String(patient.birth_date).slice(0, 10) : '',
      address: patient.address || '',
    });
    setFormError('');
    setFieldErrors({});
  }

  function closeForm() {
    if (saving) return;
    setForm(null);
    setEditingId(null);
    setFormError('');
    setFieldErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }

  async function save(event) {
    event.preventDefault();
    if (!form || saving) return;

    const errors = validatePatient(form);
    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length > 0) return;

    const payload = {
      full_name: form.full_name.trim(),
      cin: form.cin.trim(),
      phone: form.phone.trim(),
      birth_date: form.birth_date,
      address: form.address.trim() || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, payload);
        notify('Patient modifié avec succès');
      } else {
        await api.post('/patients', payload);
        notify('Patient ajouté avec succès');
      }
      setForm(null);
      setEditingId(null);
      setSearch('');
      setQuery('');
      setPage(1);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const { fields, message } = readServerErrors(err);
      setFieldErrors(fields);
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/patients/${toDelete.id}`);
      notify('Patient supprimé avec succès');
      const wasLastOnPage = patients.length === 1;
      setToDelete(null);
      if (wasLastOnPage && page > 1) setPage((p) => p - 1);
      else setRefreshKey((k) => k + 1);
    } catch (err) {
      notify(readServerErrors(err).message || getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function openDetails(patient) {
    const requestId = ++detailsRequestId.current;
    setSelected(patient);
    setDetailsLoading(true);
    try {
      const response = await api.get(`/patients/${patient.id}`);
      if (requestId !== detailsRequestId.current) return;
      const data = response.data?.data ?? response.data;
      if (data && typeof data === 'object') setSelected(data);
    } catch {
      // On garde les informations déjà présentes dans le tableau
    } finally {
      if (requestId === detailsRequestId.current) setDetailsLoading(false);
    }
  }

  function closeDetails() {
    detailsRequestId.current += 1;
    setSelected(null);
    setDetailsLoading(false);
  }

  const totalPages = Math.max(0, Number(pagination.totalPages) || 0);
  const totalPatients = Math.max(0, Number(pagination.total) || 0);
  const from = totalPatients === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, totalPatients);

  return (
    <div className="cfp-page">
      <header className="cfp-header">
        <div>
          <span className="cfp-eyebrow">Espace de gestion</span>
          <h1>Patients</h1>
          <p>Consultez, ajoutez et mettez à jour les dossiers des patients de la clinique.</p>
        </div>
        <button type="button" className="cfp-btn cfp-btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nouveau patient
        </button>
      </header>

      <section className="cfp-card">
        <div className="cfp-toolbar">
          <div className="cfp-toolbar-title">
            <h2>Liste des patients</h2>
            <span className="cfp-count">
              {loading ? 'Chargement…' : `${totalPatients} patient(s)`}
            </span>
          </div>

          <div className="cfp-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Rechercher par nom ou CIN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un patient par nom ou CIN"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Effacer la recherche">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="cfp-alert" role="alert">
            <p>{error}</p>
            <button type="button" className="cfp-btn" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div className="cfp-state" role="status">
            <span className="cfp-spinner" />
            <p>Chargement des patients…</p>
          </div>
        ) : patients.length === 0 && !error ? (
          <div className="cfp-state">
            <Users size={34} />
            <h3>{query ? 'Aucun résultat' : 'Aucun patient pour le moment'}</h3>
            <p>
              {query
                ? `Aucun patient ne correspond à « ${query} ».`
                : 'Ajoutez le premier patient pour commencer.'}
            </p>
            {!query && (
              <button type="button" className="cfp-btn cfp-btn-primary" onClick={openCreate}>
                <Plus size={16} /> Ajouter un patient
              </button>
            )}
          </div>
        ) : (
          patients.length > 0 && (
            <div className="cfp-table-scroll">
              <table className="cfp-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>CIN</th>
                    <th>Téléphone</th>
                    <th>Naissance</th>
                    <th>Adresse</th>
                    <th className="cfp-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => {
                    const age = getAge(p.birth_date);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="cfp-person">
                            <Avatar name={p.full_name} />
                            <strong>{p.full_name || 'Nom indisponible'}</strong>
                          </div>
                        </td>
                        <td><span className="cfp-cin">{p.cin || '—'}</span></td>
                        <td>{p.phone || '—'}</td>
                        <td>
                          {formatDate(p.birth_date)}
                          {age !== null && <small className="cfp-age">{age} ans</small>}
                        </td>
                        <td><span className="cfp-address">{p.address || '—'}</span></td>
                        <td>
                          <div className="cfp-actions">
                            <button
                              type="button"
                              title="Voir la fiche"
                              aria-label={`Voir la fiche de ${p.full_name}`}
                              onClick={() => openDetails(p)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              title="Modifier"
                              aria-label={`Modifier ${p.full_name}`}
                              onClick={() => openEdit(p)}
                            >
                              <Pencil size={16} />
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                className="is-danger"
                                title="Supprimer"
                                aria-label={`Supprimer ${p.full_name}`}
                                onClick={() => setToDelete(p)}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {!loading && totalPages > 0 && (
          <footer className="cfp-pagination">
            <span>
              {from}–{to} sur {totalPatients} · Page <strong>{page}</strong> / {totalPages}
            </span>
            <div>
              <button
                type="button"
                className="cfp-btn"
                disabled={page <= 1}
                onClick={() => setPage((c) => Math.max(1, c - 1))}
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              <button
                type="button"
                className="cfp-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </section>

      {/* Formulaire ajout / modification */}
      {form && (
        <Dialog
          title={editingId ? 'Modifier le patient' : 'Nouveau patient'}
          subtitle="Les champs marqués d'une étoile sont obligatoires."
          onClose={closeForm}
          footer={
            <>
              <button type="button" className="cfp-btn" onClick={closeForm} disabled={saving}>
                Annuler
              </button>
              <button
                type="submit"
                form="cfp-patient-form"
                className="cfp-btn cfp-btn-primary"
                disabled={saving}
              >
                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Ajouter le patient'}
              </button>
            </>
          }
        >
          <form id="cfp-patient-form" className="cfp-form" onSubmit={save} noValidate>
            {formError && <div className="cfp-alert" role="alert"><p>{formError}</p></div>}

            <div className="cfp-section">
              <h3>Identité</h3>

              <Field id="cfp-full-name" label="Nom complet *" error={fieldErrors.full_name}>
                <input
                  id="cfp-full-name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  maxLength={150}
                  autoFocus
                />
              </Field>

              <div className="cfp-row">
                <Field id="cfp-cin" label="CIN *" error={fieldErrors.cin}>
                  <input
                    id="cfp-cin"
                    name="cin"
                    value={form.cin}
                    onChange={handleChange}
                    maxLength={30}
                  />
                </Field>

                <Field id="cfp-birth" label="Date de naissance *" error={fieldErrors.birth_date}>
                  <input
                    id="cfp-birth"
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    max={getTodayISO()}
                  />
                </Field>
              </div>
            </div>

            <div className="cfp-section">
              <h3>Contact</h3>

              <Field id="cfp-phone" label="Téléphone *" error={fieldErrors.phone}>
                <input
                  id="cfp-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  maxLength={30}
                />
              </Field>

              <Field id="cfp-address" label="Adresse (optionnel)" error={fieldErrors.address}>
                <input
                  id="cfp-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  maxLength={255}
                />
              </Field>
            </div>
          </form>
        </Dialog>
      )}

      {/* Fiche patient */}
      {selected && (
        <Dialog
          title="Fiche patient"
          onClose={closeDetails}
          footer={<button type="button" className="cfp-btn" onClick={closeDetails}>Fermer</button>}
        >
          <div className="cfp-profile">
            <Avatar name={selected.full_name} large />
            <div>
              <h3>{selected.full_name || 'Patient'}</h3>
              <span>{getAge(selected.birth_date) !== null ? `${getAge(selected.birth_date)} ans` : 'Âge inconnu'}</span>
            </div>
          </div>

          {detailsLoading && <p className="cfp-muted" role="status">Actualisation des informations…</p>}

          <dl className="cfp-detail-grid">
            <div><dt>CIN</dt><dd>{selected.cin || '—'}</dd></div>
            <div><dt>Téléphone</dt><dd>{selected.phone || '—'}</dd></div>
            <div><dt>Date de naissance</dt><dd>{formatDate(selected.birth_date)}</dd></div>
            <div><dt>Adresse</dt><dd>{selected.address || '—'}</dd></div>
          </dl>

          {Array.isArray(selected.appointments) && (
            <div className="cfp-section">
              <h3>Rendez-vous ({selected.appointments.length})</h3>
              {selected.appointments.length === 0 ? (
                <p className="cfp-muted">Aucun rendez-vous pour ce patient.</p>
              ) : (
                <ul className="cfp-appt-list">
                  {selected.appointments.map((a) => {
                    const date = a.appointment_date ?? a.appointmentDate;
                    return (
                      <li key={a.id}>
                        <div>
                          <strong>
                            {date
                              ? new Date(date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
                              : '—'}
                          </strong>
                          <span>{a.reason || '—'}</span>
                        </div>
                        <em className={`cfp-badge is-${a.status}`}>{STATUS[a.status] ?? a.status}</em>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </Dialog>
      )}

      {/* Confirmation de suppression (admin) */}
      {toDelete && (
        <Dialog
          title="Supprimer ce patient ?"
          onClose={() => { if (!deleting) setToDelete(null); }}
          footer={
            <>
              <button type="button" className="cfp-btn" onClick={() => setToDelete(null)} disabled={deleting}>
                Annuler
              </button>
              <button type="button" className="cfp-btn cfp-btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Suppression…' : 'Supprimer le patient'}
              </button>
            </>
          }
        >
          <div className="cfp-delete">
            <div className="cfp-delete-icon"><Trash2 size={24} /></div>
            <p>
              Vous allez supprimer le dossier de <strong>{toDelete.full_name}</strong>.
            </p>
            <span>Cette action est réservée à l'administrateur.</span>
          </div>
        </Dialog>
      )}
    </div>
  );
}