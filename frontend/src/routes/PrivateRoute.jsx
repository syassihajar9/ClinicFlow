
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // Attendre la vérification de la session
  if (loading) {
    return <p style={{ padding: 24 }}>Chargement…</p>;
  }

  // Si l'utilisateur n'est pas connecté, afficher la page Login (/)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Vérifier les autorisations
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Autoriser l'accès à la page demandée
  return children;
}
