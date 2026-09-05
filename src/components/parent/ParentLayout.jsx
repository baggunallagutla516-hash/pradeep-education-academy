import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useParentAuth } from '../../context/ParentAuthContext';
import { ParentSidebar, useParentSidebarExpanded } from './ParentSidebar';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { PageShell } from '../layout/PageShell';
import { cn } from '../../utils/cn';

export function ParentProtectedRoute({ children }) {
  const { status, error, refresh } = useParentAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <PageShell title="Checking parent session" description="Please wait.">
        <LoadingState label="Verifying parent login…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell title="Session check failed" description="Could not verify parent login.">
        <ErrorState description={error} onRetry={refresh} />
      </PageShell>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/parent/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function ParentGuestRoute({ children }) {
  const { status, isAuthenticated } = useParentAuth();

  if (status === 'loading') {
    return (
      <PageShell title="Just a moment" description="Checking parent session.">
        <LoadingState label="Checking session…" />
      </PageShell>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/parent/dashboard" replace />;
  }

  return children;
}

export function ParentLayout() {
  const [expanded, setExpanded] = useParentSidebarExpanded();

  return (
    <div className="min-h-screen bg-sand-50">
      <ParentSidebar expanded={expanded} onExpandedChange={setExpanded} />
      <div
        className={cn(
          'min-h-screen transition-[padding] duration-200 ease-out',
          expanded ? 'pl-56' : 'pl-14'
        )}
      >
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
