import { useEffect, useState } from 'react';
import { Download, FileStack } from 'lucide-react';
import { worksheetApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils/media';
import { getErrorMessage } from '../utils/errors';
import { classLabel } from '../utils/classLabel';
import { formatBytes } from '../utils/formatBytes';
import { formatDateTime } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ExpandableText } from '../components/ui/ExpandableText';

function DownloadAction({ item }) {
  if (item.isNotYetOpen) {
    return (
      <p className="mt-4 text-sm text-ink-900/55">
        Download opens on {formatDateTime(item.startDate)}.
      </p>
    );
  }
  if (item.isClosed) {
    return (
      <p className="mt-4 text-sm text-ink-900/55">
        Download closed on {formatDateTime(item.endDate)}.
      </p>
    );
  }
  if (!item.fileUrl) return null;

  return (
    <a
      href={mediaUrl(item.fileUrl)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex"
      download={item.fileName || undefined}
    >
      <Button size="sm">
        <Download className="h-4 w-4" />
        Download
      </Button>
    </a>
  );
}

export function WorksheetsPage() {
  const { student } = useAuth();
  const [worksheets, setWorksheets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await worksheetApi.list();
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

  return (
    <PageShell
      embedded
      eyebrow="Resources"
      title="Worksheets & files"
      description="Download question papers, slides, and study resources for your class."
      actions={<Badge>{classLabel(student) || 'Student'}</Badge>}
    >
      {status === 'loading' ? <LoadingState label="Loading worksheets…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && worksheets.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={`No worksheets have been uploaded for ${classLabel(student) || 'your class'} yet. Check back soon.`}
          icon={FileStack}
        />
      ) : null}

      {status === 'ready' && worksheets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worksheets.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="relative aspect-[16/10] bg-ink-900/5">
                <img
                  src={mediaUrl(item.coverImageUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  {item.isNotYetOpen ? <Badge tone="ember">Not open yet</Badge> : null}
                  {item.isClosed ? <Badge tone="ink">Closed</Badge> : null}
                  {item.endDate && !item.isClosed && !item.isNotYetOpen ? (
                    <Badge tone="ink">Ends {formatDateTime(item.endDate)}</Badge>
                  ) : null}
                </div>
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                {item.description ? <ExpandableText text={item.description} /> : null}
                <p className="mt-3 text-xs text-ink-900/50">
                  {item.fileName || 'File'}
                  {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ''}
                </p>
                <DownloadAction item={item} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
