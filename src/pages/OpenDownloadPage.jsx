import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, IndianRupee } from 'lucide-react';
import { mediaUrl } from '../utils/media';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { UpiPaymentModal } from '../components/papers/UpiPaymentModal';
import { PaperPriceBadge } from '../components/papers/PaperDownloadPanel';

export function OpenDownloadPage({ api, dataKey, eyebrow, fallbackTitle, contentType }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await api.get(id);
      setItem(data.data[dataKey]);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not open this.'));
    }
  }

  useEffect(() => {
    load();
  }, [api, dataKey, id]);

  const title = item?.title || fallbackTitle;
  const pending = item?.isPaymentPending || item?.paymentStatus === 'pending';
  const canPay =
    contentType &&
    item?.needsPayment &&
    !item?.isPurchased &&
    !item?.isNotYetOpen &&
    !item?.isClosed &&
    !item?.fileUrl;

  function handleSubmitted(submitted) {
    const row = (submitted || []).find((entry) => String(entry.contentId) === String(id));
    if (row) {
      setItem((prev) =>
        prev
          ? {
              ...prev,
              isPurchased: Boolean(row.isPurchased),
              isPaymentPending: Boolean(row.isPaymentPending || row.paymentStatus === 'pending'),
              paymentStatus: row.paymentStatus || 'pending',
              paymentUtr: row.paymentUtr || '',
              fileUrl: row.fileUrl || '',
            }
          : prev
      );
      return;
    }
    load();
  }

  return (
    <PageShell embedded eyebrow={eyebrow} title={title}>
      {status === 'loading' ? <LoadingState label="Opening…" /> : null}
      {status === 'error' ? <ErrorState description={error} /> : null}
      {status === 'ready' && item ? (
        <Card className="max-w-xl">
          <div className="mb-3 flex flex-wrap gap-2">
            <PaperPriceBadge item={item} />
          </div>
          {item.description ? <p className="text-sm text-ink-900/70">{item.description}</p> : null}
          {item.isNotYetOpen ? (
            <p className="mt-3 text-sm text-ink-900/60">Opens on {formatDateTime(item.startDate)}.</p>
          ) : null}
          {item.isClosed ? (
            <p className="mt-3 text-sm text-ink-900/60">Closed on {formatDateTime(item.endDate)}.</p>
          ) : null}
          {pending && !item.fileUrl ? (
            <p className="mt-3 text-sm text-ink-900/60">
              UTR submitted{item.paymentUtr ? ` (${item.paymentUtr})` : ''}. Waiting for admin to
              enable download.
            </p>
          ) : null}
          {item.fileUrl && !item.isNotYetOpen && !item.isClosed ? (
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
          ) : null}
          {canPay ? (
            <Button type="button" size="sm" className="mt-4" onClick={() => setPaying(true)}>
              <IndianRupee className="h-4 w-4" />
              {pending ? 'Update UTR' : `Pay ${item.priceLabel} via UPI`}
            </Button>
          ) : null}
        </Card>
      ) : null}

      {paying && item && contentType ? (
        <UpiPaymentModal
          items={[{ ...item, contentType, contentId: item.id }]}
          onClose={() => setPaying(false)}
          onSubmitted={handleSubmitted}
        />
      ) : null}
    </PageShell>
  );
}
