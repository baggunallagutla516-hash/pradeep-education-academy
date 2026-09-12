/** Selected class ids from an API item (multi or legacy single). */
export function selectedClassIdsFromItem(item) {
  if (!item) return [];
  if (Array.isArray(item.studentClasses) && item.studentClasses.length > 0) {
    return item.studentClasses.map((entry) => String(entry?.id || entry)).filter(Boolean);
  }
  if (item.studentClass) return [String(item.studentClass)];
  return [];
}

/** Unique { id, name } options from a list of content items. */
export function classOptionsFromItems(items, classLabelFn) {
  const seen = new Map();
  (items || []).forEach((item) => {
    const list =
      Array.isArray(item.studentClasses) && item.studentClasses.length > 0
        ? item.studentClasses
        : item.studentClass
          ? [{ id: item.studentClass, name: item.studentClassName || classLabelFn?.(item) || '' }]
          : [];
    list.forEach((entry) => {
      const id = String(entry?.id || entry || '');
      const name = entry?.name || item.studentClassName || classLabelFn?.(item) || '';
      if (id && !seen.has(id)) seen.set(id, name);
    });
  });
  return [...seen].map(([id, name]) => ({ id, name }));
}

/** Whether an item belongs to the selected class filter. */
export function itemMatchesClassFilter(item, classFilter) {
  if (!classFilter) return true;
  return selectedClassIdsFromItem(item).includes(String(classFilter));
}

/** Append studentClasses to FormData (multipart uploads). */
export function appendStudentClasses(fd, classIds) {
  (classIds || []).forEach((id) => fd.append('studentClasses', id));
}
