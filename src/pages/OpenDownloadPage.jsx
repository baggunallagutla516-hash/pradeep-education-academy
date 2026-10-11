import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { mediaUrl } from '../utils/media';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

export function OpenDownloadPage({ api, dataKey, eyebrow, fallbackTitle }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setStatus('loading');
      setError('');
      try {
        const { data } = await api.get(id);
        if (!active) return;
        setItem(data.data[dataKey]);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setError(getErrorMessage(err, 'Could not open this.'));
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [api, dataKey, id]);

  const title = item?.title || fallbackTitle;

  return (
    <PageShell embedded eyebrow={eyebrow} title={title}>
      {status === 'loading' ? <LoadingState label="Opening…" /> : null}
      {status === 'error' ? <ErrorState description={error} /> : null}
      {status === 'ready' && item ? (
        <Card className="max-w-xl">
          {item.description ? <p className="text-sm text-ink-900/70">{item.description}</p> : null}
          {item.isNotYetOpen ? (
            <p className="mt-3 text-sm text-ink-900/60">Opens on {formatDateTime(item.startDate)}.</p>
          ) : null}
          {item.isClosed ? (
            <p className="mt-3 text-sm text-ink-900/60">Closed on {formatDateTime(item.endDate)}.</p>
          ) : null}
          {item.fileUrl && !item.isNotYetOpen && !item.isClosed ? (
            <a href={mediaUrl(item.fileUrl)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex" download={item.fileName || undefined}>
              <Button size="sm">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </a>
          ) : null}
        </Card>
      ) : null}
    </PageShell>
  );
}
