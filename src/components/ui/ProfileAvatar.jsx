import { UserRound } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-xl',
  xl: 'h-24 w-24 text-2xl',
};

/**
 * Circular profile photo with initials / icon fallback.
 */
export function ProfileAvatar({
  src,
  name = '',
  size = 'md',
  className,
  alt,
}) {
  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-lagoon-100 text-lagoon-800 ring-2 ring-white shadow-soft',
        SIZE_CLASS[size] || SIZE_CLASS.md,
        className
      )}
      aria-hidden={!src && !name}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Profile photo'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display font-bold">
          {initials || <UserRound className="h-[45%] w-[45%]" strokeWidth={2.25} />}
        </span>
      )}
    </div>
  );
}
