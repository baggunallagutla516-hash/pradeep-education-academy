import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Collapse control on the header/nav divider junction (admin pattern). */
export function SidebarCollapseToggle({ expanded, onExpandedChange }) {
  return (
    <div className={cn('relative mb-3', expanded ? '-mx-3' : 'w-full')}>
      <div className={cn('h-px bg-ink-900/10', expanded ? 'mx-4' : 'mx-auto w-8')} />
      <button
        type="button"
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
        className="absolute right-0 top-1/2 z-50 flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink-900/10 bg-white text-ink-800/60 shadow-soft transition hover:border-lagoon-300 hover:text-lagoon-700"
      >
        {expanded ? (
          <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
        ) : (
          <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
