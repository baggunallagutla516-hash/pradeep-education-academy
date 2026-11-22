import { useCallback, useEffect, useState } from 'react';
import { FileStack } from 'lucide-react';
import { educatorApi } from '../../api/educatorApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatBytes } from '../../utils/formatBytes';
import { formatDateTime } from '../../utils/quizFormat';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpandableText } from '../../components/ui/ExpandableText';
import { PaperDownloadPanel } from '../../components/papers/PaperDownloadPanel';

export function EducatorWorksheetsPage() {
  const [worksheets, setWorksheets] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const params = classFilter ? { studentClass: classFilter } : undefined;
      const { data } = await educatorApi.worksheets(params);
      setWorksheets(data.data.worksheets || []);
      if (Array.isArray(data.data.classes) && data.data.classes.length > 0) {
        setClasses(data.data.classes);
      }
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load worksheets.'));
    }
  }, [classFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function applyUnlocked(unlocked) {
    const byId = new Map(
      (unlocked || [])
        .filter((row) => row.contentType === 'worksheet')
        .map((row) => [String(row.contentId), row])
    );
    if (!byId.size) {
      load();
      return;
    }
    setWorksheets((prev) =>
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
      eyebrow="Resources"
      title="Worksheets & files"
      description="Published resources for all classes. Paid papers unlock after UPI payment."
      actions={
        <div className="w-full min-w-[11rem] sm:w-48">
          <Select
            label="Class filter"
            name="studentClass"
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
      }
    >
      {status === 'loading' ? <LoadingState label="Loading worksheets…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && worksheets.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={
            classFilter
              ? `No published worksheets for ${
                  classes.find((c) => c.id === classFilter)?.name || 'this class'
                } yet.`
              : 'No published worksheets are available yet. Check back soon.'
          }
          icon={FileStack}
        />
      ) : null}

      {status === 'ready' && worksheets.length > 0 ? (
        <div className="pb-24">
          <PaperDownloadPanel
            items={worksheets}
            contentType="worksheet"
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
                      <FileStack className="h-10 w-10" aria-hidden />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {priceBadge}
                    <Badge>{classLabel(item)}</Badge>
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
