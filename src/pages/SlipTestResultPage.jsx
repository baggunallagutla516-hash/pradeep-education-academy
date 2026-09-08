import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { slipTestApi } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ResultCard } from '../components/quiz/ResultCard';

export function SlipTestResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');

    async function load() {
      try {
        const { data } = await slipTestApi.result(id);
        if (!active) return;
        setResult(data.data.result);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setError(getErrorMessage(err, 'Could not load your result.'));
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <PageShell
      embedded
      eyebrow="Slip test result"
      title={result?.title || 'Your result'}
      description={
        result
          ? [result.subject, result.chapter, result.topic].filter(Boolean).join(' · ')
          : 'Here is how you did.'
      }
      actions={
        <Link to="/slip-tests">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            All slip tests
          </Button>
        </Link>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading your result…" /> : null}
      {status === 'error' ? (
        <ErrorState
          description={error}
          onRetry={() => navigate('/slip-tests')}
          retryLabel="Back to slip tests"
        />
      ) : null}
      {status === 'ready' ? <ResultCard result={result} /> : null}
    </PageShell>
  );
}
