/** "Unit 3" on its own, or "Unit 3 · Trigonometry" when the unit was named. */
export function unitLabel(item) {
  if (!item?.unitNumber) return '';
  const base = `Unit ${item.unitNumber}`;
  return item.unitName ? `${base} · ${item.unitName}` : base;
}
