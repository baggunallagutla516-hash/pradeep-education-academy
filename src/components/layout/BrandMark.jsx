import { Link } from 'react-router-dom';
import { SITE } from '../../constants/site';
import { cn } from '../../utils/cn';

export function BrandMark({ className, compact = false, tone = 'light' }) {
  const isDark = tone === 'dark';

  return (
    <Link to="/" className={cn('group inline-flex items-center gap-3', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lagoon-600 text-white shadow-lift transition group-hover:scale-[1.03]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
          <path
            d="M5 17V7l7 5 7-5v10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="5.5" r="1.6" fill="#E8852F" />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            'block max-w-[11rem] font-display text-xs font-extrabold leading-snug tracking-tight sm:max-w-[16rem] sm:text-sm md:max-w-none md:text-base',
            isDark ? 'text-white' : 'title-mix animate-gradient-shift'
          )}
        >
          {SITE.name}
        </span>
        {!compact ? (
          <span className={cn('hidden text-xs sm:block', isDark ? 'text-white/55' : 'text-ink-900/55')}>
            {SITE.tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
