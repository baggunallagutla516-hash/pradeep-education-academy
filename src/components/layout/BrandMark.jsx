import { Link } from 'react-router-dom';
import { SITE } from '../../constants/site';
import { cn } from '../../utils/cn';
import { SiteLogoMark } from './SiteLogoMark';

export function BrandMark({ className, compact = false, tone = 'light' }) {
  const isDark = tone === 'dark';

  return (
    <Link to="/" className={cn('group inline-flex items-center gap-3', className)}>
      <SiteLogoMark className="transition group-hover:scale-[1.03]" />
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
