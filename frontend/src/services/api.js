
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isSessionRequest = requestUrl.includes('/auth/me');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/') {
        window.location.replace('/');
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  if (!error.response) {
    return 'Serveur injoignable. Vérifiez que le backend est démarré.';
  }

  if (error.response.status === 401) {
    return 'Identifiants incorrects ou session expirée.';
  }

  if (error.response.status === 403) {
    return "Vous n'avez pas l'autorisation d'effectuer cette action.";
  }

  if (error.response.status >= 500) {
    return 'Une erreur est survenue sur le serveur. Réessayez plus tard.';
  }

  return error.response.data?.message || 'Une erreur est survenue.';
}

export default api;
