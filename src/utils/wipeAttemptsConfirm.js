/** Confirm copy when unpublishing or editing published attempt-based content. */
export function confirmWipeAttemptsMessage(action = 'continue', attemptCount = 0) {
  const who =
    attemptCount > 0
      ? `Users who have attempted so far (${attemptCount}) — their attempt data will be deleted.`
      : 'Users who have attempted so far — their attempt data will be deleted.';

  return `${action}\n\n${who}\n\nThis cannot be undone. After you fix answers and publish again, everyone starts fresh with the corrected questions.`;
}

export function confirmUnpublishMessage(title, attemptCount = 0) {
  return confirmWipeAttemptsMessage(`Unpublish "${title}"?`, attemptCount);
}

export function confirmEditPublishedMessage(title, attemptCount = 0) {
  return confirmWipeAttemptsMessage(
    `Edit "${title}"?\n\nWhen you save, attempt data will be cleared so corrected answers apply for everyone.`,
    attemptCount
  );
}

export function confirmSavePublishedMessage(attemptCount = 0) {
  return confirmWipeAttemptsMessage(
    'Save these changes?\n\nBecause this was published, saving will delete all attempt data so corrected answers apply for everyone.',
    attemptCount
  );
}
