import { Input } from '../ui/Input';
import { amountToPriceType, priceTypeToAmount } from '../../utils/paperPricing';

/**
 * Manual price amount (₹). 0 = free of cost; any positive amount goes to UPI checkout.
 * Still writes `priceType` for API compatibility ("free" or "50", "100", …).
 */
export function PriceTypeSelect({ value, onChange, error, name = 'priceType' }) {
  const amount = priceTypeToAmount(value);

  function handleChange(event) {
    const nextAmount = event.target.value;
    const synthetic = {
      ...event,
      target: {
        ...event.target,
        name,
        value: amountToPriceType(nextAmount === '' ? 0 : nextAmount),
      },
    };
    onChange(synthetic);
  }

  return (
    <Input
      label="Price (₹)"
      name={name}
      type="number"
      min={0}
      step={1}
      inputMode="numeric"
      value={amount}
      onChange={handleChange}
      required
      error={error}
      hint="Enter 0 for free, or any amount (e.g. 50, 100, 150). Paid papers open the UPI payment page before download."
    />
  );
}
