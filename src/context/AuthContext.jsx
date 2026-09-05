import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../utils/errors';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const { data } = await authApi.me();
      setStudent(data.data.student);
      setStatus('authenticated');
    } catch (err) {
      const statusCode = err.response?.status;
      if (statusCode === 401) {
        setStudent(null);
        setStatus('unauthenticated');
        setError(null);
        return;
      }

      setStudent(null);
      setStatus('error');
      setError(getErrorMessage(err, 'Could not verify your session.'));
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload);
    setStudent(data.data.student);
    setStatus('authenticated');
    setError(null);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    setStudent(data.data.student);
    setStatus('authenticated');
    setError(null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Logout failed. Please try again.'));
    } finally {
      setStudent(null);
      setStatus('unauthenticated');
      setError(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await authApi.updateMe(payload);
    setStudent(data.data.student);
    setError(null);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      student,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      register,
      logout,
      updateProfile,
      refresh: bootstrap,
    }),
    [student, status, error, login, register, logout, updateProfile, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
