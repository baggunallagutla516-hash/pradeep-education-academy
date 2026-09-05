import { cn } from '../../utils/cn';

export function Card({ children, className, as: Component = 'div', ...props }) {
  return (
    <Component
      className={cn(
        'rounded-3xl border border-ink-900/8 bg-white/85 p-6 shadow-soft backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
