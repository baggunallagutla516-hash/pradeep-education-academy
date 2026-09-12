import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Megaphone } from 'lucide-react';
import { useStaffContent } from '../../context/StaffContentContext';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatDate, formatMarks } from '../../utils/quizFormat';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResultsTable } from '../../components/quiz/ResultsTable';

export function AdminDppResultsPage() {
  const { basePath, api } = useStaffContent();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionInfo, setActionInfo] = useState('');
  const [releasing, setReleasing] = useState(false);

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const res = await api.dppResults(id);
      setData(res.data.data);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load results.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleRelease() {
    const released = data?.dpp?.resultsReleased;
    const confirmMessage = released
      ? 'Results are already released. Send the notification email again to all students who submitted?'
      : 'Release results to students? They will be able to view scores on the site, and each submitted student will get an email (no scores in the email).';
    if (!window.confirm(confirmMessage)) return;

    setReleasing(true);
    setActionError('');
    setActionInfo('');
    try {
      const res = await api.releaseDppResults(id);
      const notify = res.data.data.notify || {};
      setData((prev) =>
        prev
          ? {
              ...prev,
              dpp: res.data.data.dpp || {
                ...prev.dpp,
                resultsReleased: true,
              },
            }
          : prev
      );
      setActionInfo(
        `${res.data.message} Emails sent: ${notify.emailed || 0}` +
          (notify.failed ? `, failed: ${notify.failed}` : '') +
          (notify.skipped ? `, skipped: ${notify.skipped}` : '') +
          '.'
      );
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not release results.'));
    } finally {
      setReleasing(false);
    }
  }

  const released = Boolean(data?.dpp?.resultsReleased);

  return (
    <PageShell
      embedded
      eyebrow="D.P.P. results"
      title={data?.dpp?.title || 'Results'}
      description={
        data?.dpp
          ? `${classLabel(data.dpp)} · ${formatDate(data.dpp.practiceDate)} · ${formatMarks(data.dpp.totalMarks)} marks`
          : 'Scores for every student who has submitted.'
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to={`${basePath}/dpps`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {status === 'ready' && !data?.dpp?.isPublished ? (
            <Link to={`${basePath}/dpps/${id}/edit`}>
              <Button variant="secondary" size="sm">
                Edit DPP
              </Button>
            </Link>
          ) : null}
          {status === 'ready' ? (
            <Button size="sm" loading={releasing} onClick={handleRelease}>
              <Megaphone className="h-4 w-4" />
              {released ? 'Resend release email' : 'Release results'}
            </Button>
          ) : null}
        </div>
      }
    >
      {actionError ? (
        <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}
      {actionInfo ? (
        <Alert type="success" title="Done" onClose={() => setActionInfo('')} className="mb-4">
          {actionInfo}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading results…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone={released ? 'lagoon' : 'ember'}>
              {released ? 'Results released to students' : 'Results on hold'}
            </Badge>
            {released && data.dpp.resultsReleasedAt ? (
              <span className="text-xs text-ink-900/50">
                Released {formatDate(data.dpp.resultsReleasedAt)}
              </span>
            ) : (
              <span className="text-xs text-ink-900/50">
                Students cannot see scores until you release results.
              </span>
            )}
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <p className="font-display text-3xl font-extrabold text-ink-900">
                {data.summary.submitted}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                Submitted
              </p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-3xl font-extrabold text-lagoon-700">
                {Math.round(data.summary.averagePercentage)}%
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                Class average
              </p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-3xl font-extrabold text-ember-600">
                {Math.round(data.summary.highestPercentage)}%
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                Highest
              </p>
            </Card>
          </div>

          {data.results.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              description={
                data.dpp.isPublished
                  ? 'Students have not attempted this DPP yet.'
                  : 'This DPP is still a draft, so students cannot see it.'
              }
              icon={BarChart3}
              action={
                data.dpp.isPublished ? null : (
                  <Link to={`${basePath}/dpps/${id}/edit`}>
                    <Button>Publish it</Button>
                  </Link>
                )
              }
            />
          ) : (
            <Card className="overflow-hidden p-0">
              <ResultsTable results={data.results} />
            </Card>
          )}
        </>
      ) : null}
    </PageShell>
  );
}
