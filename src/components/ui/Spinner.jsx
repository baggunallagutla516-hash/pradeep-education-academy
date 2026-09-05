import { cn } from '../../utils/cn';

export function Spinner({ className, label = 'Loading' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-lagoon-200 border-t-lagoon-600" />
      <span className="text-sm font-medium text-ink-900/65">{label}</span>
    </div>
  );
}
