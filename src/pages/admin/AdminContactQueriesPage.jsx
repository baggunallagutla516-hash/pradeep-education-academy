import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, Search, Trash2 } from 'lucide-react';
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

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
];

function statusTone(status) {
  if (status === 'new') return 'ember';
  if (status === 'replied') return 'lagoon';
  return 'ink';
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminContactQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [expandedId, setExpandedId] = useState('');

  async function load(page = 1, limit = pageSize) {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.contactQueries({
        page,
        limit,
        q: q.trim() || undefined,
        status: statusFilter || undefined,
      });
      setQueries(data.data.queries);
      setPagination(data.data.pagination);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load contact queries.'));
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

  async function openQuery(item) {
    const next = expandedId === item.id ? '' : item.id;
    setExpandedId(next);
    if (!next || item.status !== 'new') return;

    setBusyId(item.id);
    setActionError('');
    try {
      const { data } = await adminApi.contactQuery(item.id);
      setQueries((prev) => prev.map((qItem) => (qItem.id === item.id ? data.data.query : qItem)));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not mark query as read.'));
    } finally {
      setBusyId('');
    }
  }

  async function setQueryStatus(item, nextStatus) {
    if (item.status === nextStatus) return;
    setBusyId(item.id);
    setActionError('');
    try {
      const { data } = await adminApi.updateContactQuery(item.id, { status: nextStatus });
      setQueries((prev) => prev.map((qItem) => (qItem.id === item.id ? data.data.query : qItem)));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update status.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this contact query?')) return;
    setBusyId(id);
    setActionError('');
    try {
      await adminApi.deleteContactQuery(id);
      setQueries((prev) => prev.filter((qItem) => qItem.id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      if (expandedId === id) setExpandedId('');
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete query.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Contact queries"
      description="Messages submitted from the public contact form."
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
              placeholder="Name, email, phone, subject, message"
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
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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

      {status === 'loading' ? <LoadingState label="Loading queries…" /> : null}
      {status === 'error' ? (
        <ErrorState description={error} onRetry={() => load(pagination.page)} />
      ) : null}

      {status === 'ready' && queries.length === 0 ? (
        <EmptyState
          title="No contact queries"
          description="When someone submits the contact form, their message will appear here."
        />
      ) : null}

      {status === 'ready' && queries.length > 0 ? (
        <div className="space-y-3">
          {queries.map((item) => {
            const open = expandedId === item.id;
            return (
              <Card key={item.id} className="overflow-hidden p-0">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-ink-900/[0.02] sm:px-5"
                  onClick={() => openQuery(item)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-ink-900/45">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="font-display text-base font-bold text-ink-900">{item.subject}</p>
                    <p className="mt-0.5 text-sm text-ink-900/65">
                      {item.name}
                      <span className="text-ink-900/35"> · </span>
                      {item.email}
                      {item.phone ? (
                        <>
                          <span className="text-ink-900/35"> · </span>
                          {item.phone}
                        </>
                      ) : null}
                    </p>
                  </div>
                  <span className="mt-1 shrink-0 text-ink-900/40">
                    {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-ink-900/8 px-4 py-4 sm:px-5">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-900">
                      {item.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}
                        className="inline-flex"
                      >
                        <Button type="button" size="sm" variant="secondary">
                          <Mail className="h-4 w-4" />
                          Email
                        </Button>
                      </a>
                      {item.phone ? (
                        <a href={`tel:${item.phone}`} className="inline-flex">
                          <Button type="button" size="sm" variant="secondary">
                            <Phone className="h-4 w-4" />
                            Call
                          </Button>
                        </a>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="sm:w-44">
                        <Select
                          label="Update status"
                          name={`status-${item.id}`}
                          value={item.status}
                          disabled={busyId === item.id}
                          onChange={(e) => setQueryStatus(item, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        loading={busyId === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}

          {pagination.total > 0 ? (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-900/50">
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
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => load(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
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
