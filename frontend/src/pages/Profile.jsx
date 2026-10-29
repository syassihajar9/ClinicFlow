
import { useAuth } from '../context/AuthContext';
import { UserRound, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();

  const fullName = user?.fullName || user?.full_name || 'Utilisateur';
  const role = String(user?.role || 'staff').toLowerCase();

  const roleLabels = {
    admin: 'Administrateur',
    doctor: 'Médecin',
    medecin: 'Médecin',
    secretary: 'Secrétaire',
    secretaire: 'Secrétaire',
    staff: 'Personnel',
  };

  const roleLabel = roleLabels[role] || role;

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div>
          <span className="profile-eyebrow">ESPACE PERSONNEL</span>
          <h1>Mon compte</h1>
          <p>Consultez les informations de votre compte ClinicFlow.</p>
        </div>

        <Link to="/dashboard" className="profile-back-link">
          <ArrowLeft size={17} />
          Retour au tableau de bord
        </Link>
      </header>

      <section className="profile-card">
        <div className="profile-banner" />

        <div className="profile-main">
          <div className="profile-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-identity">
            <h2>{fullName}</h2>
            <span className="profile-role">
              <ShieldCheck size={15} />
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="profile-divider" />

        <h3>Informations du compte</h3>

        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="profile-info-icon">
              <UserRound size={19} />
            </span>
            <div>
              <span className="profile-info-label">Nom complet</span>
              <strong>{fullName}</strong>
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-icon">
              <Mail size={19} />
            </span>
            <div>
              <span className="profile-info-label">Adresse e-mail</span>
              <strong>{user?.email || 'Non renseignée'}</strong>
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-icon">
              <ShieldCheck size={19} />
            </span>
            <div>
              <span className="profile-info-label">Rôle</span>
              <strong>{roleLabel}</strong>
            </div>
          </div>
        </div>

        <p className="profile-security-note">
          Votre compte est associé à votre session ClinicFlow.
        </p>
      </section>
    </main>
  );
}
