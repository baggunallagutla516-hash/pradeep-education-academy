const PREFIX = 'celebrate-result:';

export function markSubmissionCelebrate(kind, id) {
  if (!kind || !id || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(`${PREFIX}${kind}:${id}`, '1');
  } catch {
    /* ignore */
  }
}

export function consumeSubmissionCelebrate(kind, id) {
  if (!kind || !id || typeof sessionStorage === 'undefined') return false;
  const key = `${PREFIX}${kind}:${id}`;
  try {
    const value = sessionStorage.getItem(key);
    if (value) sessionStorage.removeItem(key);
    return Boolean(value);
  } catch {
    return false;
  }
}
