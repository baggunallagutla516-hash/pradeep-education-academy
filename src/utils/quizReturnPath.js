const QUIZ_RETURN_KEY = 'quizReturnPath';

export function rememberQuizReturnPath(path) {
  if (!path) return;
  try {
    sessionStorage.setItem(QUIZ_RETURN_KEY, path);
  } catch {
    /* ignore */
  }
}

export function consumeQuizReturnPath() {
  try {
    const value = sessionStorage.getItem(QUIZ_RETURN_KEY);
    sessionStorage.removeItem(QUIZ_RETURN_KEY);
    return value || '';
  } catch {
    return '';
  }
}

export function peekQuizReturnPath() {
  try {
    return sessionStorage.getItem(QUIZ_RETURN_KEY) || '';
  } catch {
    return '';
  }
}
