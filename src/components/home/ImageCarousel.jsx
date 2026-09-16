import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Responsive horizontal carousel with auto-slide, arrows, dots, and swipe.
 * Shows ~1 card on mobile, ~2 on tablet, ~3 on desktop.
 */
export function ImageCarousel({
  items = [],
  renderItem,
  getKey = (item, index) => item?.id ?? index,
  autoPlayMs = 5500,
  className,
  emptyState,
  ariaLabel = 'Carousel',
}) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const count = items.length;
  const safeIndex = count ? Math.min(index, count - 1) : 0;

  const goTo = useCallback(
    (next) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);
  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  useEffect(() => {
    if (!count || paused || autoPlayMs <= 0) return undefined;
    const timer = window.setInterval(goNext, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [count, paused, autoPlayMs, goNext]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !count) return;
    const card = el.children[safeIndex];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }, [safeIndex, count]);

  function onTouchStart(event) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event) {
    if (touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  if (!count) {
    return emptyState || null;
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {items.map((item, i) => (
            <div
              key={getKey(item, i)}
              className="w-[min(100%,22rem)] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
              aria-hidden={i !== safeIndex}
            >
              {renderItem(item, i, { isActive: i === safeIndex, isLazy: i > 0 })}
            </div>
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink-900/10 bg-white/95 text-ink-800 shadow-soft transition hover:border-lagoon-300 hover:text-lagoon-700 sm:h-11 sm:w-11"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink-900/10 bg-white/95 text-ink-800 shadow-soft transition hover:border-lagoon-300 hover:text-lagoon-700 sm:h-11 sm:w-11"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Slide indicators">
          {items.map((item, i) => (
            <button
              key={getKey(item, i)}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-2.5 rounded-full transition',
                i === safeIndex ? 'w-7 bg-lagoon-600' : 'w-2.5 bg-ink-900/20 hover:bg-ink-900/35'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
