import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { educatorApi } from '../api/educatorApi';
import { getErrorMessage } from '../utils/errors';

const EducatorAuthContext = createContext(null);

export function EducatorAuthProvider({ children }) {
  const [educator, setEducator] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { data } = await educatorApi.me();
      setEducator(data.data.educator);
      setStatus('authenticated');
    } catch (err) {
      if (err.response?.status === 401) {
        setEducator(null);
        setStatus('unauthenticated');
        setError(null);
        return;
      }
      setEducator(null);
      setStatus('error');
      setError(getErrorMessage(err, 'Could not verify educator session.'));
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload) => {
    const { data } = await educatorApi.login(payload);
    setEducator(data.data.educator);
    setStatus('authenticated');
    setError(null);
    return data;
  }, []);

  // New accounts start deactivated, so registration does not create a session.
  const register = useCallback(async (payload) => {
    const { data } = await educatorApi.register(payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await educatorApi.logout();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Logout failed. Please try again.'));
    } finally {
      setEducator(null);
      setStatus('unauthenticated');
      setError(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await educatorApi.updateMe(payload);
    setEducator(data.data.educator);
    setError(null);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      educator,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      register,
      logout,
      updateProfile,
      refresh: bootstrap,
      setEducator,
    }),
    [educator, status, error, login, register, logout, updateProfile, bootstrap]
  );

  return (
    <EducatorAuthContext.Provider value={value}>{children}</EducatorAuthContext.Provider>
  );
}

export function useEducatorAuth() {
  const context = useContext(EducatorAuthContext);
  if (!context) {
    throw new Error('useEducatorAuth must be used within EducatorAuthProvider');
  }
  return context;
}
