import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Clock3 } from 'lucide-react';
import { dppApi } from '../api/adminApi';
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

export function DppResultPage({
  api = dppApi,
  basePath = '/dpps',
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

  const title = result?.title || held?.dpp?.title || 'Your result';
  const description = result
    ? [result.subject, formatDate(result.practiceDate)].filter(Boolean).join(' · ')
    : held?.dpp
      ? [held.dpp.subject, formatDate(held.dpp.practiceDate)].filter(Boolean).join(' · ') ||
        'Submitted successfully'
      : 'Here is how you did.';

  return (
    <PageShell
      embedded
      eyebrow="D.P.P. result"
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
              All DPPs
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
          retryLabel="Back to DPPs"
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
          <ResultCard result={result} />
          <ResultCertificateModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            result={result}
            student={participant}
            kindLabel="D.P.P. result"
            activityLabel="D.P.P."
            dateValue={result.practiceDate}
          />
        </>
      ) : null}
    </PageShell>
  );
}
