import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, X } from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';
import { getErrorMessage } from '../../utils/errors';
import { formatRupees, qrImageUrl } from '../../utils/paperPricing';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export function UpiPaymentModal({ items, onClose, onSubmitted }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [checkout, setCheckout] = useState(null);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setStatus('loading');
      setError('');
      try {
        const { data } = await paymentApi.checkout({
          items: items.map((item) => ({
            contentType: item.contentType,
            contentId: item.id || item.contentId,
          })),
        });
        if (!active) return;
        setCheckout(data.data);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setError(getErrorMessage(err, 'Could not start UPI payment.'));
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [items]);

  async function copyUpi() {
    if (!checkout?.upiId) return;
    try {
      await navigator.clipboard.writeText(checkout.upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function openUpiApp() {
    if (!checkout?.upiUri) return;
    window.location.href = checkout.upiUri;
  }

  async function submitUtr(event) {
    event.preventDefault();
    const cleaned = utr.trim().toUpperCase().replace(/\s+/g, '');
    if (cleaned.length < 6) {
      setError('Enter the UTR / UPI transaction reference from your payment app.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await paymentApi.submitUtr({
        items: (checkout?.items || items).map((item) => ({
          contentType: item.contentType,
          contentId: item.contentId || item.id,
        })),
        utr: cleaned,
        paymentNote: `UPI ${checkout?.totalAmount || ''}`,
      });
      setDone(true);
      onSubmitted?.(data.data.submitted || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not submit UTR.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/45 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upi-pay-title"
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-lift"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="upi-pay-title" className="font-display text-xl font-bold text-ink-900">
              Pay via UPI
            </h2>
            <p className="mt-1 text-sm text-ink-900/55">
              Pay the amount, then enter your UTR. Admin will enable download after verifying.
            </p>
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

        {error ? (
          <Alert type="error" title="Payment" className="mt-4" onClose={() => setError('')}>
            {error}
          </Alert>
        ) : null}

        {done ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-lagoon-50 px-4 py-4 text-sm text-lagoon-900">
              <p className="font-semibold">UTR submitted</p>
              <p className="mt-1 text-lagoon-900/80">
                Download will unlock after admin verifies your payment.
              </p>
            </div>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : null}

        {status === 'loading' && !done ? (
          <p className="mt-6 text-sm text-ink-900/60">Preparing UPI payment…</p>
        ) : null}

        {status === 'ready' && checkout && !done ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-lagoon-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-lagoon-800/70">
                Total to pay
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-lagoon-900">
                {formatRupees(checkout.totalAmount)}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-900/70">
                {checkout.items.map((item) => (
                  <li
                    key={`${item.contentType}-${item.contentId}`}
                    className="flex justify-between gap-3"
                  >
                    <span className="min-w-0 truncate">{item.title}</span>
                    <span className="shrink-0 font-semibold">{item.priceLabel}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-900/10 p-4">
              <img
                src={qrImageUrl(checkout.upiUri)}
                alt="UPI QR code"
                className="h-[180px] w-[180px] rounded-lg bg-white"
              />
              <p className="text-center text-xs text-ink-900/50">
                Scan with any UPI app, or open UPI on your phone.
              </p>
              <div className="flex w-full flex-wrap items-center justify-center gap-2">
                <code className="rounded-lg bg-ink-900/5 px-2.5 py-1.5 text-sm font-semibold text-ink-900">
                  {checkout.upiId}
                </code>
                <Button type="button" size="sm" variant="secondary" onClick={copyUpi}>
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <Button type="button" onClick={openUpiApp}>
              <ExternalLink className="h-4 w-4" />
              Open UPI payment
            </Button>

            <form className="space-y-3" onSubmit={submitUtr}>
              <Input
                label="UTR / UPI transaction ID"
                name="utr"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 123456789012"
                required
                hint="Find this in your UPI app after successful payment."
              />
              <Button type="submit" variant="secondary" loading={submitting}>
                <CheckCircle2 className="h-4 w-4" />
                Submit UTR for admin approval
              </Button>
            </form>
          </div>
        ) : null}

        {status === 'error' && !checkout && !done ? (
          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
