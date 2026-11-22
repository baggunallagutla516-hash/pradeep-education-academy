import { Select } from '../ui/Select';
import { PAPER_PRICE_OPTIONS } from '../../utils/paperPricing';

export function PriceTypeSelect({ value, onChange, error, name = 'priceType' }) {
  return (
    <Select
      label="Price"
      name={name}
      value={value}
      onChange={onChange}
      required
      error={error}
      hint="Students and educators pay this amount via UPI before download (except Free of cost)."
    >
      {PAPER_PRICE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label} — {option.caption}
        </option>
      ))}
    </Select>
  );
}
