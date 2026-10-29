import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays, Check, Clock, Plus, RefreshCw, Search, X,
} from 'lucide-react';
import api from '../services/api';
import './Appointments.css';

const initialForm = { patientId: '', appointmentDate: '', reason: '', notes: '' };

const STATUS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
};

const TABS = [
  { value: '', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
];

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Lit le message d'erreur renvoyé par l'API, quel que soit son format
function getErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (!data) return fallback;

  const base = data.error?.message ?? data.message ?? fallback;
  const details = data.error?.details ?? data.details ?? data.errors;

  if (Array.isArray(details) && details.length > 0) {
    const list = details
      .map((d) => {
        if (typeof d === 'string') return d;
        const field = d.field ?? d.path;
        const text = d.message ?? '';
        return field ? `${field} : ${text}` : text;
      })
      .filter(Boolean)
      .join(' | ');
    return list ? `${base} (${list})` : base;
  }
  return base;
}

const getDate = (a) => a.appointmentDate ?? a.appointment_date;

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '' });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;

      const [appointmentsResponse, patientsResponse] = await Promise.all([
        api.get('/appointments', { params }),
        api.get('/patients', { params: { page: 1, limit: 100 } }),
      ]);

      const appointmentData = appointmentsResponse.data?.data ?? appointmentsResponse.data;
      const patientData = patientsResponse.data?.data ?? patientsResponse.data;

      setAppointments(
        Array.isArray(appointmentData)
          ? appointmentData
          : appointmentData?.appointments ?? appointmentData?.items ?? []
      );
      setPatients(
        Array.isArray(patientData)
          ? patientData
          : patientData?.patients ?? patientData?.items ?? []
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les rendez-vous ou les patients.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date, filters.status]);

  // Fermer la fenêtre avec la touche Échap
  useEffect(() => {
    if (!showForm) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setShowForm(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm]);

  function openForm() {
    setError('');
    setMessage('');
    setFormError('');
    setFieldErrors({});
    setForm(initialForm);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setFormError('');

    const errs = {};
    if (!form.patientId) errs.patientId = 'Choisissez un patient.';
    if (!form.appointmentDate) errs.appointmentDate = 'Choisissez une date et une heure.';
    else if (new Date(form.appointmentDate) < new Date()) errs.appointmentDate = 'La date doit être dans le futur.';
    if (!form.reason.trim()) errs.reason = 'Le motif est obligatoire.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      // Les noms de champs doivent correspondre au validateur Zod du backend
      await api.post('/appointments', {
        patient_id: form.patientId,
        appointment_date: new Date(form.appointmentDate).toISOString(),
        reason: form.reason.trim(),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });
      setForm(initialForm);
      setShowForm(false);
      setMessage('Rendez-vous créé avec succès.');
      await loadData();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Impossible de créer le rendez-vous.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(id, status) {
    setError('');
    setMessage('');
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setMessage('Statut du rendez-vous mis à jour.');
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de modifier le statut.'));
    }
  }

  function patientName(a) {
    const p = patients.find((x) => x.id === (a.patientId ?? a.patient_id));
    return (
      a.patientName ?? a.patient_name ?? a.fullName ?? a.full_name ??
      p?.fullName ?? p?.full_name ?? 'Patient'
    );
  }

  const todayKey = dayKey(new Date());

  const stats = useMemo(() => ({
    today: appointments.filter((a) => getDate(a) && dayKey(getDate(a)) === todayKey).length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }), [appointments, todayKey]);

  // Avertit si le patient a déjà un rendez-vous confirmé à moins de 30 minutes
  const conflict = useMemo(() => {
    if (!form.patientId || !form.appointmentDate) return null;
    const t = new Date(form.appointmentDate).getTime();
    if (Number.isNaN(t)) return null;
    return appointments.find((a) =>
      (a.patientId ?? a.patient_id) === form.patientId &&
      a.status === 'confirmed' &&
      Math.abs(new Date(getDate(a)).getTime() - t) < 30 * 60 * 1000
    ) ?? null;
  }, [form.patientId, form.appointmentDate, appointments]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = appointments
      .filter((a) => getDate(a))
      .filter((a) =>
        !q ||
        patientName(a).toLowerCase().includes(q) ||
        (a.reason ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(getDate(a)) - new Date(getDate(b)));

    const map = new Map();
    filtered.forEach((a) => {
      const key = dayKey(getDate(a));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    return [...map.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, patients, search]);

  const kpis = [
    { label: "Aujourd'hui", value: stats.today, tone: 'teal' },
    { label: 'En attente', value: stats.pending, tone: 'amber' },
    { label: 'Confirmés', value: stats.confirmed, tone: 'green' },
    { label: 'Annulés', value: stats.cancelled, tone: 'red' },
  ];

  return (
    <div className="cf-ap">
      {/* En-tête */}
      <header className="cf-ap-header">
        <div>
          <span className="cf-ap-eyebrow">Espace de gestion</span>
          <h1>Rendez-vous</h1>
          <p>Planifiez, confirmez et suivez les consultations de la clinique.</p>
        </div>
        <button type="button" className="cf-ap-btn cf-ap-btn-primary" onClick={openForm}>
          <Plus size={18} /> Nouveau rendez-vous
        </button>
      </header>

      {error && <div className="cf-ap-alert cf-ap-alert-error" role="alert">{error}</div>}
      {message && <div className="cf-ap-alert cf-ap-alert-ok" role="status">{message}</div>}

      {/* Indicateurs */}
      <section className="cf-ap-kpis">
        {kpis.map((k) => (
          <div key={k.label} className={`cf-ap-kpi cf-tone-${k.tone}`}>
            <span className="cf-ap-kpi-dot" />
            <div>
              <strong>{k.value}</strong>
              <small>{k.label}</small>
            </div>
          </div>
        ))}
      </section>

      {/* Barre d'outils */}
      <section className="cf-ap-toolbar">
        <div className="cf-ap-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Rechercher un patient ou un motif…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cf-ap-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={filters.status === t.value}
              className={filters.status === t.value ? 'is-active' : ''}
              onClick={() => setFilters({ ...filters, status: t.value })}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          className="cf-ap-date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          aria-label="Filtrer par date"
        />

        <button
          type="button"
          className="cf-ap-icon-btn"
          onClick={loadData}
          disabled={loading}
          aria-label="Actualiser"
          title="Actualiser"
        >
          <RefreshCw size={16} className={loading ? 'cf-spin' : ''} />
        </button>
      </section>

      {/* Liste */}
      <section className="cf-ap-list">
        {loading && groups.length === 0 ? (
          <div className="cf-ap-empty">Chargement des rendez-vous…</div>
        ) : groups.length === 0 ? (
          <div className="cf-ap-empty">
            <CalendarDays size={34} />
            <p>Aucun rendez-vous trouvé.</p>
          </div>
        ) : (
          groups.map(([key, items]) => {
            const label = new Date(getDate(items[0])).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            });
            return (
              <div className="cf-ap-day" key={key}>
                <div className="cf-ap-day-title">
                  <span>{label}</span>
                  {key === todayKey && <em>Aujourd'hui</em>}
                  <small>{items.length} rdv</small>
                </div>

                {items.map((a) => {
                  const name = patientName(a);
                  return (
                    <article key={a.id} className={`cf-ap-item is-${a.status}`}>
                      <div className="cf-ap-time">
                        {new Date(getDate(a)).toLocaleTimeString('fr-FR', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>

                      <div className="cf-ap-avatar">{initials(name)}</div>

                      <div className="cf-ap-info">
                        <strong>{name}</strong>
                        <span>{a.reason ?? '—'}</span>
                      </div>

                      <span className={`cf-ap-badge is-${a.status}`}>
                        {STATUS[a.status] ?? a.status}
                      </span>

                      <div className="cf-ap-actions">
                        {a.status !== 'confirmed' && (
                          <button
                            type="button"
                            className="is-ok"
                            title="Confirmer"
                            onClick={() => handleStatus(a.id, 'confirmed')}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {a.status !== 'pending' && (
                          <button
                            type="button"
                            className="is-wait"
                            title="Remettre en attente"
                            onClick={() => handleStatus(a.id, 'pending')}
                          >
                            <Clock size={16} />
                          </button>
                        )}
                        {a.status !== 'cancelled' && (
                          <button
                            type="button"
                            className="is-no"
                            title="Annuler"
                            onClick={() => handleStatus(a.id, 'cancelled')}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })
        )}
      </section>

      {/* Fenêtre de création : rendue dans <body>, donc centrée sur tout l'écran */}
      {showForm && createPortal(
        <div className="cf-ap-overlay" onMouseDown={closeForm}>
          <div
            className="cf-ap-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cf-ap-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="cf-ap-modal-head">
              <div>
                <h2 id="cf-ap-modal-title">Nouveau rendez-vous</h2>
                <p>Renseignez les informations de la consultation.</p>
              </div>
              <button type="button" className="cf-ap-icon-btn" onClick={closeForm} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="cf-ap-form" noValidate>
              <div className="cf-ap-modal-body">
                {formError && (
                  <div className="cf-ap-alert cf-ap-alert-error" role="alert">{formError}</div>
                )}

                <div className="cf-ap-section">
                  <h3>Patient et créneau</h3>

                  <label className={`cf-ap-field ${fieldErrors.patientId ? 'has-error' : ''}`}>
                    Patient *
                    <select
                      value={form.patientId}
                      onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    >
                      <option value="">Sélectionner un patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName ?? p.full_name} — {p.cin}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.patientId && (
                      <span className="cf-ap-field-error">{fieldErrors.patientId}</span>
                    )}
                  </label>

                  <label className={`cf-ap-field ${fieldErrors.appointmentDate ? 'has-error' : ''}`}>
                    Date et heure *
                    <input
                      type="datetime-local"
                      value={form.appointmentDate}
                      onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                    />
                    {fieldErrors.appointmentDate && (
                      <span className="cf-ap-field-error">{fieldErrors.appointmentDate}</span>
                    )}
                    {conflict && (
                      <span className="cf-ap-field-warn">
                        Ce patient a déjà un rendez-vous confirmé à{' '}
                        {new Date(getDate(conflict)).toLocaleTimeString('fr-FR', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                        . Celui-ci sera créé « en attente », mais il ne pourra pas être
                        confirmé sans laisser 30 minutes d'écart.
                      </span>
                    )}
                  </label>
                </div>

                <div className="cf-ap-section">
                  <h3>Consultation</h3>

                  <label className={`cf-ap-field ${fieldErrors.reason ? 'has-error' : ''}`}>
                    Motif *
                    <input
                      maxLength={500}
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      placeholder="Ex. : consultation de contrôle"
                    />
                    {fieldErrors.reason && (
                      <span className="cf-ap-field-error">{fieldErrors.reason}</span>
                    )}
                  </label>

                  <label className="cf-ap-field">
                    Notes (optionnel)
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="cf-ap-modal-foot">
                <button type="button" className="cf-ap-btn" onClick={closeForm}>
                  Annuler
                </button>
                <button type="submit" className="cf-ap-btn cf-ap-btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : 'Créer le rendez-vous'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}