import { useEffect, useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { visitorApi } from '../api/visitorApi';
import { getErrorMessage } from '../utils/errors';
import { cn } from '../utils/cn';

function formatCount(value) {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function VisitorCounter({ className, compact = false }) {
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function loadCount() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await visitorApi.getCount();
      setCount(data.data.count ?? 0);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load visitor count.'));
    }
  }

  useEffect(() => {
    loadCount();
  }, []);

  if (status === 'loading') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-2xl border border-ink-900/8 bg-white/80 px-3 py-2 text-sm text-ink-900/55 shadow-soft',
          className
        )}
        aria-live="polite"
      >
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-lagoon-200 border-t-lagoon-600" />
        Loading visitors…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={cn(
          'inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700',
          className
        )}
        role="alert"
      >
        <span className="truncate">{error}</span>
        <button
          type="button"
          onClick={loadCount}
          className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl border border-lagoon-200 bg-lagoon-50 px-3 py-2 text-sm font-semibold text-lagoon-900 shadow-soft',
        className
      )}
      aria-live="polite"
    >
      <Eye className="h-4 w-4 text-lagoon-600" aria-hidden />
      {compact ? (
        <span>{formatCount(count)} visits</span>
      ) : (
        <span>
          <span className="text-lagoon-700">{formatCount(count)}</span> people have visited
        </span>
      )}
    </div>
  );
}
