
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const token = localStorage.getItem('token');

      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');

        if (active) {
          setUser(res.data.user);
        }
      } catch (error) {
        localStorage.removeItem('token');

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth doit être utilisé à l’intérieur de AuthProvider.'
    );
  }

  return context;
}
