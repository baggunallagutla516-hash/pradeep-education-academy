import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/80 px-6 py-12 text-center',
        className
      )}
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-bold text-ink-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-900/65">{description}</p>
      ) : null}
      {onRetry ? (
        <Button className="mt-6" variant="secondary" onClick={onRetry}>
          {retryLabel ? null : <RefreshCw className="h-4 w-4" />}
          {retryLabel || 'Try again'}
        </Button>
      ) : null}
    </div>
  );
}
