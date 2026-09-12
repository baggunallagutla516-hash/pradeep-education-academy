import { useEffect } from 'react';

function isAnswerField(target) {
  if (!(target instanceof Element)) return false;
  const field = target.closest('input, textarea');
  if (!field) return false;
  const type = (field.getAttribute('type') || 'text').toLowerCase();
  return type !== 'radio' && type !== 'checkbox' && type !== 'button' && type !== 'submit';
}

function isCopyShortcut(event) {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;
  return (mod && (key === 'c' || key === 'x')) || (event.ctrlKey && key === 'insert');
}

function isPasteShortcut(event) {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;
  return (mod && key === 'v') || (event.shiftKey && key === 'insert');
}

/**
 * Blocks selecting, copying, and pasting exam questions.
 * Typed answers can still be edited; paste into those fields is blocked.
 */
export function useExamCopyLock(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const block = (event) => {
      event.preventDefault();
    };

    const blockSelect = (event) => {
      if (isAnswerField(event.target)) return;
      event.preventDefault();
    };

    const blockShortcut = (event) => {
      if (isPasteShortcut(event) || isCopyShortcut(event)) {
        event.preventDefault();
        return;
      }
      const selectAll = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a';
      if (selectAll && !isAnswerField(event.target)) {
        event.preventDefault();
      }
    };

    const blockBeforeInput = (event) => {
      if (event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop') {
        event.preventDefault();
      }
    };

    root.addEventListener('copy', block, true);
    root.addEventListener('cut', block, true);
    root.addEventListener('paste', block, true);
    root.addEventListener('drop', block, true);
    root.addEventListener('dragstart', block, true);
    root.addEventListener('contextmenu', block, true);
    root.addEventListener('selectstart', blockSelect, true);
    root.addEventListener('keydown', blockShortcut, true);
    root.addEventListener('beforeinput', blockBeforeInput, true);

    return () => {
      root.removeEventListener('copy', block, true);
      root.removeEventListener('cut', block, true);
      root.removeEventListener('paste', block, true);
      root.removeEventListener('drop', block, true);
      root.removeEventListener('dragstart', block, true);
      root.removeEventListener('contextmenu', block, true);
      root.removeEventListener('selectstart', blockSelect, true);
      root.removeEventListener('keydown', blockShortcut, true);
      root.removeEventListener('beforeinput', blockBeforeInput, true);
    };
  }, [rootRef]);
}
