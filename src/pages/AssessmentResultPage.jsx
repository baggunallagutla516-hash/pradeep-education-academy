import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Clock3 } from 'lucide-react';
import { assessmentApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useEducatorAuth } from '../context/EducatorAuthContext';
import { useParentAuth } from '../context/ParentAuthContext';
import { getErrorMessage } from '../utils/errors';
import { formatDate } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ResultCard } from '../components/quiz/ResultCard';
import { ResultCertificateModal } from '../components/quiz/ResultCertificateModal';

export function AssessmentResultPage({
  api = assessmentApi,
  basePath = '/assessments',
  role = 'student',
} = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
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
        <Card className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ember-400/15 text-ember-700">
            <Clock3 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink-900">Results on hold</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-900/60">
            Your answers were submitted
            {held.submittedAt ? ` on ${formatDate(held.submittedAt)}` : ''}. The academy will
            release results soon. You will get an email when they are available — then open them
            here on the site.
          </p>
          <p className="mt-4 text-xs text-ink-900/45">Scores are not shared by email.</p>
        </Card>
      ) : null}

      {status === 'ready' && result ? (
        <>
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
