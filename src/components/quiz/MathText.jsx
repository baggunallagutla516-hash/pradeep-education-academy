import { useMemo } from 'react';
import katex from 'katex';
import { cn } from '../../utils/cn';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** If the whole string looks like raw TeX (no $ wrappers), wrap it for display. */
function maybeAutoWrapTex(text) {
  const source = String(text ?? '').trim();
  if (!source) return '';
  if (/\$|\\\(|\\\[/.test(source)) return source;
  if (/\\begin\{|\\frac|\\sqrt|\\left|\\right|_\{|\^\{|\\mathrm|\\mathbf/.test(source)) {
    return `$$${source}$$`;
  }
  return source;
}

function renderTex(tex, displayMode) {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
    });
  } catch {
    return `<code>${escapeHtml(tex)}</code>`;
  }
}

/**
 * Renders plain text mixed with TeX:
 * - $inline$
 * - $$display$$
 * - \(inline\) / \[display\]
 * Also auto-wraps raw TeX that contains commands like \frac / \begin{bmatrix}.
 */
export function renderMixedMath(text) {
  const source = maybeAutoWrapTex(text);
  if (!source) return '';

  const pattern =
    /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;
  const parts = source.split(pattern);

  return parts
    .map((part) => {
      if (!part) return '';

      if (part.startsWith('$$') && part.endsWith('$$')) {
        return renderTex(part.slice(2, -2).trim(), true);
      }
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        return renderTex(part.slice(2, -2).trim(), true);
      }
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        return renderTex(part.slice(2, -2).trim(), false);
      }
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return renderTex(part.slice(1, -1).trim(), false);
      }

      return escapeHtml(part).replace(/\n/g, '<br />');
    })
    .join('');
}

export function looksLikeMath(text) {
  const source = String(text ?? '');
  return /\$|\\\(|\\\[|\\begin\{|\\frac|\\sqrt|_\{|\^\{/.test(source);
}

/** Renders quiz text with KaTeX math support. */
export function MathText({ text, className, as: Component = 'span' }) {
  const html = useMemo(() => renderMixedMath(text), [text]);
  if (!text) return null;

  return (
    <Component
      className={cn('math-text [&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Compact live preview under an admin text field. */
export function MathPreview({ text, label = 'Preview' }) {
  if (!looksLikeMath(text)) return null;

  return (
    <div className="mt-2 rounded-xl border border-lagoon-200 bg-lagoon-50/50 px-3 py-2">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-lagoon-800">{label}</p>
      <MathText text={text} className="block text-sm text-ink-900" />
    </div>
  );
}
