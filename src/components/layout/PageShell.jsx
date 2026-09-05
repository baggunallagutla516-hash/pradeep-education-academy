import { cn } from '../../utils/cn';

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  embedded = false,
}) {
  return (
    <div
      className={cn(
        embedded
          ? 'w-full'
          : 'mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl animate-fade-up">
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-lagoon-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-base leading-relaxed text-ink-900/65">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
