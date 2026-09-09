import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

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

export function AdminEducatorDetailPage() {
  const { id } = useParams();
  const [educator, setEducator] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.educator(id);
      setEducator(data.data.educator);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load educator.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <PageShell
      embedded
      eyebrow="Educators"
      title={educator?.fullName || 'Educator'}
      description="View-only educator profile. Use Edit to change details."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/educators">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {educator ? (
            <Link to={`/admin/educators/${educator.id}/edit`}>
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

      {status === 'ready' && educator ? (
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone={educator.isActive ? 'lagoon' : 'ink'}>
              {educator.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {educator.schoolName ? <Badge>{educator.schoolName}</Badge> : null}
          </div>
          <dl>
            <Row label="Full name" value={educator.fullName} />
            <Row label="Email" value={educator.email} />
            <Row label="Phone" value={educator.phone} />
            <Row label="School" value={educator.schoolName} />
            <Row label="Member since" value={formatDate(educator.createdAt)} />
            <Row label="Last login" value={formatDate(educator.lastLoginAt)} />
          </dl>
        </Card>
      ) : null}
    </PageShell>
  );
}
