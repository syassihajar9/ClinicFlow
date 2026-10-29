
import { useEffect, useMemo, useState } from 'react';
import './Users.css';
import {
  RefreshCw,
  Users,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Mail,
  AlertCircle,
  X,
} from 'lucide-react';

import api from '../services/api';

function getUserName(user) {
  return (
    user.fullName ??
    user.full_name ??
    user.name ??
    ([user.firstName, user.lastName].filter(Boolean).join(' ') ||
      'Utilisateur')
  );
}

function getRole(user) {
  return String(user.role ?? '').toLowerCase();
}

function getRoleLabel(role) {
  const roles = {
    admin: 'Administrateur',
    doctor: 'Médecin',
    medecin: 'Médecin',
    secretary: 'Secrétaire',
    secretaire: 'Secrétaire',
    staff: 'Personnel',
  };

  return roles[role] ?? (role || 'Non défini');
}

function RoleIcon({ role }) {
  if (role === 'admin') {
    return <ShieldCheck size={15} />;
  }

  if (['doctor', 'medecin'].includes(role)) {
    return <Stethoscope size={15} />;
  }

  return <UserRound size={15} />;
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function loadUsers(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await api.get('/users');
      const data = response.data?.data ?? response.data;

      const list = Array.isArray(data)
        ? data
        : data?.users ?? data?.items ?? [];

      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ??
          'Impossible de charger les utilisateurs. Vérifiez les droits et la route API.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const name = String(getUserName(user)).toLowerCase();
      const email = String(user.email ?? '').toLowerCase();
      const role = getRoleLabel(getRole(user)).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        role.includes(query)
      );
    });
  }, [users, search]);

  const adminCount = users.filter(
    (user) => getRole(user) === 'admin'
  ).length;

  const doctorCount = users.filter((user) =>
    ['doctor', 'medecin'].includes(getRole(user))
  ).length;

  return (
    <main className="dashboard-page cf-users-page">
      <header className="page-header users-header">
        <div className="users-header-copy">
          <p className="dashboard-eyebrow">ESPACE DE GESTION</p>

          <h1>Utilisateurs</h1>

          <p className="muted">
            Consultez les comptes et leurs rôles dans ClinicFlow.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => loadUsers(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'users-refresh-spin' : ''}
          />
          Actualiser
        </button>
      </header>

      <section className="users-summary">
        <article className="card users-summary-card">
          <span className="users-summary-icon">
            <Users size={22} />
          </span>

          <div>
            <p className="muted">Total des comptes</p>
            <strong>{loading ? '—' : users.length}</strong>
          </div>
        </article>

        <article className="card users-summary-card">
          <span className="users-summary-icon">
            <ShieldCheck size={22} />
          </span>

          <div>
            <p className="muted">Administrateurs</p>
            <strong>{loading ? '—' : adminCount}</strong>
          </div>
        </article>

        <article className="card users-summary-card">
          <span className="users-summary-icon">
            <Stethoscope size={22} />
          </span>

          <div>
            <p className="muted">Médecins</p>
            <strong>{loading ? '—' : doctorCount}</strong>
          </div>
        </article>
      </section>

      {error && (
        <div className="alert-error users-alert" role="alert">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadUsers()}
          >
            Réessayer
          </button>
        </div>
      )}

      <section className="card users-list-card">
        <div className="users-list-header">
          <div>
            <h2>Liste des utilisateurs</h2>

            <p className="muted">
              Recherchez les comptes et consultez leurs rôles.
            </p>
          </div>

          <span className="users-count">
            {filteredUsers.length} compte(s)
          </span>
        </div>

        <div className="users-search-box">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par nom, email ou rôle..."
            aria-label="Rechercher un utilisateur"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Effacer la recherche"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="users-state">
            <span className="users-spinner" />
            <p>Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-state">
            <Users size={30} />

            <h3>
              {search ? 'Aucun résultat' : 'Aucun utilisateur'}
            </h3>

            <p className="muted">
              {search
                ? 'Essayez un autre terme de recherche.'
                : 'Aucun compte utilisateur à afficher.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table users-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Identifiant</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user, index) => {
                  const role = getRole(user);
                  const name = String(getUserName(user));

                  return (
                    <tr
                      key={
                        user.id ??
                        user._id ??
                        user.email ??
                        index
                      }
                    >
                      <td>
                        <div className="users-person">
                          <span className="users-avatar">
                            {name.charAt(0).toUpperCase()}
                          </span>

                          <div>
                            <strong>{name}</strong>
                            <small>Compte ClinicFlow</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="users-email">
                          <Mail size={15} />
                          {user.email ?? '—'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`users-role users-role-${role || 'staff'}`}
                        >
                          <RoleIcon role={role} />
                          {getRoleLabel(role)}
                        </span>
                      </td>

                      <td>{user.id ?? user._id ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <footer className="users-list-footer">
            <span className="muted">
              {filteredUsers.length} résultat(s) sur {users.length}
            </span>

            <span>
              <ShieldCheck size={15} />
              Gestion des comptes
            </span>
          </footer>
        )}
      </section>
    </main>
  );
}
