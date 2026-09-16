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

export function resultsExportRows(results) {
  const sorted = [...(results || [])].sort((a, b) => {
    const pctDiff = Number(b.percentage || 0) - Number(a.percentage || 0);
    if (pctDiff !== 0) return pctDiff;
    const marksDiff = Number(b.scoredMarks || 0) - Number(a.scoredMarks || 0);
    if (marksDiff !== 0) return marksDiff;
    return Number(a.timeTakenSeconds || 0) - Number(b.timeTakenSeconds || 0);
  });

  let lastPercentage = null;
  let lastRank = 0;

  return sorted.map((row, index) => {
    const percentage = Number(row.percentage || 0);
    if (lastPercentage === null || percentage !== lastPercentage) {
      lastRank = index + 1;
      lastPercentage = percentage;
    }

    return {
      Rank: lastRank,
      Participant: row.studentName || '',
      Role: row.roleLabel || '',
      Email: row.studentEmail || '',
      'Roll number': row.rollNumber || '',
      Score: `${row.scoredMarks ?? 0} / ${row.totalMarks ?? 0}`,
      'Percentage (%)': Math.round(percentage),
      Right: row.correctCount ?? 0,
      Partial: row.partialCount ?? 0,
      Wrong: row.wrongCount ?? 0,
      Skipped: row.unansweredCount ?? 0,
      'Time (seconds)': row.timeTakenSeconds ?? 0,
      'Auto-submitted': row.autoSubmitted ? 'Yes' : 'No',
      Hidden: row.resultsHidden ? 'Yes' : 'No',
      Submitted: formatDate(row.submittedAt),
    };
  });
}
