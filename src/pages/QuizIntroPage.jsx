import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Clock, HelpCircle, Lock, LogIn, UserPlus } from 'lucide-react';
import { contentApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { rememberQuizReturnPath } from '../utils/quizReturnPath';
import { formatDateTime } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

export function QuizIntroPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, status: authStatus } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const introPath = `/quizzes/${id}`;
  const attemptPath = `/quizzes/${id}/attempt`;

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await contentApi.quizIntro(id);
      setQuiz(data.data.quiz);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load this quiz.'));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    rememberQuizReturnPath(introPath);
  }, [introPath]);

  function handleStart() {
    if (!isAuthenticated) return;
    navigate(attemptPath);
  }

  function goLogin() {
    rememberQuizReturnPath(introPath);
    navigate('/login', { state: { from: introPath } });
  }

  function goRegister() {
    rememberQuizReturnPath(introPath);
    navigate('/register', { state: { from: introPath } });
  }

  if (status === 'loading' || authStatus === 'loading') {
    return (
      <PageShell title="Quiz" description="Loading quiz details…">
        <LoadingState label="Loading quiz…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell title="Quiz" description="We could not open this quiz.">
        <ErrorState description={error} onRetry={load} />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Quiz"
      title={quiz.title}
      description="Read the details below, then start when you are ready."
      actions={quiz.subject ? <Badge tone="lagoon">{quiz.subject}</Badge> : null}
    >
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-900">{quiz.title}</h2>
          {quiz.description ? (
            <p className="mt-3 text-base leading-relaxed text-ink-900/70">{quiz.description}</p>
          ) : (
            <p className="mt-3 text-base leading-relaxed text-ink-900/60">
              Test your knowledge and save your score after you submit.
            </p>
          )}

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-sand-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-800/50">
                Questions
              </dt>
              <dd className="mt-1 text-lg font-bold text-ink-900">{quiz.questionCount}</dd>
            </div>
            <div className="rounded-2xl bg-sand-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-800/50">
                Duration
              </dt>
              <dd className="mt-1 flex items-center gap-2 text-lg font-bold text-ink-900">
                <Clock className="h-4 w-4 text-lagoon-600" />
                {quiz.durationMinutes} min
              </dd>
            </div>
            {quiz.startDate ? (
              <div className="rounded-2xl bg-sand-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-800/50">
                  Opens
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">
                  {formatDateTime(quiz.startDate)}
                </dd>
              </div>
            ) : null}
            {quiz.endDate ? (
              <div className="rounded-2xl bg-sand-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-800/50">
                  Closes
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">
                  {formatDateTime(quiz.endDate)}
                </dd>
              </div>
            ) : null}
          </dl>

          {isAuthenticated ? (
            <div className="mt-8">
              <Button size="lg" onClick={handleStart}>
                Start quiz
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-3 text-sm text-ink-900/55">
                Your timer starts when you begin. You can also open this quiz from your dashboard
                later.
              </p>
            </div>
          ) : null}
        </Card>

        {!isAuthenticated ? (
          <Card className="border-ember-500/25 bg-gradient-to-b from-ember-400/10 to-white">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-500/15 text-ember-600">
              <Lock className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember-600">
              Registration required
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-ink-900">
              Login to attempt this quiz
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-900/65">
              Create your free account or login to attempt this quiz and save your results.
            </p>
            {location.state?.registered ? (
              <Alert type="success" title="Account created" className="mt-4">
                After the admin activates your account, log in and you will return here to start
                the quiz.
              </Alert>
            ) : null}
            <div className="mt-6 flex flex-col gap-3">
              <Button size="lg" variant="ember" onClick={goRegister}>
                <UserPlus className="h-4 w-4" />
                Register now
              </Button>
              <Button size="lg" variant="secondary" onClick={goLogin}>
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-800/50">
              Viewing quiz details is free for everyone. Attempting, submitting, and viewing your
              personal result require a student login.
            </p>
          </Card>
        ) : (
          <Card>
            <h3 className="font-display text-lg font-bold text-ink-900">You are signed in</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-900/65">
              Start whenever you are ready. Your result will be saved to your account after you
              submit.
            </p>
            <Link to="/quizzes" className="mt-5 inline-block">
              <Button variant="secondary" size="sm">
                All quizzes
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
