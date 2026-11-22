import { useEffect, useState } from 'react';
import { CheckCircle2, IndianRupee, X } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { formatRupees } from '../../utils/paperPricing';
import { formatDateTime } from '../../utils/quizFormat';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { LoadingState } from '../ui/LoadingState';

function statusBadge(status) {
  if (status === 'confirmed') return <Badge tone="lagoon">Paid / unlocked</Badge>;
  if (status === 'pending') return <Badge tone="ember">UTR submitted</Badge>;
  if (status === 'rejected') return <Badge tone="ink">Rejected</Badge>;
  return <Badge tone="ink">Not paid</Badge>;
}

export function AdminPaperPaymentsDialog({ contentType, contentId, title, onClose }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [content, setContent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [busyKey, setBusyKey] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.contentPayments(contentType, contentId);
      setContent(data.data.content);
      setEntries(data.data.entries || []);
      setSummary(data.data.summary || null);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load payments.'));
    }
  }

  useEffect(() => {
    load();
  }, [contentType, contentId]);

  async function enableEntry(entry) {
    const key = `${entry.buyerType}:${entry.buyerId}`;
    setBusyKey(key);
    setError('');
    try {
      await adminApi.enableContentPayment(contentType, contentId, {
        buyerType: entry.buyerType,
        buyerId: entry.buyerId,
        utr: entry.utr || undefined,
      });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not enable payment.'));
    } finally {
      setBusyKey('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/45 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paper-payments-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-lift"
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink-900/8 px-5 py-4">
          <div>
            <h2 id="paper-payments-title" className="font-display text-xl font-bold text-ink-900">
              Payments
            </h2>
            <p className="mt-1 text-sm text-ink-900/55">
              {title || content?.title || 'Paper'}
              {content?.priceLabel ? ` · ${content.priceLabel}` : ''}
            </p>
            {summary ? (
              <p className="mt-2 text-xs text-ink-900/50">
                Pending {summary.pending} · Unlocked {summary.confirmed} · Not paid {summary.notPaid}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-900/50 hover:bg-ink-900/5 hover:text-ink-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <Alert type="error" title="Payments" className="mb-4" onClose={() => setError('')}>
              {error}
            </Alert>
          ) : null}

          {status === 'loading' ? <LoadingState label="Loading payments…" /> : null}
          {status === 'error' && !entries.length ? (
            <Button type="button" variant="secondary" size="sm" onClick={load}>
              Retry
            </Button>
          ) : null}

          {status === 'ready' && entries.length === 0 ? (
            <p className="text-sm text-ink-900/60">
              {content && !content.needsPayment
                ? 'This paper is free of cost — no payments to track.'
                : 'No students or educators found for this paper’s classes yet.'}
            </p>
          ) : null}

          {status === 'ready' && entries.length > 0 ? (
            <ul className="divide-y divide-ink-900/8">
              {entries.map((entry) => {
                const key = `${entry.buyerType}:${entry.buyerId}`;
                const canEnable = entry.status !== 'confirmed';
                return (
                  <li key={key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink-900">{entry.name}</p>
                        {statusBadge(entry.status)}
                        <Badge tone="ink">
                          {entry.buyerType === 'educator' ? 'Educator' : 'Student'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-900/50">
                        {[entry.className, entry.email].filter(Boolean).join(' · ')}
                      </p>
                      {entry.utr ? (
                        <p className="mt-1 text-sm text-ink-900/75">
                          UTR: <span className="font-mono font-semibold">{entry.utr}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-ink-900/45">No UTR submitted yet</p>
                      )}
                      {entry.submittedAt && entry.status === 'pending' ? (
                        <p className="mt-0.5 text-xs text-ink-900/45">
                          Submitted {formatDateTime(entry.submittedAt)}
                        </p>
                      ) : null}
                      {entry.amount ? (
                        <p className="mt-0.5 text-xs text-ink-900/45">{formatRupees(entry.amount)}</p>
                      ) : null}
                    </div>
                    {canEnable ? (
                      <Button
                        type="button"
                        size="sm"
                        loading={busyKey === key}
                        onClick={() => enableEntry(entry)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Enable payment
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-lagoon-700">
                        <IndianRupee className="h-4 w-4" />
                        Unlocked
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
