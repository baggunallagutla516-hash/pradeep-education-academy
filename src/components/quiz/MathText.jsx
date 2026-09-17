import { useMemo } from 'react';
import katex from 'katex';
import { cn } from '../../utils/cn';

const SUBSCRIPT_DIGITS = {
  0: '₀',
  1: '₁',
  2: '₂',
  3: '₃',
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
};

/** Whole-token chemical formula, e.g. O2, H2O, CO2, Ca(OH)2, 2H2O. */
const CHEM_FORMULA_TOKEN =
  /^(?:\d+)?(?:[A-Z][a-z]?\d*|\((?:[A-Z][a-z]?\d*)+\)\d*)+$/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toSubscriptDigits(digits) {
  return String(digits).replace(/[0-9]/g, (d) => SUBSCRIPT_DIGITS[d] ?? d);
}

function formatChemToken(token) {
  if (!/\d/.test(token) || /[₀-₉]/.test(token)) return token;
  if (!CHEM_FORMULA_TOKEN.test(token)) return token;
  // Skip codes like COVID19 (many bare letters, then trailing digits only).
  if (/^(?:[A-Z][a-z]?){4,}\d+$/.test(token)) return token;
  return token.replace(/([A-Za-z)])(\d+)/g, (_, prefix, digits) => prefix + toSubscriptDigits(digits));
}

/**
 * Pretty-print plain science text:
 * - H_2O / O_2 → H₂O / O₂
 * - O2, H2O, CO2, Ca(OH)2 → Unicode subscripts
 * Leaves prose and already-formatted Unicode alone.
 */
export function formatSciencePlainText(text) {
  const source = String(text ?? '');
  if (!source) return '';

  const withUnderscores = source.replace(/([A-Za-z)])_(\d+)/g, (_, prefix, digits) => {
    return prefix + toSubscriptDigits(digits);
  });

  return withUnderscores.replace(/\b(?=\d*[A-Z])[A-Za-z0-9()]{1,25}\b/g, formatChemToken);
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
 * Plain chemistry tokens (O2, H2O) get Unicode subscripts.
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

      return escapeHtml(formatSciencePlainText(part)).replace(/\n/g, '<br />');
    })
    .join('');
}

export function looksLikeMath(text) {
  const source = String(text ?? '');
  if (/\$|\\\(|\\\[|\\begin\{|\\frac|\\sqrt|_\{|\^\{/.test(source)) return true;
  if (/_[0-9]/.test(source)) return true;
  return /\b(?:\d+)?(?:[A-Z][a-z]?\d|\([A-Z][a-z]?\d*)/.test(source);
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
