import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardList, Clock } from 'lucide-react';
import { dppApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { classLabel } from '../utils/classLabel';
import { formatDate, formatMarks } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ExpandableText } from '../components/ui/ExpandableText';

function scoreTone(percentage) {
  if (percentage >= 75) return 'text-lagoon-700';
  if (percentage >= 40) return 'text-ember-600';
  return 'text-red-600';
}

export function DppsPage() {
  const { student } = useAuth();
  const [dpps, setDpps] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await dppApi.list();
      setDpps(data.data.dpps);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load your daily practice problems.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      embedded
      eyebrow="Practice"
      title="D.P.P."
      description="Daily practice problems for your class. Submit online; scores appear after the academy releases results."
      actions={<Badge>{classLabel(student) || 'Student'}</Badge>}
    >
      {status === 'loading' ? <LoadingState label="Loading daily practice problems…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && dpps.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={`No daily practice problems have been published for ${classLabel(student) || 'your class'} yet. Check back soon.`}
          icon={ClipboardList}
        />
      ) : null}

      {status === 'ready' && dpps.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dpps.map((item) => {
            const done = item.attemptStatus === 'submitted';
            const inProgress = item.attemptStatus === 'in_progress';
            const closed = item.isClosed && !done && !inProgress;

            return (
              <Card key={item.id} className="flex h-full flex-col">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone="ember">{formatDate(item.practiceDate)}</Badge>
                  {item.endDate ? (
                    <Badge tone="ink">Ends {formatDate(item.endDate)}</Badge>
                  ) : null}
                  {done ? (
                    <Badge tone={item.resultsReleased ? 'lagoon' : 'ember'}>
                      {item.resultsReleased ? 'Completed' : 'Awaiting release'}
                    </Badge>
                  ) : inProgress ? (
                    <Badge tone="ink">In progress</Badge>
                  ) : closed ? (
                    <Badge tone="ink">Closed</Badge>
                  ) : null}
                </div>

                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                {item.subject ? (
                  <p className="mt-0.5 text-sm font-medium text-lagoon-700">{item.subject}</p>
                ) : null}
                {item.description ? (
                  <ExpandableText text={item.description} lines={2} />
                ) : null}

                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-900/55">
                  <span>
                    {item.questionCount} question{item.questionCount === 1 ? '' : 's'}
                  </span>
                  <span>·</span>
                  <span>{formatMarks(item.totalMarks)} marks</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {item.durationMinutes} min
                  </span>
                </p>

                {done && item.resultsReleased ? (
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className={`font-display text-2xl font-extrabold ${scoreTone(item.percentage)}`}>
                      {formatMarks(item.scoredMarks)}
                    </span>
                    <span className="text-sm text-ink-900/45">
                      / {formatMarks(item.totalMarks)} · {Math.round(item.percentage)}%
                    </span>
                  </p>
                ) : null}

                {done && !item.resultsReleased ? (
                  <p className="mt-3 text-sm text-ink-900/55">
                    Submitted. Scores will show here after results are released.
                  </p>
                ) : null}

                {closed ? (
                  <p className="mt-3 text-sm text-ink-900/55">
                    This DPP closed on {formatDate(item.endDate)}.
                  </p>
                ) : null}

                <div className="mt-auto pt-4">
                  {done ? (
                    <Link to={`/dpps/${item.id}/result`}>
                      <Button variant="secondary" size="sm">
                        <CheckCircle2 className="h-4 w-4" />
                        {item.resultsReleased ? 'View result' : 'Submission status'}
                      </Button>
                    </Link>
                  ) : closed ? (
                    <Button size="sm" disabled>
                      Closed
                    </Button>
                  ) : (
                    <Link to={`/dpps/${item.id}/attempt`}>
                      <Button size="sm">
                        {inProgress ? 'Resume' : 'Start'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </PageShell>
  );
}
