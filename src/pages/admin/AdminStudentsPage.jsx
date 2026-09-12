import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
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

export function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load(page = 1, limit = pageSize) {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.students({
        page,
        limit,
        q: q.trim() || undefined,
        status: statusFilter || undefined,
      });
      setStudents(data.data.students);
      setPagination(data.data.pagination);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load students.'));
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePageSizeChange(event) {
    const next = Number(event.target.value) || 10;
    setPageSize(next);
    load(1, next);
  }

  async function toggleActive(student) {
    setActionError('');
    setBusyId(student.id);
    try {
      const { data } = await adminApi.setStudentActive(student.id, !student.isActive);
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? data.data.student : s))
      );
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update student status.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(student) {
    if (
      !window.confirm(
        `Delete ${student.fullName}? They will be removed from the list and cannot log in.`
      )
    ) {
      return;
    }
    setActionError('');
    setBusyId(student.id);
    try {
      await adminApi.deleteStudent(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 1) - 1),
      }));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete student.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Students"
      description="Search registered students, activate or deactivate accounts, or soft-delete a student."
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
              placeholder="Name, email, phone, Registration ID, school"
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

      {status === 'loading' ? <LoadingState label="Loading students…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={() => load(pagination.page)} /> : null}

      {status === 'ready' && students.length === 0 ? (
        <EmptyState title="No students found" description="Try a different search or status filter." />
      ) : null}

      {status === 'ready' && students.length > 0 ? (
        <div className="space-y-3">
          {students.map((student) => (
            <Card
              key={student.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-bold text-ink-900">{student.fullName}</p>
                  <Badge tone={student.isActive ? 'lagoon' : 'ink'}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge>{classLabel(student)}</Badge>
                </div>
                <p className="mt-1 truncate text-sm text-ink-900/60">
                  {student.registrationId ? `${student.registrationId} · ` : ''}
                  {student.email} · {student.phone}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/admin/students/${student.id}`}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </Link>
                <Link to={`/admin/students/${student.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant={student.isActive ? 'danger' : 'primary'}
                  loading={busyId === student.id}
                  onClick={() => toggleActive(student)}
                >
                  {student.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={busyId === student.id}
                  onClick={() => handleDelete(student)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}

          {pagination.total > 0 ? (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-900/55">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-ink-900/65">
                  <span className="whitespace-nowrap">Per page</span>
                  <select
                    className="h-9 rounded-xl border border-ink-900/10 bg-white px-2.5 text-sm text-ink-900 shadow-sm"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    aria-label="Results per page"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </label>
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
