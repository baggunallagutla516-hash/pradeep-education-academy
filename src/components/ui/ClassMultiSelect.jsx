export function ClassMultiSelect({
  classes = [],
  value = [],
  onChange,
  error,
  label = 'Classes',
  required = true,
  hint = 'Visible to students in every selected class',
}) {
  function toggle(classId) {
    const next = value.includes(classId)
      ? value.filter((id) => id !== classId)
      : [...value, classId];
    onChange?.(next);
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-semibold text-ink-800">
        {label}
        {required ? <span className="ml-0.5 text-ember-600">*</span> : null}
      </span>
      <div
        className={`max-h-44 space-y-1 overflow-y-auto rounded-xl border bg-white p-3 shadow-sm ${
          error ? 'border-red-400' : 'border-ink-900/10'
        }`}
      >
        {classes.length === 0 ? (
          <p className="text-sm text-ink-900/55">No classes available.</p>
        ) : (
          classes.map((c) => {
            const checked = value.includes(c.id);
            return (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-900 hover:bg-ink-900/[0.03]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-900/20 text-lagoon-600 focus:ring-lagoon-500"
                  checked={checked}
                  onChange={() => toggle(c.id)}
                />
                <span>{c.name}</span>
              </label>
            );
          })
        )}
      </div>
      {error ? (
        <span className="block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-ink-900/55">{hint}</span>
      ) : null}
    </div>
  );
}
