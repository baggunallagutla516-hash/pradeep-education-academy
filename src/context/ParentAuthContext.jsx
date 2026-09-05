import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { parentApi } from '../api/parentApi';
import { getErrorMessage } from '../utils/errors';

const ParentAuthContext = createContext(null);

export function ParentAuthProvider({ children }) {
  const [parent, setParent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { data } = await parentApi.me();
      setParent(data.data.parent);
      setStatus('authenticated');
    } catch (err) {
      if (err.response?.status === 401) {
        setParent(null);
        setStatus('unauthenticated');
        setError(null);
        return;
      }
      setParent(null);
      setStatus('error');
      setError(getErrorMessage(err, 'Could not verify parent session.'));
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload) => {
    const { data } = await parentApi.login(payload);
    setParent(data.data.parent);
    setStatus('authenticated');
    setError(null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await parentApi.logout();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Logout failed. Please try again.'));
    } finally {
      setParent(null);
      setStatus('unauthenticated');
      setError(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await parentApi.updateMe(payload);
    setParent(data.data.parent);
    setError(null);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      parent,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      logout,
      updateProfile,
      refresh: bootstrap,
      setParent,
    }),
    [parent, status, error, login, logout, updateProfile, bootstrap]
  );

  return <ParentAuthContext.Provider value={value}>{children}</ParentAuthContext.Provider>;
}

export function useParentAuth() {
  const context = useContext(ParentAuthContext);
  if (!context) {
    throw new Error('useParentAuth must be used within ParentAuthProvider');
  }
  return context;
}
