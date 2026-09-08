import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { slipTestApi } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { AttemptRunner } from '../components/quiz/AttemptRunner';

export function SlipTestAttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [slipTest, setSlipTest] = useState(null);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const storageKey = attempt ? `slip-test-answers-${attempt.id}` : '';

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError('');

    async function start() {
      try {
        const { data } = await slipTestApi.start(id);
        if (!active) return;
        setAttempt(data.data.attempt);
        setSlipTest(data.data.slipTest);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        // Already submitted — send them to the result card instead of a dead end.
        if (err.response?.status === 409) {
          navigate(`/slip-tests/${id}/result`, { replace: true });
          return;
        }
        setStatus('error');
        setLoadError(getErrorMessage(err, 'Could not start this slip test.'));
      }
    }

    start();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handleSubmit = useCallback(
    async (answers, autoSubmitted) => {
      setSubmitting(true);
      setSubmitError('');
      try {
        await slipTestApi.submit(id, { answers, autoSubmitted });
        if (storageKey) {
          try {
            localStorage.removeItem(storageKey);
          } catch {
            /* ignore */
          }
        }
        navigate(`/slip-tests/${id}/result`, { replace: true });
      } catch (err) {
        // A duplicate submit still has a result waiting.
        if (err.response?.status === 409) {
          navigate(`/slip-tests/${id}/result`, { replace: true });
          return;
        }
        setSubmitError(getErrorMessage(err, 'Could not submit your answers.'));
        setSubmitting(false);
        throw err;
      }
    },
    [id, navigate, storageKey]
  );

  if (status === 'loading') {
    return (
      <PageShell embedded title="Loading test…">
        <LoadingState label="Getting your questions ready…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell embedded title="Slip test">
        <ErrorState
          description={loadError}
          onRetry={() => navigate('/slip-tests')}
          retryLabel="Back to slip tests"
        />
      </PageShell>
    );
  }

  return (
    <AttemptRunner
      title={slipTest.title}
      subtitle={[slipTest.subject, slipTest.chapter].filter(Boolean).join(' · ')}
      questions={slipTest.questions}
      initialRemainingSeconds={attempt.remainingSeconds}
      storageKey={storageKey}
      submitting={submitting}
      error={submitError}
      onDismissError={() => setSubmitError('')}
      onSubmit={handleSubmit}
    />
  );
}
