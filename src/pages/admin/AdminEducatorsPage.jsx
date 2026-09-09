import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';

export function AdminEducatorsPage() {
  const [educators, setEducators] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load(page = 1) {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.educators({
        page,
        limit: 20,
        q: q.trim() || undefined,
        status: statusFilter || undefined,
      });
      setEducators(data.data.educators);
      setPagination(data.data.pagination);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load educators.'));
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleActive(educator) {
    setActionError('');
    setBusyId(educator.id);
    try {
      const { data } = await adminApi.setEducatorActive(educator.id, !educator.isActive);
      setEducators((prev) =>
        prev.map((e) => (e.id === educator.id ? data.data.educator : e))
      );
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update educator status.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(educator) {
    if (
      !window.confirm(
        `Delete ${educator.fullName}? They will be removed from the list and cannot log in.`
      )
    ) {
      return;
    }
    setActionError('');
    setBusyId(educator.id);
    try {
      await adminApi.deleteEducator(educator.id);
      setEducators((prev) => prev.filter((e) => e.id !== educator.id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 1) - 1),
      }));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete educator.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Educators"
      description="Search registered educators, activate or deactivate accounts, or remove an educator."
    >
      <Card className="mb-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            load(1);
          }}
        >
          <div className="flex-1">
            <Input
              label="Search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, email, phone, school"
            />
          </div>
          <div className="sm:w-44">
            <Select
              label="Status"
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <Button type="submit">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>

      {actionError ? (
        <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading educators…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={() => load(pagination.page)} /> : null}

      {status === 'ready' && educators.length === 0 ? (
        <EmptyState title="No educators found" description="Try a different search or status filter." />
      ) : null}

      {status === 'ready' && educators.length > 0 ? (
        <div className="space-y-3">
          {educators.map((educator) => (
            <Card
              key={educator.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-bold text-ink-900">{educator.fullName}</p>
                  <Badge tone={educator.isActive ? 'lagoon' : 'ink'}>
                    {educator.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {educator.schoolName ? <Badge>{educator.schoolName}</Badge> : null}
                </div>
                <p className="mt-1 truncate text-sm text-ink-900/60">
                  {educator.email} · {educator.phone}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/admin/educators/${educator.id}`}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </Link>
                <Link to={`/admin/educators/${educator.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant={educator.isActive ? 'danger' : 'primary'}
                  loading={busyId === educator.id}
                  onClick={() => toggleActive(educator)}
                >
                  {educator.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={busyId === educator.id}
                  onClick={() => handleDelete(educator)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}

          {pagination.pages > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-ink-900/55">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => load(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => load(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}
