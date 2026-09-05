import { Spinner } from './Spinner';
import { cn } from '../../utils/cn';

export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div
      className={cn(
        'flex min-h-[220px] items-center justify-center rounded-3xl border border-ink-900/8 bg-white/70 shadow-soft',
        className
      )}
    >
      <Spinner label={label} />
    </div>
  );
}
