import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentApi } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { CbtAttemptRunner } from '../components/quiz/CbtAttemptRunner';

export function AssessmentAttemptPage({
  api = assessmentApi,
  basePath = '/assessments',
} = {}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const storageKey = attempt ? `assessment-answers-${attempt.id}` : '';

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError('');

    async function start() {
      try {
        const { data } = await api.start(id);
        if (!active) return;
        setAttempt(data.data.attempt);
        setAssessment(data.data.assessment);
        setStudentName(data.data.student?.fullName || '');
        setStatus('ready');
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 409) {
          navigate(`${basePath}/${id}/result`, { replace: true });
          return;
        }
        setStatus('error');
        setLoadError(getErrorMessage(err, 'Could not start this assessment.'));
      }
    }

    start();
    return () => {
      active = false;
    };
  }, [api, basePath, id, navigate]);

  const handleFullscreenExit = useCallback(async () => {
    const { data } = await api.fullscreenExit(id);
    return data.data;
  }, [api, id]);

  const handleSubmit = useCallback(
    async (answers, autoSubmitted, submitReason = 'manual') => {
      setSubmitting(true);
      setSubmitError('');
      try {
        await api.submit(id, {
          answers,
          autoSubmitted,
          submitReason: autoSubmitted ? submitReason : 'manual',
        });
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
      <PageShell embedded title="Loading online assessment…">
        <LoadingState label="Getting your questions ready…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell embedded title="Online Assessment">
        <ErrorState
          description={loadError}
          onRetry={() => navigate(basePath)}
          retryLabel="Back to online assessments"
        />
      </PageShell>
    );
  }

  return (
    <CbtAttemptRunner
      title={assessment.title}
      subject={assessment.subject}
      studentName={studentName}
      questions={assessment.questions}
      sections={assessment.sections}
      initialRemainingSeconds={attempt.remainingSeconds}
      durationMinutes={assessment.durationMinutes}
      storageKey={storageKey}
      submitting={submitting}
      error={submitError}
      onDismissError={() => setSubmitError('')}
      onSubmit={handleSubmit}
      fullscreenExitCount={attempt.fullscreenExitCount || 0}
      maxFullscreenExits={attempt.maxFullscreenExits || 3}
      onFullscreenExit={handleFullscreenExit}
    />
  );
}
