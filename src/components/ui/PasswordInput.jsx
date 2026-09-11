import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export function PasswordInput({
  label,
  id,
  error,
  hint,
  className,
  required,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label ? (
        <span className="text-sm font-semibold text-ink-800">
          {label}
          {required ? <span className="ml-0.5 text-ember-600">*</span> : null}
        </span>
      ) : null}
      <span className="relative block">
        <input
          id={inputId}
          required={required}
          type={visible ? 'text' : 'password'}
          className={cn(
            'h-11 w-full rounded-xl border bg-white py-2 pl-3.5 pr-11 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-900/35',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-ink-900/10 focus:border-lagoon-500',
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-900/45 transition hover:text-lagoon-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error ? <span className="block text-xs font-medium text-red-600">{error}</span> : null}
      {!error && hint ? <span className="block text-xs text-ink-900/55">{hint}</span> : null}
    </label>
  );
}
