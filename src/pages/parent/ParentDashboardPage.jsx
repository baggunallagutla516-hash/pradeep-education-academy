import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useParentAuth } from '../../context/ParentAuthContext';
import { parentApi } from '../../api/parentApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

export function ParentDashboardPage() {
  const { parent } = useParentAuth();
  const [children, setChildren] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const { data } = await parentApi.children();
      setChildren(data.data.children || []);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load linked children.'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      embedded
      eyebrow="Parent"
      title={`Hello, ${parent?.fullName?.split(' ')[0] || 'parent'}`}
      description="Students linked to your account by the academy admin."
    >
      {status === 'loading' ? <LoadingState label="Loading children…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' && children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students linked yet"
          description="Ask the academy admin to link your child’s student account to this parent login."
        />
      ) : null}

      {status === 'ready' && children.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-ink-900">{child.fullName}</h2>
                  <p className="mt-1 truncate text-sm text-ink-900/55">{child.email}</p>
                </div>
                <Badge>{classLabel(child)}</Badge>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-900/55">Phone</dt>
                  <dd className="font-medium text-ink-900">{child.phone}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-900/55">School</dt>
                  <dd className="font-medium text-ink-900">
                    {child.schoolName?.trim() || 'Not provided'}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <Link to={`/parent/children/${child.id}`}>
                  <Button variant="secondary" size="sm" fullWidth>
                    View details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {status === 'ready' ? (
        <Alert type="info" title="Need a change?" className="mt-6">
          Parent–student links are managed by admin only. Contact the academy if a child is missing.
        </Alert>
      ) : null}
    </PageShell>
  );
}
