import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

function Row({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-ink-900/8 py-3 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm font-semibold text-ink-900/55">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">{value || '—'}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

export function AdminParentDetailPage() {
  const { id } = useParams();
  const [parent, setParent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.parent(id);
      setParent(data.data.parent);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load parent.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const children = parent?.children || [];

  return (
    <PageShell
      embedded
      eyebrow="Parents"
      title={parent?.fullName || 'Parent'}
      description="View parent profile and linked students. Use Edit to change details."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/parents">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {parent ? (
            <Link to={`/admin/parents/${parent.id}/edit`}>
              <Button size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          ) : null}
        </div>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' && parent ? (
        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone={parent.isActive ? 'lagoon' : 'ink'}>
                {parent.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <dl>
              <Row label="Full name" value={parent.fullName} />
              <Row label="Email" value={parent.email} />
              <Row label="Phone" value={parent.phone} />
              <Row
                label="Classes"
                value={
                  (parent.classes || [])
                    .map((item) => item.name || item.id)
                    .filter(Boolean)
                    .join(', ') || 'None assigned'
                }
              />
              <Row label="Member since" value={formatDate(parent.createdAt)} />
              <Row label="Last login" value={formatDate(parent.lastLoginAt)} />
            </dl>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold text-ink-900">Linked students</h2>
            {children.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  title="No linked students"
                  description="Link students from the edit page."
                />
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {children.map((child) => (
                  <li
                    key={child.id}
                    className="flex flex-col gap-2 rounded-xl border border-ink-900/8 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink-900">{child.fullName}</p>
                        <Badge tone={child.isActive ? 'lagoon' : 'ink'}>
                          {child.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {classLabel(child) ? <Badge>{classLabel(child)}</Badge> : null}
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-900/60">
                        {child.registrationId ? `${child.registrationId} · ` : ''}
                        {child.email}
                      </p>
                    </div>
                    <Link to={`/admin/students/${child.id}`}>
                      <Button variant="secondary" size="sm">
                        View student
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </PageShell>
  );
}
