import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { assessmentApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useEducatorAuth } from '../context/EducatorAuthContext';
import { useParentAuth } from '../context/ParentAuthContext';
import { getErrorMessage } from '../utils/errors';
import { formatDate } from '../utils/quizFormat';
import { consumeSubmissionCelebrate } from '../utils/submissionCelebrate';
import { PageShell } from '../components/layout/PageShell';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ResultCard } from '../components/quiz/ResultCard';
import { ResultCertificateModal } from '../components/quiz/ResultCertificateModal';
import { SubmissionHeldCard } from '../components/quiz/SubmissionHeldCard';
import { SubmissionThanksBanner } from '../components/quiz/SubmissionThanksBanner';

export function AssessmentResultPage({
  api = assessmentApi,
  basePath = '/assessments',
  role = 'student',
  celebrateKind = 'assessment',
} = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const celebrate = useMemo(
    () => Boolean(location.state?.celebrate) || consumeSubmissionCelebrate(celebrateKind, id),
    [celebrateKind, id, location.state]
  );
  const { student } = useAuth();
  const { educator } = useEducatorAuth();
  const { parent } = useParentAuth();

  const participant =
    role === 'educator' ? educator : role === 'parent' ? parent : student;

  const [result, setResult] = useState(null);
  const [held, setHeld] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus('loading');

    async function load() {
      try {
        const { data } = await api.result(id);
        if (!active) return;
        if (data.data.resultsHeld) {
          setHeld(data.data);
          setResult(null);
        } else {
          setResult(data.data.result);
          setHeld(null);
        }
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
  }, [api, id]);

  const title =
    result?.title || held?.assessment?.title || 'Your result';
  const description = result
    ? [result.subject, formatDate(result.assessmentDate)].filter(Boolean).join(' · ')
    : held?.assessment
      ? [held.assessment.subject, formatDate(held.assessment.assessmentDate)]
          .filter(Boolean)
          .join(' · ') || 'Submitted successfully'
      : 'Here is how you did.';

  return (
    <PageShell
      embedded
      eyebrow="Online assessment result"
      title={title}
      description={description}
      actions={
        <>
          {status === 'ready' && result ? (
            <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)}>
              <Camera className="h-4 w-4" />
              Screenshot result
            </Button>
          ) : null}
          <Link to={basePath}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              All online assessments
            </Button>
          </Link>
        </>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading your result…" /> : null}
      {status === 'error' ? (
        <ErrorState
          description={error}
          onRetry={() => navigate(basePath)}
          retryLabel="Back to online assessments"
        />
      ) : null}

      {status === 'ready' && held ? (
        <SubmissionHeldCard
          submittedAt={held.submittedAt}
          activityLabel="online assessment"
          celebrate
        />
      ) : null}

      {status === 'ready' && result ? (
        <>
          <SubmissionThanksBanner celebrate={celebrate} activityLabel="online assessment" />
          {result.submitReason === 'fullscreen_exits' ? (
            <p className="mb-4 rounded-xl border border-ember-400/40 bg-ember-400/10 px-4 py-3 text-sm text-ember-800">
              This test was auto-submitted after leaving fullscreen too many times.
            </p>
          ) : null}
          <ResultCard result={result} />
          <ResultCertificateModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            result={result}
            student={participant}
            kindLabel="Online assessment result"
            activityLabel="Assessment"
            dateValue={result.assessmentDate}
          />
        </>
      ) : null}
    </PageShell>
  );
}
