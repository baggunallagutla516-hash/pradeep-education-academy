import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';
import { PageShell } from './layout/PageShell';

export function ProtectedRoute({ children }) {
  const { status, error, refresh } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <PageShell title="Checking your session" description="Please wait a moment.">
        <LoadingState label="Verifying login…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell title="Session check failed" description="We could not verify your login.">
        <ErrorState description={error} onRetry={refresh} />
      </PageShell>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
