import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

/** Rough chars that fit in one clamped line on a typical card width. */
const CHARS_PER_LINE = 55;

/**
 * Clamps long copy and shows Read more / Show less when the text is long
 * enough to overflow the clamp (length heuristic + live overflow check).
 */
export function ExpandableText({ text, lines = 3, className }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef(null);

  const content = String(text || '').trim();
  const longEnough = content.length > lines * CHARS_PER_LINE;
  const needsToggle = longEnough || overflows;

  useLayoutEffect(() => {
    setExpanded(false);
  }, [content, lines]);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;

    const measure = () => {
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    // Re-measure after fonts/layout settle so student/educator cards match admin.
    const frame = requestAnimationFrame(measure);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [content, lines, expanded]);

  if (!content) return null;

  return (
    <div className={cn('mt-1', className)}>
      <p
        ref={textRef}
        className={cn(
          'text-sm leading-relaxed text-ink-900/60',
          !expanded && (lines === 2 ? 'line-clamp-2' : 'line-clamp-3')
        )}
      >
        {content}
      </p>
      {needsToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-sm font-semibold text-lagoon-700 transition hover:text-lagoon-800"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      ) : null}
    </div>
  );
}
