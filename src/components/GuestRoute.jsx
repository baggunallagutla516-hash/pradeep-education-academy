import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './ui/LoadingState';
import { PageShell } from './layout/PageShell';

export function GuestRoute({ children }) {
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return (
      <PageShell title="Just a moment" description="Checking if you are already signed in.">
        <LoadingState label="Checking session…" />
      </PageShell>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
