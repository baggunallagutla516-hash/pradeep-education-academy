import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck, Clock } from 'lucide-react';
import { assessmentApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { classLabel } from '../utils/classLabel';
import { formatDateTime, formatMarks } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ExpandableText } from '../components/ui/ExpandableText';

function scoreTone(percentage) {
  if (percentage >= 75) return 'text-lagoon-700';
  if (percentage >= 40) return 'text-ember-600';
  return 'text-red-600';
}

export function AssessmentsPage({
  api = assessmentApi,
  basePath = '/assessments',
  badgeLabel,
  enableClassFilter = false,
} = {}) {
  const { student } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const params = enableClassFilter && classFilter ? { studentClass: classFilter } : undefined;
      const { data } = await api.list(params);
      setAssessments(data.data.assessments || []);
      if (Array.isArray(data.data.classes) && data.data.classes.length > 0) {
        setClasses(data.data.classes);
      }
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load assessments.'));
    }
  }, [api, classFilter, enableClassFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const badge =
    badgeLabel ||
    (enableClassFilter
      ? classFilter
        ? classes.find((c) => c.id === classFilter)?.name || 'Class'
        : 'All classes'
      : classLabel(student) || 'Student');

  return (
    <PageShell
      embedded
      eyebrow="Practice"
      title="Online Assessments"
      description={
        enableClassFilter
          ? 'Timed online assessments for every class. Attempt them like a student — leaving fullscreen too many times auto-submits.'
          : 'Timed online assessments for your class. The test runs fullscreen — leaving it more than 3 times auto-submits.'
      }
      actions={<Badge>{badge}</Badge>}
    >
      {enableClassFilter && classes.length > 0 ? (
        <div className="mb-6 max-w-xs">
          <Select
            label="Class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All classes</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading online assessments…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && assessments.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={
            enableClassFilter
              ? 'No online assessments have been published yet for this filter.'
              : `No online assessments have been published for ${classLabel(student) || 'your class'} yet. Check back soon.`
          }
          icon={ClipboardCheck}
        />
      ) : null}

      {status === 'ready' && assessments.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((item) => {
            const done = item.attemptStatus === 'submitted';
            const inProgress = item.attemptStatus === 'in_progress';
            const closed = item.isClosed && !done && !inProgress;

            return (
              <Card key={item.id} className="flex h-full flex-col">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone="ember">{formatDateTime(item.assessmentDate)}</Badge>
                  {item.studentClassName ? <Badge tone="ink">{item.studentClassName}</Badge> : null}
                  {item.endDate ? (
                    <Badge tone="ink">Ends {formatDateTime(item.endDate)}</Badge>
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
                    Submitted. Results will appear after the academy releases them.
                  </p>
                ) : null}

                {closed ? (
                  <p className="mt-3 text-sm text-ink-900/55">
                    This assessment closed on {formatDateTime(item.endDate)}.
                  </p>
                ) : null}

                <div className="mt-auto pt-4">
                  {done ? (
                    <Link to={`${basePath}/${item.id}/result`}>
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
                    <Link to={`${basePath}/${item.id}/attempt`}>
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
