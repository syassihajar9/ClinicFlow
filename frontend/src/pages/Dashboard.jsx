
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const initialStats = {
  totalPatients: 0,
  todayAppointments: 0,
  pendingAppointments: 0,
  confirmedAppointments: 0,
};

function normalizeStats(response) {
  const data = response?.data?.data ?? response?.data ?? {};

  return {
    totalPatients: Number(
      data.totalPatients ?? data.total_patients ?? 0
    ),
    todayAppointments: Number(
      data.appointments_today ?? data.todayAppointments ?? data.today_appointments ?? 0
    ),
    pendingAppointments: Number(
      data.pendingAppointments ?? data.pending_appointments ?? 0
    ),
    confirmedAppointments: Number(
      data.confirmedAppointments ?? data.confirmed_appointments ?? 0
    ),
  };
}

function Icon({ children, className = '' }) {
  return (
    <span className={`cf-icon ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

function getToday() {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Casablanca',
  }).format(new Date());
}

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/dashboard');

        if (active) {
          setStats(normalizeStats(response));
        }
      } catch (err) {
        if (!active) return;

        if (!err.response) {
          setError(
            'Serveur injoignable. Vérifiez que le backend est démarré.'
          );
        } else if (err.response.status === 401) {
          setError(
            'Votre session a expiré. Veuillez vous reconnecter.'
          );
        } else if (err.response.status === 404) {
          setError(
            'La route du dashboard est introuvable.'
          );
        } else {
          setError(
            err.response.data?.message ||
              `Erreur serveur (${err.response.status}).`
          );
        }

        console.error(
          'Erreur dashboard :',
          err.response?.status,
          err.response?.data || err.message
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      label: 'Patients enregistrés',
      value: stats.totalPatients,
      icon: '♙',
      tone: 'mint',
      detail: 'Base patients',
    },
    {
      label: "Rendez-vous aujourd'hui",
      value: stats.todayAppointments,
      icon: '▦',
      tone: 'blue',
      detail: 'Activité du jour',
    },
    {
      label: 'En attente',
      value: stats.pendingAppointments,
      icon: '◷',
      tone: 'amber',
      detail: 'À traiter',
    },
    {
      label: 'Rendez-vous confirmés',
      value: stats.confirmedAppointments,
      icon: '✓',
      tone: 'violet',
      detail: 'Confirmations',
    },
  ];

  const firstName = user?.fullName?.trim()?.split(/\s+/)[0];

  return (
    <main className="dashboard-page">
      <header className="cf-dashboard-header">
        <div className="cf-heading-copy">
          <span className="cf-eyebrow">
            <span className="cf-eyebrow-dot" />
            ESPACE DE GESTION
          </span>

          <h1>
            Bonjour{firstName ? `, ${firstName}` : ''}{' '}
            <span>👋</span>
          </h1>

          <p>
            Voici un aperçu de l’activité de votre clinique.
            <br className="cf-desktop-break" />
            Tout est prêt pour une nouvelle journée.
          </p>
        </div>

        <div className="cf-date-chip">
          <span className="cf-date-icon">▦</span>
          <span className="cf-date-text">
            <small>Aujourd’hui</small>
            <strong>{getToday()}</strong>
          </span>
        </div>
      </header>

      {error && (
        <div className="cf-error" role="alert">
          <span aria-hidden="true">!</span>
          <p>{error}</p>
        </div>
      )}

      <section className="cf-hero">
        <div className="cf-hero-content">
          <span className="cf-hero-label">
            BIENVENUE SUR CLINICFLOW
          </span>

          <h2>
            Une meilleure organisation,
            <br />
            <span className="cf-hero-highlight">
              des soins plus sereins.
            </span>
          </h2>

          <p>
            Gérez votre activité médicale depuis un espace clair,
            intuitif et pensé pour votre quotidien.
          </p>

          <div className="cf-hero-points">
            <div className="cf-hero-point">
              <Icon>✓</Icon>
              <span>Gestion centralisée</span>
            </div>

            <div className="cf-hero-point">
              <Icon>✚</Icon>
              <span>Suivi simplifié</span>
            </div>
          </div>
        </div>

        <div className="cf-hero-art" aria-hidden="true">
          <div className="cf-orbit cf-orbit-one" />
          <div className="cf-orbit cf-orbit-two" />
          <div className="cf-hero-glow" />

          <div className="cf-medical-cross">✚</div>

          <div className="cf-floating-card cf-floating-card-top">
            <span className="cf-floating-icon">♡</span>
            <span>
              <strong>Le patient</strong>
              <small>Au cœur de vos soins</small>
            </span>
          </div>

          <div className="cf-floating-card cf-floating-card-bottom">
            <span className="cf-status-pulse" />
            <span>
              <strong>Espace sécurisé</strong>
              <small>Votre activité centralisée</small>
            </span>
          </div>
        </div>
      </section>

      <section className="cf-activity-section">
        <div className="cf-section-heading">
          <div className="cf-section-title">
            <span className="cf-section-kicker">
              <span className="cf-live-indicator" />
              VOTRE ACTIVITÉ
            </span>

            <h2>Vue d’ensemble</h2>

            <p className="cf-section-description">
              Retrouvez les indicateurs clés de votre clinique.
            </p>
          </div>

          <span className="cf-section-meta">
            <span className="cf-live-dot" />
            Statistiques du dashboard
          </span>
        </div>

        <div
          className="cf-stats-grid"
          aria-label="Statistiques de la clinique"
          aria-busy={loading}
        >
          {cards.map((card, index) => (
            <article
              className={`cf-stat-card cf-stat-${card.tone}`}
              key={card.label}
            >
              <div className="cf-stat-top">
                <div className="cf-stat-icon">
                  <Icon>{card.icon}</Icon>
                </div>

                <span className="cf-stat-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <p className="cf-stat-label">{card.label}</p>

              <strong className="cf-stat-value">
                {loading ? '—' : card.value}
              </strong>

              <div className="cf-stat-bottom">
                <span className="cf-stat-detail">
                  {card.detail}
                </span>

                <span className="cf-stat-accent" aria-hidden="true">
                  {card.icon}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cf-lower-grid">
        <article className="cf-panel cf-profile-card">
          <div className="cf-card-heading">
            <div>
              <span className="cf-section-kicker">
                VOTRE ESPACE
              </span>
              <h2>Profil de connexion</h2>
            </div>

            <span className="cf-heading-symbol" aria-hidden="true">
              ♙
            </span>
          </div>

          <div className="cf-profile-body">
            <div className="cf-profile-avatar">
              {firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="cf-profile-details">
              <span className="cf-profile-overline">
                Bienvenue dans votre espace
              </span>

              <h3>{user?.fullName || 'Utilisateur'}</h3>

              <p>
                Votre espace de travail ClinicFlow est prêt.
              </p>

              <span className="cf-role-badge">
                <span />
                {user?.role || 'staff'}
              </span>
            </div>
          </div>

          <div className="cf-profile-note">
            <span aria-hidden="true">✦</span>
            <p>
              Retrouvez les principales fonctionnalités de votre
              clinique depuis le menu de navigation.
            </p>
          </div>
        </article>

        <article className="cf-panel cf-work-card">
          <div className="cf-card-heading">
            <div>
              <span className="cf-section-kicker">
                POUR BIEN COMMENCER
              </span>
              <h2>Votre espace de travail</h2>
            </div>

            <span className="cf-heading-symbol" aria-hidden="true">
              ✚
            </span>
          </div>

          <div className="cf-work-list">
            <Link
              to="/patients"
              className="cf-work-item"
              aria-label="Ouvrir la gestion des patients"
            >
              <span className="cf-work-icon mint">♙</span>

              <span className="cf-work-copy">
                <strong>Patients</strong>
                <small>Consultez les dossiers enregistrés.</small>
              </span>

              <span className="cf-work-arrow">›</span>
            </Link>

            <Link
              to="/appointments"
              className="cf-work-item"
              aria-label="Ouvrir la gestion des rendez-vous"
            >
              <span className="cf-work-icon blue">▦</span>

              <span className="cf-work-copy">
                <strong>Rendez-vous</strong>
                <small>Gérez les consultations.</small>
              </span>

              <span className="cf-work-arrow">›</span>
            </Link>

            <div className="cf-work-item cf-account-item">
              <span className="cf-work-icon violet">♙</span>

              <span className="cf-work-copy">
                <strong>Votre compte</strong>
                <small>
                  Connecté en tant que {user?.fullName || 'Utilisateur'}.
                </small>
              </span>

              <span className="cf-account-label">Connecté</span>
            </div>
          </div>
        </article>
      </section>

      <footer className="cf-dashboard-footer">
        <div className="cf-footer-brand">
          <span className="cf-footer-logo">✚</span>
          <strong>ClinicFlow</strong>
        </div>

        <span>
          Une gestion médicale plus simple, au quotidien.
        </span>

        <span className="cf-footer-version">
          ESPACE MÉDICAL
        </span>
      </footer>
    </main>
  );
}

