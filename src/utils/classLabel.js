/** Prefer display name; fall back to raw value for older payloads. */
export function classLabel(entity) {
  if (!entity) return '';
  if (typeof entity === 'string') return entity;
  return entity.studentClassName || entity.studentClass || '';
}
