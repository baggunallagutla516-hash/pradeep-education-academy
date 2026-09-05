import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-lagoon-200 bg-lagoon-50 text-lagoon-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({ type = 'info', title, children, onClose, className }) {
  const Icon = icons[type] || Info;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm',
        styles[type],
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-0.5 opacity-90')}>{children}</div> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 opacity-70 transition hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
