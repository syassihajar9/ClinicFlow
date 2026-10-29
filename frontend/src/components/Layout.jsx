
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦', end: true },
  { to: '/patients', label: 'Patients', icon: '♙' },
  { to: '/appointments', label: 'Rendez-vous', icon: '▣' },
  { to: '/users', label: 'Utilisateurs', icon: '♧', adminOnly: true },
];

const pageTitles = {
  '/dashboard': 'Vue d’ensemble',
  '/patients': 'Gestion des patients',
  '/appointments': 'Gestion des rendez-vous',
  '/users': 'Gestion des utilisateurs',
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: logoutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logoutUser();
    navigate('/', { replace: true });
  }

  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  const initials = (user?.fullName || 'ClinicFlow')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const currentTitle = pageTitles[location.pathname] || 'Espace de gestion';

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-icon" aria-hidden="true">✚</span>
          <div className="brand-text">
            <span className="brand-name">ClinicFlow</span>
            <span className="brand-caption">CARE MANAGEMENT</span>
          </div>
          <span className="brand-version">PRO</span>
        </div>

        <div className="nav-section">
          <div className="nav-label">MENU PRINCIPAL</div>

          <nav className="nav">
            {visibleNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
              >
                <span className="nav-item-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="nav-item-label">{item.label}</span>
                <span className="nav-item-arrow" aria-hidden="true">›</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-help">
          <div className="help-icon" aria-hidden="true">✦</div>
          <div>
            <strong>Besoin d’aide ?</strong>
            <p>Votre espace ClinicFlow</p>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{initials || 'CF'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user?.fullName || 'Utilisateur'}
            </div>
            <div className="sidebar-user-role">
              <span className="user-status-dot" />
              {user?.role === 'admin' ? 'Administrateur' : 'Personnel'}
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={handleLogout}
            title="Déconnexion"
            aria-label="Déconnexion"
          >
            ↗
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              ☰
            </button>

            <div className="topbar-heading">
              <span className="topbar-kicker">CLINICFLOW / ESPACE DE TRAVAIL</span>
              <strong>{currentTitle}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="security-status">
              <span className="security-dot" />
              <span>Session sécurisée</span>
            </div>

            <div className="topbar-divider" />

            <div className="topbar-profile">
              <div className="topbar-avatar">{initials || 'CF'}</div>
              <div className="topbar-profile-info">
                <strong>{user?.fullName || 'Utilisateur'}</strong>
                <span>{user?.role === 'admin' ? 'Administrateur' : 'Personnel'}</span>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              <span aria-hidden="true">↗</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} ClinicFlow</span>
          <span>Gestion simplifiée · Soins mieux organisés</span>
        </footer>
      </main>
    </div>
  );
}
