import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { adminApi } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { data } = await adminApi.me();
      setAdmin(data.data.admin);
      setStatus('authenticated');
    } catch (err) {
      if (err.response?.status === 401) {
        setAdmin(null);
        setStatus('unauthenticated');
        setError(null);
        return;
      }
      setAdmin(null);
      setStatus('error');
      setError(getErrorMessage(err, 'Could not verify admin session.'));
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload) => {
    const { data } = await adminApi.login(payload);
    setAdmin(data.data.admin);
    setStatus('authenticated');
    setError(null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Logout failed. Please try again.'));
    } finally {
      setAdmin(null);
      setStatus('unauthenticated');
      setError(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      logout,
      refresh: bootstrap,
    }),
    [admin, status, error, login, logout, bootstrap]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
