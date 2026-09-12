import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dppApi } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { AttemptRunner } from '../components/quiz/AttemptRunner';

export function DppAttemptPage({ api = dppApi, basePath = '/dpps' } = {}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [dpp, setDpp] = useState(null);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const storageKey = attempt ? `dpp-answers-${attempt.id}` : '';

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError('');

    async function start() {
      try {
        const { data } = await api.start(id);
        if (!active) return;
        setAttempt(data.data.attempt);
        setDpp(data.data.dpp);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        // Already submitted — send them to the result card instead of a dead end.
        if (err.response?.status === 409) {
          navigate(`${basePath}/${id}/result`, { replace: true });
          return;
        }
        setStatus('error');
        setLoadError(getErrorMessage(err, 'Could not start this DPP.'));
      }
    }

    start();
    return () => {
      active = false;
    };
  }, [api, basePath, id, navigate]);

  const handleSubmit = useCallback(
    async (answers, autoSubmitted) => {
      setSubmitting(true);
      setSubmitError('');
      try {
        await api.submit(id, { answers, autoSubmitted });
        if (storageKey) {
          try {
            localStorage.removeItem(storageKey);
          } catch {
            /* ignore */
          }
        }
        navigate(`${basePath}/${id}/result`, { replace: true });
      } catch (err) {
        // A duplicate submit still has a result waiting.
        if (err.response?.status === 409) {
          navigate(`${basePath}/${id}/result`, { replace: true });
          return;
        }
        setSubmitError(getErrorMessage(err, 'Could not submit your answers.'));
        setSubmitting(false);
        throw err;
      }
    },
    [api, basePath, id, navigate, storageKey]
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
      <PageShell embedded title="D.P.P.">
        <ErrorState
          description={loadError}
          onRetry={() => navigate(basePath)}
          retryLabel="Back to DPPs"
        />
      </PageShell>
    );
  }

  return (
    <AttemptRunner
      title={dpp.title}
      subtitle={dpp.subject}
      questions={dpp.questions}
      initialRemainingSeconds={attempt.remainingSeconds}
      storageKey={storageKey}
      submitting={submitting}
      error={submitError}
      onDismissError={() => setSubmitError('')}
      onSubmit={handleSubmit}
    />
  );
}
