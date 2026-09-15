import * as XLSX from 'xlsx';

function formatDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

function classesLabel(entity) {
  const list = entity?.classes || [];
  if (!Array.isArray(list) || list.length === 0) return '';
  return list
    .map((item) => item?.name || item?.id || item)
    .filter(Boolean)
    .join(', ');
}

/** Fetch every page for the current filters (API max page size is 50). */
export async function fetchAllPages(fetchPage, { pageSize = 50 } = {}) {
  const first = await fetchPage(1, pageSize);
  const items = [...(first.items || [])];
  const pages = Math.max(1, first.pagination?.pages || 1);

  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchPage(page, pageSize);
    items.push(...(next.items || []));
  }

  return items;
}

export function downloadWorkbook(rows, { sheetName = 'Sheet1', fileName = 'export.xlsx' } = {}) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, fileName);
}

export function studentExportRows(students) {
  return (students || []).map((s) => ({
    'Registration ID': s.registrationId || '',
    'Full name': s.fullName || '',
    Email: s.email || '',
    Phone: s.phone || '',
    Class: s.studentClassName || s.studentClass || '',
    School: s.schoolName || '',
    'Roll number': s.rollNumber || '',
    Status: s.isActive ? 'Active' : 'Inactive',
    'Created at': formatDate(s.createdAt),
    'Last login': formatDate(s.lastLoginAt),
  }));
}

export function educatorExportRows(educators) {
  return (educators || []).map((e) => ({
    'Full name': e.fullName || '',
    Email: e.email || '',
    Phone: e.phone || '',
    School: e.schoolName || '',
    Classes: classesLabel(e),
    Status: e.isActive ? 'Active' : 'Inactive',
    'Created at': formatDate(e.createdAt),
    'Last login': formatDate(e.lastLoginAt),
  }));
}

export function parentExportRows(parents) {
  return (parents || []).map((p) => ({
    'Full name': p.fullName || '',
    Email: p.email || '',
    Phone: p.phone || '',
    Classes: classesLabel(p),
    'Linked students': Array.isArray(p.studentIds) ? p.studentIds.length : 0,
    Status: p.isActive ? 'Active' : 'Inactive',
    'Created at': formatDate(p.createdAt),
    'Last login': formatDate(p.lastLoginAt),
  }));
}
