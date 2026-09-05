import { cn } from '../../utils/cn';

export function Textarea({
  label,
  id,
  error,
  hint,
  className,
  required,
  rows = 5,
  ...props
}) {
  const areaId = id || props.name;

  return (
    <label className="block space-y-1.5" htmlFor={areaId}>
      {label ? (
        <span className="text-sm font-semibold text-ink-800">
          {label}
          {required ? <span className="ml-0.5 text-ember-600">*</span> : null}
        </span>
      ) : null}
      <textarea
        id={areaId}
        rows={rows}
        required={required}
        className={cn(
          'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-900/35',
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-ink-900/10 focus:border-lagoon-500',
          className
        )}
        {...props}
      />
      {error ? <span className="block text-xs font-medium text-red-600">{error}</span> : null}
      {!error && hint ? <span className="block text-xs text-ink-900/55">{hint}</span> : null}
    </label>
  );
}
