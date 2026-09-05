import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-lagoon-600 text-white hover:bg-lagoon-700 shadow-lift focus-visible:outline-lagoon-500 disabled:bg-lagoon-400',
  secondary:
    'bg-white text-ink-900 border border-ink-900/10 hover:border-lagoon-400 hover:text-lagoon-700 shadow-soft',
  ghost: 'bg-transparent text-ink-800 hover:bg-lagoon-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ember: 'bg-ember-500 text-white hover:bg-ember-600 shadow-lift',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden
          />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
