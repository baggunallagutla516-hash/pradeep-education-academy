import { mediaUrl } from '../../utils/media';
import { cn } from '../../utils/cn';

/**
 * Question / option image with tight bounds so large uploads don't blow up the UI.
 * - question: readable but capped
 * - option: compact thumbnail beside choice text
 */
export function QuestionMedia({ src, alt = 'Question image', className, size = 'question' }) {
  if (!src) return null;
  const resolved = mediaUrl(src);
  if (!resolved) return null;

  const isOption = size === 'option';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-ink-900/10 bg-slate-50',
        isOption ? 'mt-1.5 inline-block max-w-[11rem]' : 'mt-3 max-w-md',
        className
      )}
    >
      <img
        src={resolved}
        alt={alt}
        className={cn(
          'block object-contain',
          isOption
            ? 'max-h-24 w-auto max-w-[11rem]'
            : 'mx-auto max-h-44 w-auto max-w-full'
        )}
        loading="lazy"
      />
    </div>
  );
}
