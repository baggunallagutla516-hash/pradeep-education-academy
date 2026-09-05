import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminSidebar, useAdminSidebarExpanded } from './AdminSidebar';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { PageShell } from '../layout/PageShell';
import { cn } from '../../utils/cn';

export function AdminProtectedRoute({ children }) {
  const { status, error, refresh } = useAdminAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <PageShell title="Checking admin session" description="Please wait.">
        <LoadingState label="Verifying admin login…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell title="Session check failed" description="Could not verify admin login.">
        <ErrorState description={error} onRetry={refresh} />
      </PageShell>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function AdminGuestRoute({ children }) {
  const { status, isAuthenticated } = useAdminAuth();

  if (status === 'loading') {
    return (
      <PageShell title="Just a moment" description="Checking admin session.">
        <LoadingState label="Checking session…" />
      </PageShell>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export function AdminLayout() {
  const [expanded, setExpanded] = useAdminSidebarExpanded();

  return (
    <div className="min-h-screen bg-sand-50">
      <AdminSidebar expanded={expanded} onExpandedChange={setExpanded} />
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
