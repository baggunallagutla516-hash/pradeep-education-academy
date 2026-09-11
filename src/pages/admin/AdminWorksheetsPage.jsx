import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatBytes } from '../../utils/formatBytes';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpandableText } from '../../components/ui/ExpandableText';
import { Alert } from '../../components/ui/Alert';

export function AdminWorksheetsPage() {
  const [worksheets, setWorksheets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.worksheets();
      setWorksheets(data.data.worksheets);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load worksheets.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this worksheet? The file will be removed from storage.')) return;
    setBusyId(id);
    setActionError('');
    try {
      await adminApi.deleteWorksheet(id);
      setWorksheets((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete worksheet.'));
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
      const { data } = await adminApi.updateWorksheet(item.id, formData);
      setWorksheets((prev) =>
        prev.map((w) => (w.id === item.id ? data.data.worksheet : w))
      );
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
      title="Worksheets & files"
      description="Upload study resources for a class. Students see items matching their class after login."
      actions={
        <Link to="/admin/worksheets/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New worksheet
          </Button>
        </Link>
      }
    >
      {actionError ? (
        <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading worksheets…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && worksheets.length === 0 ? (
        <EmptyState
          title="No worksheets yet"
          description="Upload a cover image and file for a class to get started."
          action={
            <Link to="/admin/worksheets/new">
              <Button>Upload worksheet</Button>
            </Link>
          }
        />
      ) : null}

      {status === 'ready' && worksheets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {worksheets.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <img
                src={mediaUrl(item.coverImageUrl)}
                alt=""
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone={item.isPublished ? 'lagoon' : 'ink'}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge tone="ink">{classLabel(item)}</Badge>
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
                  <Link to={`/admin/worksheets/${item.id}/edit`}>
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
