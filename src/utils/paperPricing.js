export const PAPER_PRICE_OPTIONS = [
  {
    value: 'free',
    amount: 0,
    label: 'Free of cost',
    caption: 'Free of cost',
  },
  {
    value: '30',
    amount: 30,
    label: 'Rs. 30/-',
    caption: 'Question paper',
  },
  {
    value: '25',
    amount: 25,
    label: 'Rs. 25/-',
    caption: 'Marking scheme',
  },
  {
    value: '20',
    amount: 20,
    label: 'Rs. 20/-',
    caption: 'Blue Print',
  },
];

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
