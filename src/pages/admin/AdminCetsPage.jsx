import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Download, ScrollText } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatBytes } from '../../utils/formatBytes';
import { chapterLabel } from '../../utils/chapterLabel';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpandableText } from '../../components/ui/ExpandableText';
import { Alert } from '../../components/ui/Alert';

export function AdminCetsPage() {
  const [cets, setCets] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.cets();
      setCets(data.data.cets);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load C.E.T. papers.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const classes = useMemo(() => {
    const seen = new Map();
    cets.forEach((item) => {
      if (item.studentClass && !seen.has(item.studentClass)) {
        seen.set(item.studentClass, classLabel(item));
      }
    });
    return [...seen].map(([id, name]) => ({ id, name }));
  }, [cets]);

  const visible = classFilter
    ? cets.filter((item) => item.studentClass === classFilter)
    : cets;

  async function handleDelete(id) {
    if (!window.confirm('Delete this C.E.T.? The file will be removed from storage.')) return;
    setBusyId(id);
    setActionError('');
    try {
      await adminApi.deleteCet(id);
      setCets((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete C.E.T.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleTogglePublish(item) {
    setBusyId(item.id);
    setActionError('');
    try {
      const formData = new FormData();
      formData.append('isPublished', item.isPublished ? 'false' : 'true');
      const { data } = await adminApi.updateCet(item.id, formData);
      setCets((prev) => prev.map((c) => (c.id === item.id ? data.data.cet : c)));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update publish status.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="C.E.T."
      description="Upload a Chapter End Test question paper. Students see the papers for their own class after login."
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
          <Link to="/admin/cets/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New C.E.T.
            </Button>
          </Link>
        </div>
      }
    >
      {actionError ? (
        <Alert
          type="error"
          title="Action failed"
          onClose={() => setActionError('')}
          className="mb-4"
        >
          {actionError}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading C.E.T. papers…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && cets.length === 0 ? (
        <EmptyState
          title="No C.E.T. papers yet"
          description="Pick a class and chapter, then upload the question paper as a PDF or Word file."
          icon={ScrollText}
          action={
            <Link to="/admin/cets/new">
              <Button>Upload C.E.T.</Button>
            </Link>
          }
        />
      ) : null}
      {status === 'ready' && cets.length > 0 && visible.length === 0 ? (
        <EmptyState
          title="Nothing for this class"
          description="No C.E.T. papers have been uploaded for the selected class yet."
          icon={ScrollText}
        />
      ) : null}

      {status === 'ready' && visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              {item.coverImageUrl ? (
                <img
                  src={mediaUrl(item.coverImageUrl)}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-lagoon-100 text-lagoon-700">
                  <ScrollText className="h-10 w-10" aria-hidden />
                </div>
              )}
              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone={item.isPublished ? 'lagoon' : 'ink'}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge tone="ink">{classLabel(item)}</Badge>
                  <Badge tone="ember">{chapterLabel(item)}</Badge>
                </div>
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                {item.description ? (
                  <ExpandableText text={item.description} lines={2} />
                ) : (
                  <p className="mt-1 text-sm text-ink-900/60">{item.fileName}</p>
                )}
                {item.fileName ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-900/50">
                    <Download className="h-3.5 w-3.5" />
                    {item.fileName}
                    {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ''}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busyId === item.id}
                    onClick={() => handleTogglePublish(item)}
                  >
                    {item.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Link to={`/admin/cets/${item.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={busyId === item.id}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
