import { useEffect, useState } from 'react';
import { Download, FileStack } from 'lucide-react';
import { worksheetApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils/media';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      actions={<Badge>{student?.studentClass || 'Student'}</Badge>}
    >
      {status === 'loading' ? <LoadingState label="Loading worksheets…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && worksheets.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={`No worksheets have been uploaded for ${student?.studentClass || 'your class'} yet. Check back soon.`}
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
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                {item.description ? (
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-900/60">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-ink-900/50">
                  {item.fileName || 'Download'}
                  {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ''}
                </p>
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
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
