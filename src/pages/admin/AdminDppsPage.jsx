import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatDate, formatMarks } from '../../utils/quizFormat';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';

export function AdminDppsPage() {
  const [dpps, setDpps] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.dpps();
      setDpps(data.data.dpps);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load DPPs.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const classes = useMemo(() => {
    const seen = new Map();
    dpps.forEach((item) => {
      if (item.studentClass && !seen.has(item.studentClass)) {
        seen.set(item.studentClass, classLabel(item));
      }
    });
    return [...seen].map(([id, name]) => ({ id, name }));
  }, [dpps]);

  const visible = classFilter ? dpps.filter((item) => item.studentClass === classFilter) : dpps;

  async function handleDelete(item) {
    const warning = item.attemptCount
      ? `Delete "${item.title}"? ${item.attemptCount} student result(s) will be deleted too.`
      : `Delete "${item.title}"?`;
    if (!window.confirm(warning)) return;

    setBusyId(item.id);
    setActionError('');
    try {
      await adminApi.deleteDpp(item.id);
      setDpps((prev) => prev.filter((d) => d.id !== item.id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete this DPP.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="D.P.P."
      description="Daily practice problems. Build the questions here and students of that class attempt them online."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          {classes.length > 1 ? (
            <div className="w-full min-w-[11rem] sm:w-48">
              <Select
                label="Class filter"
                name="classFilter"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
              >
                <option value="">All classes</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
          <Link to="/admin/dpps/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New DPP
            </Button>
          </Link>
        </div>
      }
    >
      {actionError ? (
        <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading DPPs…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && dpps.length === 0 ? (
        <EmptyState
          title="No DPPs yet"
          description="Create a daily practice problem set, add MCQ questions, and publish it to a class."
          icon={ClipboardList}
          action={
            <Link to="/admin/dpps/new">
              <Button>Create DPP</Button>
            </Link>
          }
        />
      ) : null}
      {status === 'ready' && dpps.length > 0 && visible.length === 0 ? (
        <EmptyState
          title="Nothing for this class"
          description="No DPPs have been created for the selected class yet."
          icon={ClipboardList}
        />
      ) : null}

      {status === 'ready' && visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <Card key={item.id}>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge tone={item.isPublished ? 'lagoon' : 'ink'}>
                  {item.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <Badge tone="ink">{classLabel(item)}</Badge>
                <Badge tone="ember">{formatDate(item.practiceDate)}</Badge>
              </div>

              <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
              {item.subject ? (
                <p className="mt-0.5 text-sm font-medium text-lagoon-700">{item.subject}</p>
              ) : null}
              {item.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-ink-900/60">{item.description}</p>
              ) : null}

              <p className="mt-3 text-xs text-ink-900/55">
                {item.questionCount} question{item.questionCount === 1 ? '' : 's'} ·{' '}
                {formatMarks(item.totalMarks)} marks · {item.durationMinutes} min ·{' '}
                {item.attemptCount} attempt{item.attemptCount === 1 ? '' : 's'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/admin/dpps/${item.id}/results`}>
                  <Button variant="secondary" size="sm">
                    <BarChart3 className="h-4 w-4" />
                    Results
                  </Button>
                </Link>
                <Link to={`/admin/dpps/${item.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  loading={busyId === item.id}
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
