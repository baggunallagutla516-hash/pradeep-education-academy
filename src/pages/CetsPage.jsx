import { useEffect, useState } from 'react';
import { Download, ScrollText } from 'lucide-react';
import { cetApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils/media';
import { getErrorMessage } from '../utils/errors';
import { classLabel } from '../utils/classLabel';
import { formatBytes } from '../utils/formatBytes';
import { chapterLabel } from '../utils/chapterLabel';
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

export function CetsPage() {
  const { student } = useAuth();
  const [cets, setCets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await cetApi.list();
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

  return (
    <PageShell
      embedded
      eyebrow="Practice"
      title="C.E.T."
      description="Download Chapter End Test question papers for your class."
      actions={<Badge>{classLabel(student) || 'Student'}</Badge>}
    >
      {status === 'loading' ? <LoadingState label="Loading C.E.T. papers…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && cets.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={`No C.E.T. papers have been uploaded for ${classLabel(student) || 'your class'} yet. Check back soon.`}
          icon={ScrollText}
        />
      ) : null}

      {status === 'ready' && cets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cets.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="relative aspect-[16/10] bg-ink-900/5">
                {item.coverImageUrl ? (
                  <img
                    src={mediaUrl(item.coverImageUrl)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-lagoon-100 text-lagoon-700">
                    <ScrollText className="h-10 w-10" aria-hidden />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <Badge tone="ember">{chapterLabel(item)}</Badge>
                  {item.isNotYetOpen ? <Badge tone="ember">Not open yet</Badge> : null}
                  {item.isClosed ? <Badge tone="ink">Closed</Badge> : null}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                {item.description ? <ExpandableText text={item.description} /> : null}
                <p className="mt-3 text-xs text-ink-900/50">
                  {item.fileName || 'File'}
                  {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ''}
                </p>
                {item.endDate && !item.isClosed && !item.isNotYetOpen ? (
                  <p className="mt-1 text-xs text-ink-900/45">
                    Ends {formatDateTime(item.endDate)}
                  </p>
                ) : null}
                <DownloadAction item={item} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
