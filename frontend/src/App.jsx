
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Profile from './pages/Profile';
import PrivateRoute from './routes/PrivateRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import UsersPage from './pages/Users';

export default function App() {
  return (
    <Routes>
      {/* Connexion */}
      <Route path="/" element={<Login />} />

      {/* Ancienne URL de connexion */}
      <Route
        path="/login"
        element={<Navigate to="/" replace />}
      />

      {/* Toutes les pages privées */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Tableau de bord */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Patients */}
        <Route
          path="/patients"
          element={<Patients />}
        />

        {/* Rendez-vous */}
        <Route
          path="/appointments"
          element={<Appointments />}
        />

        {/* Utilisateurs : administrateur uniquement */}
        <Route
          path="/users"
          element={
            <PrivateRoute roles={['admin']}>
              <UsersPage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* URL inconnue */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
