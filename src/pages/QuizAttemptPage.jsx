import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizApi } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { AttemptRunner } from '../components/quiz/AttemptRunner';

export function QuizAttemptPage({ api = quizApi, basePath = '/quizzes' } = {}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const storageKey = attempt ? `quiz-answers-${attempt.id}` : '';

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError('');

    async function start() {
      try {
        const { data } = await api.start(id);
        if (!active) return;
        setAttempt(data.data.attempt);
        setQuiz(data.data.quiz);
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 409) {
          navigate(`${basePath}/${id}/result`, { replace: true });
          return;
        }
        setStatus('error');
        setLoadError(getErrorMessage(err, 'Could not start this quiz.'));
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
      <PageShell embedded title="Loading quiz…">
        <LoadingState label="Getting your questions ready…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell embedded title="QUIZ">
        <ErrorState
          description={loadError}
          onRetry={() => navigate(basePath)}
          retryLabel="Back to quizzes"
        />
      </PageShell>
    );
  }

  return (
    <AttemptRunner
      title={quiz.title}
      subtitle={quiz.subject}
      questions={quiz.questions}
      initialRemainingSeconds={attempt.remainingSeconds}
      storageKey={storageKey}
      submitting={submitting}
      error={submitError}
      onDismissError={() => setSubmitError('')}
      onSubmit={handleSubmit}
    />
  );
}
