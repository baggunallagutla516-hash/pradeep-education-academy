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

export function AdminStudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.student(id);
      setStudent(data.data.student);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load student.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <PageShell
      embedded
      eyebrow="Students"
      title={student?.fullName || 'Student'}
      description="View-only student profile. Use Edit to change details or manage parents."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/students">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {student ? (
            <Link to={`/admin/students/${student.id}/edit`}>
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

      {status === 'ready' && student ? (
        <>
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone={student.isActive ? 'lagoon' : 'ink'}>
                {student.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge>{classLabel(student)}</Badge>
            </div>
            <dl>
              <Row label="Full name" value={student.fullName} />
              <Row label="Email" value={student.email} />
              <Row label="Phone" value={student.phone} />
              <Row label="Class" value={classLabel(student)} />
              <Row label="School" value={student.schoolName} />
              <Row label="Roll number" value={student.rollNumber} />
              <Row label="Member since" value={formatDate(student.createdAt)} />
              <Row label="Last login" value={formatDate(student.lastLoginAt)} />
            </dl>
          </Card>

          <Card className="mt-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Parents</h2>
            <p className="mt-1 text-sm text-ink-900/55">
              Linked parents (read-only here). Open Edit to add or unlink parents.
            </p>

            {student.parents?.length ? (
              <ul className="mt-4 space-y-3">
                {student.parents.map((parent) => (
                  <li
                    key={parent.id}
                    className="rounded-2xl border border-ink-900/8 bg-sand-50/80 px-4 py-3"
                  >
                    <p className="font-semibold text-ink-900">{parent.fullName}</p>
                    <p className="text-sm text-ink-900/55">
                      {parent.email} · {parent.phone}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-900/50">No parents linked yet.</p>
            )}
          </Card>
        </>
      ) : null}
    </PageShell>
  );
}
