import { cn } from '../../utils/cn';

export function Input({
  label,
  id,
  error,
  hint,
  className,
  required,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label ? (
        <span className="text-sm font-semibold text-ink-800">
          {label}
          {required ? <span className="ml-0.5 text-ember-600">*</span> : null}
        </span>
      ) : null}
      <input
        id={inputId}
        required={required}
        className={cn(
          'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-900/35',
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
