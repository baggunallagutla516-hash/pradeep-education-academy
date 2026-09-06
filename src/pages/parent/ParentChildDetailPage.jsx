import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { parentApi } from '../../api/parentApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

function DetailRow({ label, value }) {
  const display = value && String(value).trim() ? value : null;
  return (
    <div className="grid gap-1 border-b border-ink-900/8 py-3 last:border-0 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-ink-900/55">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">
        {display || <span className="text-ink-900/40">Not provided</span>}
      </dd>
    </div>
  );
}

export function ParentChildDetailPage() {
  const { studentId } = useParams();
  const [child, setChild] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await parentApi.child(studentId);
      setChild(data.data.child);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load student details.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  return (
    <PageShell
      embedded
      eyebrow="Child"
      title={child?.fullName || 'Student details'}
      description="Profile details for a student linked to your parent account."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {child ? <Badge>{classLabel(child)}</Badge> : null}
          <Link to="/parent/children">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading student…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' && child ? (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
              <UserRound className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-ink-900">{child.fullName}</h2>
              <p className="truncate text-sm text-ink-900/55">{child.email}</p>
            </div>
          </div>
          <dl>
            <DetailRow label="Full name" value={child.fullName} />
            <DetailRow label="Email" value={child.email} />
            <DetailRow label="Phone" value={child.phone} />
            <DetailRow label="Class" value={classLabel(child)} />
            <DetailRow label="School" value={child.schoolName} />
            <DetailRow label="Roll number" value={child.rollNumber} />
          </dl>
        </Card>
      ) : null}
    </PageShell>
  );
}
