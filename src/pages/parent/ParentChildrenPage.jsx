import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { parentApi } from '../../api/parentApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

export function ParentChildrenPage() {
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
      setError(getErrorMessage(err, 'Could not load children.'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      embedded
      eyebrow="Children"
      title="My children"
      description="Students linked to your parent account by the academy admin."
    >
      {status === 'loading' ? <LoadingState label="Loading children…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' && children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No linked students"
          description="Contact the academy admin to link your child’s student account."
        />
      ) : null}

      {status === 'ready' && children.length > 0 ? (
        <div className="space-y-3">
          {children.map((child) => (
            <Card
              key={child.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-ink-900">{child.fullName}</h2>
                  <Badge>{classLabel(child)}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-900/55">
                  {child.email} · {child.phone}
                </p>
              </div>
              <Link to={`/parent/children/${child.id}`}>
                <Button variant="secondary" size="sm">
                  View details & results
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
