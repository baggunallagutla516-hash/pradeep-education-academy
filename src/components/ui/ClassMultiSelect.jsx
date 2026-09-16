import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export function ClassMultiSelect({
  classes = [],
  value = [],
  onChange,
  error,
  label = 'Classes',
  required = true,
  hint = 'Visible to students in every selected class',
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listboxId = useId();

  const selectedSet = useMemo(() => new Set(value.map(String)), [value]);
  const allIds = useMemo(() => classes.map((c) => String(c.id)), [classes]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = allIds.some((id) => selectedSet.has(id));

  const summary = useMemo(() => {
    if (!value.length) return 'Select classes';
    const names = classes
      .filter((c) => selectedSet.has(String(c.id)))
      .map((c) => c.name);
    if (!names.length) return `${value.length} selected`;
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }, [classes, selectedSet, value.length]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function toggle(classId) {
    const id = String(classId);
    const next = selectedSet.has(id)
      ? value.filter((entry) => String(entry) !== id)
      : [...value, id];
    onChange?.(next);
  }

  function toggleAll() {
    onChange?.(allSelected ? [] : allIds);
  }

  return (
    <div className="space-y-1.5" ref={rootRef}>
      <span className="text-sm font-semibold text-ink-800">
        {label}
        {required ? <span className="ml-0.5 text-ember-600">*</span> : null}
      </span>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-sm shadow-sm transition',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-ink-900/10 focus:border-lagoon-500',
            value.length ? 'text-ink-900' : 'text-ink-900/35'
          )}
        >
          <span className="truncate">{summary}</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={cn(
              'h-4 w-4 shrink-0 text-ink-900/45 transition',
              open && 'rotate-180'
            )}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open ? (
          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-lg"
          >
            {classes.length === 0 ? (
              <p className="px-3.5 py-3 text-sm text-ink-900/55">No classes available.</p>
            ) : (
              <>
                <label className="flex cursor-pointer items-center gap-2 border-b border-ink-900/10 px-3.5 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-900/[0.03]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-ink-900/20 text-lagoon-600 focus:ring-lagoon-500"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={toggleAll}
                  />
                  <span>Select all</span>
                </label>
                <div className="max-h-44 space-y-0.5 overflow-y-auto p-1.5">
                  {classes.map((c) => {
                    const id = String(c.id);
                    const checked = selectedSet.has(id);
                    return (
                      <label
                        key={id}
                        role="option"
                        aria-selected={checked}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-900 hover:bg-ink-900/[0.03]"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-ink-900/20 text-lagoon-600 focus:ring-lagoon-500"
                          checked={checked}
                          onChange={() => toggle(id)}
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {error ? (
        <span className="block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-ink-900/55">{hint}</span>
      ) : null}
    </div>
  );
}
