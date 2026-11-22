import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';
import { unitTestApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils/media';
import { getErrorMessage } from '../utils/errors';
import { classLabel } from '../utils/classLabel';
import { formatBytes } from '../utils/formatBytes';
import { formatDateTime } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ExpandableText } from '../components/ui/ExpandableText';
import { EnterCodeButton } from '../components/quiz/EnterCodeButton';
import { PaperDownloadPanel } from '../components/papers/PaperDownloadPanel';

export function UnitTestsPage() {
  const { student } = useAuth();
  const [unitTests, setUnitTests] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await unitTestApi.list();
      setUnitTests(data.data.unitTests);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load exams.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function applyUnlocked(submitted) {
    const byId = new Map(
      (submitted || [])
        .filter((row) => row.contentType === 'unit-test')
        .map((row) => [String(row.contentId), row])
    );
    if (!byId.size) {
      load();
      return;
    }
    setUnitTests((prev) =>
      prev.map((item) => {
        const row = byId.get(String(item.id));
        if (!row) return item;
        return {
          ...item,
          isPurchased: Boolean(row.isPurchased),
          isPaymentPending: Boolean(row.isPaymentPending || row.paymentStatus === 'pending'),
          paymentStatus: row.paymentStatus || 'pending',
          paymentUtr: row.paymentUtr || item.paymentUtr || '',
          fileUrl: row.fileUrl || '',
          fileName: row.fileName || item.fileName,
        };
      })
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Practice"
      title="EXAMS"
      description="Download the question paper for each exam of your class. Paid papers unlock after UPI payment."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <EnterCodeButton />
          <Badge>{classLabel(student) || 'Student'}</Badge>
        </div>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading exams…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && unitTests.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={`No exams have been uploaded for ${classLabel(student) || 'your class'} yet. Check back soon.`}
          icon={PenLine}
        />
      ) : null}

      {status === 'ready' && unitTests.length > 0 ? (
        <div className="pb-24">
          <PaperDownloadPanel
            items={unitTests}
            contentType="unit-test"
            onItemsUpdated={applyUnlocked}
            renderCard={({ item, priceBadge, selection, action }) => (
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
                      <PenLine className="h-10 w-10" aria-hidden />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {priceBadge}
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
                  {selection}
                  {action}
                </div>
              </Card>
            )}
          />
        </div>
      ) : null}
    </PageShell>
  );
}
