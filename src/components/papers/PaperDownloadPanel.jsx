import { useMemo, useState } from 'react';
import { Download, IndianRupee } from 'lucide-react';
import { mediaUrl } from '../../utils/media';
import { formatDateTime } from '../../utils/quizFormat';
import { formatRupees, sumSelectedAmounts } from '../../utils/paperPricing';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UpiPaymentModal } from './UpiPaymentModal';

function PriceBadge({ item }) {
  if (!item.needsPayment) {
    return <Badge tone="lagoon">Free of cost</Badge>;
  }
  if (item.isPurchased || item.paymentStatus === 'confirmed') {
    return <Badge tone="lagoon">Unlocked</Badge>;
  }
  if (item.isPaymentPending || item.paymentStatus === 'pending') {
    return <Badge tone="ember">Awaiting admin</Badge>;
  }
  return (
    <Badge tone="ember">
      {item.priceLabel}
      {item.priceCaption ? ` · ${item.priceCaption}` : ''}
    </Badge>
  );
}

function SingleDownload({ item }) {
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
  if (item.fileUrl) {
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
  if (item.isPaymentPending || item.paymentStatus === 'pending') {
    return (
      <p className="mt-4 text-sm text-ink-900/55">
        UTR submitted{item.paymentUtr ? ` (${item.paymentUtr})` : ''}. Waiting for admin to enable
        download.
      </p>
    );
  }
  return null;
}

/**
 * Multi-select + UPI pay bar for downloadable papers.
 * contentType: 'unit-test' | 'worksheet' | 'cet' | 'slip-test'
 */
export function PaperDownloadPanel({ items, contentType, onItemsUpdated, renderCard }) {
  const [selected, setSelected] = useState(() => new Set());
  const [payItems, setPayItems] = useState(null);

  const payableItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.needsPayment &&
          !item.isPurchased &&
          item.paymentStatus !== 'confirmed' &&
          !item.isNotYetOpen &&
          !item.isClosed
      ),
    [items]
  );

  const selectedItems = useMemo(
    () => payableItems.filter((item) => selected.has(item.id)),
    [payableItems, selected]
  );

  const total = sumSelectedAmounts(selectedItems);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function payOne(item) {
    setPayItems([{ ...item, contentType }]);
  }

  function paySelected() {
    if (!selectedItems.length) return;
    setPayItems(selectedItems.map((item) => ({ ...item, contentType })));
  }

  function handleSubmitted(submitted) {
    setSelected(new Set());
    onItemsUpdated?.(submitted);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const pending = item.isPaymentPending || item.paymentStatus === 'pending';
          const canSelect =
            item.needsPayment &&
            !item.isPurchased &&
            item.paymentStatus !== 'confirmed' &&
            !item.isNotYetOpen &&
            !item.isClosed;

          return renderCard({
            item,
            priceBadge: <PriceBadge item={item} />,
            selection: canSelect ? (
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-ink-900/70">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-900/30 text-lagoon-700 focus:ring-lagoon-600"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                />
                Select for UPI payment
              </label>
            ) : null,
            action: (
              <>
                <SingleDownload item={item} />
                {canSelect && !item.fileUrl ? (
                  <Button type="button" size="sm" className="mt-4" onClick={() => payOne(item)}>
                    <IndianRupee className="h-4 w-4" />
                    {pending ? 'Update UTR' : `Pay ${item.priceLabel}`}
                  </Button>
                ) : null}
              </>
            ),
          });
        })}
      </div>

      {selectedItems.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/10 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-900/70">
              <span className="font-semibold text-ink-900">{selectedItems.length}</span> paper
              {selectedItems.length === 1 ? '' : 's'} · Total{' '}
              <span className="font-semibold text-ink-900">{formatRupees(total)}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
              <Button type="button" size="sm" onClick={paySelected}>
                <IndianRupee className="h-4 w-4" />
                Pay {formatRupees(total)} via UPI
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {payItems ? (
        <UpiPaymentModal
          items={payItems}
          onClose={() => setPayItems(null)}
          onSubmitted={handleSubmitted}
        />
      ) : null}
    </>
  );
}

export function PaperPriceBadge({ item }) {
  return <PriceBadge item={item} />;
}
