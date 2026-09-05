export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  const data = error.response?.data;

  if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
    return data.details.join('. ');
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
