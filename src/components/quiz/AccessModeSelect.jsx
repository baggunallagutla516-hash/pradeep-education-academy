import { Select } from '../ui/Select';

export function AccessModeSelect({ value, onChange, noun = 'item' }) {
  return (
    <Select
      label="How students open it"
      name="accessMode"
      value={value || 'both'}
      onChange={onChange}
      hint={
        value === 'code'
          ? `Students open this ${noun} by scanning the QR or entering the code.`
          : value === 'list'
            ? `Students open this ${noun} from their list.`
            : `Students can scan the QR, enter the code, or open this ${noun} from their list.`
      }
    >
      <option value="code">QR or code</option>
      <option value="list">Normal list</option>
      <option value="both">QR or code, and the list</option>
    </Select>
  );
}
