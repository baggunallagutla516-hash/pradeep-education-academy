import { cn } from '../../utils/cn';

export function Badge({ children, tone = 'lagoon', className }) {
  const tones = {
    lagoon: 'bg-lagoon-100 text-lagoon-800',
    ember: 'bg-ember-400/20 text-ember-700',
    ink: 'bg-ink-900/8 text-ink-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
