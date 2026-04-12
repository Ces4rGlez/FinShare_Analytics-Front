import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('finshare_token'));
  const [loading, setLoading] = useState(true);

  // Inject token into axios every time it changes
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('finshare_token', token);
    } else {
      delete API.defaults.headers.common['Authorization'];
      localStorage.removeItem('finshare_token');
    }
  }, [token]);

  // On mount, fetch profile if token exists
  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data.data || res.data);
        } catch {
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const data = res.data.data || res.data;
    setToken(data.token || data.access_token);
    setUser(data.user || data);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await API.post('/auth/register', payload);
    const data = res.data.data || res.data;
    setToken(data.token || data.access_token);
    setUser(data.user || data);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await API.get('/auth/profile');
      setUser(res.data.data || res.data);
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
