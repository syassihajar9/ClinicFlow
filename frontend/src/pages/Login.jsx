
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Un utilisateur connecté accède directement au dashboard.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-brand">
          <span className="login-brand-icon">✚</span>
          <span>ClinicFlow</span>
        </div>

        <div className="login-hero">
          <span className="login-eyebrow">
            <span className="login-live-dot" />
            CLINIC MANAGEMENT PLATFORM
          </span>

          <h1>
            La gestion médicale,
            <br />
            <span>en toute simplicité.</span>
          </h1>

          <p>
            Une expérience de gestion plus fluide pour organiser
            les patients, les rendez-vous et l'activité de votre clinique.
          </p>

          <div className="login-feature-list">
            <div className="login-feature">
              <span>✓</span>
              Gestion centralisée des patients
            </div>
            <div className="login-feature">
              <span>✓</span>
              Suivi des rendez-vous
            </div>
            <div className="login-feature">
              <span>✓</span>
              Espace de travail sécurisé
            </div>
          </div>
        </div>

        <div className="login-showcase-footer">
          CLINICFLOW <span>·</span> SMARTER CLINIC MANAGEMENT
        </div>

        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />
      </section>

      <section className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-mobile-brand">
            <span className="login-brand-icon">✚</span>
            <strong>ClinicFlow</strong>
          </div>

          <div className="login-heading">
            <span className="login-form-eyebrow">VOTRE ESPACE</span>
            <h2>Bon retour parmi nous.</h2>
            <p>
              Connectez-vous pour accéder à votre espace de gestion.
            </p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <span>!</span>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Adresse e-mail</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  @
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clinicflow.local"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Mot de passe</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  ◆
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              className="login-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Connexion en cours…'
                : 'Accéder à mon espace'}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="login-security">
            <span className="login-security-icon">✓</span>
            <span>
              Connexion sécurisée à votre espace professionnel
            </span>
          </div>

          <p className="login-copyright">
            © {new Date().getFullYear()} ClinicFlow. Tous droits réservés.
          </p>
        </div>
      </section>
    </main>
  );
}
