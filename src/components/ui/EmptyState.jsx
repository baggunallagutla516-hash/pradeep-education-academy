import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-900/15 bg-white/70 px-6 py-12 text-center shadow-soft',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-bold text-ink-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-900/60">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
