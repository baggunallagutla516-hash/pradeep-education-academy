import { useEffect } from 'react';

function isEditableField(target) {
  if (!(target instanceof Element)) return false;
  const field = target.closest('input, textarea, select, [contenteditable="true"]');
  if (!field) return false;
  if (field.matches('[contenteditable="true"]')) return true;
  const type = (field.getAttribute('type') || 'text').toLowerCase();
  return !['radio', 'checkbox', 'button', 'submit', 'reset', 'file', 'hidden', 'range', 'color'].includes(
    type
  );
}

function isCopyShortcut(event) {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;
  return (mod && (key === 'c' || key === 'x')) || (event.ctrlKey && key === 'insert');
}

function isPrintShortcut(event) {
  const key = event.key.toLowerCase();
  return (event.ctrlKey || event.metaKey) && key === 'p';
}

/**
 * Site-wide: no text copy / selection / context menu / Ctrl+P.
 * Printing works only when ResultCertificateModal sets
 * `printing-result-certificate` on body before window.print().
 */
export function SiteContentLock() {
  useEffect(() => {
    document.documentElement.classList.add('site-no-copy');

    const block = (event) => {
      event.preventDefault();
    };

    const blockCopy = (event) => {
      if (isEditableField(event.target)) return;
      event.preventDefault();
    };

    const blockSelect = (event) => {
      if (isEditableField(event.target)) return;
      event.preventDefault();
    };

    const blockContextMenu = (event) => {
      if (isEditableField(event.target)) return;
      event.preventDefault();
    };

    const blockShortcut = (event) => {
      if (isPrintShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isCopyShortcut(event) && !isEditableField(event.target)) {
        event.preventDefault();
        return;
      }

      const selectAll = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a';
      if (selectAll && !isEditableField(event.target)) {
        event.preventDefault();
      }
    };

    document.addEventListener('copy', blockCopy, true);
    document.addEventListener('cut', blockCopy, true);
    document.addEventListener('dragstart', block, true);
    document.addEventListener('contextmenu', blockContextMenu, true);
    document.addEventListener('selectstart', blockSelect, true);
    document.addEventListener('keydown', blockShortcut, true);

    return () => {
      document.documentElement.classList.remove('site-no-copy');
      document.removeEventListener('copy', blockCopy, true);
      document.removeEventListener('cut', blockCopy, true);
      document.removeEventListener('dragstart', block, true);
      document.removeEventListener('contextmenu', blockContextMenu, true);
      document.removeEventListener('selectstart', blockSelect, true);
      document.removeEventListener('keydown', blockShortcut, true);
    };
  }, []);

  return null;
}
