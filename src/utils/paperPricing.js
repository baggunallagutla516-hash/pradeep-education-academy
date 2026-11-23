export const PAPER_PRICE_OPTIONS = [
  {
    value: 'free',
    amount: 0,
    label: 'Free of cost',
    caption: 'Free of cost',
  },
];

/** Convert stored priceType ("free" | "30" | "150") to a number for inputs. */
export function priceTypeToAmount(priceType) {
  if (priceType === undefined || priceType === null || priceType === '' || priceType === 'free') {
    return 0;
  }
  const n = Number(priceType);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/** Convert a manual amount to API priceType. */
export function amountToPriceType(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 'free';
  return String(Math.round(n));
}

export function formatRupees(amount) {
  const n = Number(amount) || 0;
  return `Rs. ${n}/-`;
}

export function sumSelectedAmounts(items) {
  return items.reduce((sum, item) => sum + (Number(item.priceAmount) || 0), 0);
}

export function qrImageUrl(upiUri, size = 220) {
  const data = encodeURIComponent(upiUri || '');
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}
