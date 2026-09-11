import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEducatorAuth } from '../../context/EducatorAuthContext';
import { EducatorSidebar, useEducatorSidebarExpanded } from './EducatorSidebar';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { PageShell } from '../layout/PageShell';
import { cn } from '../../utils/cn';

export function EducatorProtectedRoute({ children }) {
  const { status, error, refresh } = useEducatorAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <PageShell title="Checking educator session" description="Please wait.">
        <LoadingState label="Verifying educator login…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell title="Session check failed" description="Could not verify educator login.">
        <ErrorState description={error} onRetry={refresh} />
      </PageShell>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/educator/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function EducatorGuestRoute({ children }) {
  const { status, isAuthenticated } = useEducatorAuth();

  if (status === 'loading') {
    return (
      <PageShell title="Just a moment" description="Checking educator session.">
        <LoadingState label="Checking session…" />
      </PageShell>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/educator/dashboard" replace />;
  }

  return children;
}

export function EducatorLayout() {
  const [expanded, setExpanded] = useEducatorSidebarExpanded();

  return (
    <div className="min-h-screen bg-sand-50">
      <EducatorSidebar expanded={expanded} onExpandedChange={setExpanded} />
      <div
        className={cn(
          'min-h-screen transition-[padding] duration-200 ease-out',
          expanded ? 'pl-64' : 'pl-14'
        )}
      >
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
