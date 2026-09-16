import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, Megaphone } from 'lucide-react';
import { useStaffContent } from '../../context/StaffContentContext';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatDate, formatMarks } from '../../utils/quizFormat';
import { downloadWorkbook, resultsExportRows } from '../../utils/excelExport';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResultsTable } from '../../components/quiz/ResultsTable';

export function AdminAssessmentResultsPage() {
  const { basePath, api } = useStaffContent();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionInfo, setActionInfo] = useState('');
  const [releasing, setReleasing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [busyAttemptId, setBusyAttemptId] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const res = await api.assessmentResults(id);
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
    const pending = Number(data?.summary?.pendingReleaseCount || 0);
    const released = data?.assessment?.resultsReleased;
    if (pending <= 0) return;

    const confirmMessage = released
      ? `Announce results for ${pending} new submission${pending === 1 ? '' : 's'}? Those students will be able to view scores and get an email (no scores in the email).`
      : 'Announce results to students? They will be able to view scores on the site, and each submitted student will get an email (no scores in the email).';
    if (!window.confirm(confirmMessage)) return;

    setReleasing(true);
    setActionError('');
    setActionInfo('');
    try {
      const res = await api.releaseAssessmentResults(id);
      const notify = res.data.data.notify || {};
      setData((prev) =>
        prev
          ? {
              ...prev,
              assessment: res.data.data.assessment || {
                ...prev.assessment,
                resultsReleased: true,
              },
              summary: {
                ...prev.summary,
                pendingReleaseCount: res.data.data.summary?.pendingReleaseCount ?? 0,
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
      setActionError(getErrorMessage(err, 'Could not announce results.'));
    } finally {
      setReleasing(false);
    }
  }

  async function handleReattempt(row) {
    const name = row.studentName || 'this participant';
    const role = row.roleLabel ? ` (${row.roleLabel})` : '';
    if (
      !window.confirm(
        `Let ${name}${role} write this online assessment again? Their current score is removed until they submit a new attempt.`
      )
    ) {
      return;
    }

    setBusyAttemptId(row.id);
    setBusyAction('reattempt');
    setActionError('');
    setActionInfo('');
    try {
      const res = await api.reattemptAssessment(id, row.id);
      setActionInfo(res.data.message || `${name} can write this assessment again.`);
      const refreshed = await api.assessmentResults(id);
      setData(refreshed.data.data);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not allow a reattempt.'));
    } finally {
      setBusyAttemptId(null);
      setBusyAction(null);
    }
  }

  async function handleExport() {
    if (!data?.results?.length) return;
    setActionError('');
    setExporting(true);
    try {
      const slug = (data.assessment?.title || 'assessment')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
      downloadWorkbook(resultsExportRows(data.results), {
        sheetName: 'Results',
        fileName: `${slug || 'assessment'}-results-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not download Excel.'));
    } finally {
      setExporting(false);
    }
  }

  async function handleToggleHide(row) {
    const name = row.studentName || 'this participant';
    const hide = !row.resultsHidden;
    if (
      !window.confirm(
        hide
          ? `Hide ${name}'s result everywhere? They will not see scores until you unhide.`
          : `Unhide ${name}'s result? They can see scores again if results are announced.`
      )
    ) {
      return;
    }

    setBusyAttemptId(row.id);
    setBusyAction('hide');
    setActionError('');
    setActionInfo('');
    try {
      const res = await api.setAssessmentAttemptVisibility(id, row.id, hide);
      setActionInfo(res.data.message || (hide ? 'Result hidden.' : 'Result unhidden.'));
      const refreshed = await api.assessmentResults(id);
      setData(refreshed.data.data);
    } catch (err) {
      setActionError(getErrorMessage(err, hide ? 'Could not hide result.' : 'Could not unhide result.'));
    } finally {
      setBusyAttemptId(null);
      setBusyAction(null);
    }
  }

  async function handleDelete(row) {
    const name = row.studentName || 'this participant';
    if (
      !window.confirm(
        `Delete ${name}'s result everywhere? This cannot be undone. They can submit again only if the assessment is still open.`
      )
    ) {
      return;
    }

    setBusyAttemptId(row.id);
    setBusyAction('delete');
    setActionError('');
    setActionInfo('');
    try {
      const res = await api.deleteAssessmentAttempt(id, row.id);
      setActionInfo(res.data.message || 'Result deleted.');
      const refreshed = await api.assessmentResults(id);
      setData(refreshed.data.data);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete result.'));
    } finally {
      setBusyAttemptId(null);
      setBusyAction(null);
    }
  }

  const released = Boolean(data?.assessment?.resultsReleased);
  const pendingReleaseCount = Number(data?.summary?.pendingReleaseCount || 0);
  const canAnnounce = pendingReleaseCount > 0;

  return (
    <PageShell
      embedded
      eyebrow="Online assessment results"
      title={data?.assessment?.title || 'Results'}
      description={
        data?.assessment
          ? `${classLabel(data.assessment)} · ${formatDate(data.assessment.assessmentDate)} · ${formatMarks(data.assessment.totalMarks)} marks`
          : 'Scores for every student who has submitted.'
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to={`${basePath}/assessments`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {status === 'ready' && data?.results?.length ? (
            <Button variant="secondary" size="sm" loading={exporting} onClick={handleExport}>
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
          ) : null}
          {status === 'ready' && !data?.assessment?.isPublished ? (
            <Link to={`${basePath}/assessments/${id}/edit`}>
              <Button variant="secondary" size="sm">
                Edit online assessment
              </Button>
            </Link>
          ) : null}
          {status === 'ready' ? (
            <Button
              size="sm"
              loading={releasing}
              disabled={!canAnnounce}
              onClick={handleRelease}
            >
              <Megaphone className="h-4 w-4" />
              {canAnnounce
                ? released
                  ? `Announce new results (${pendingReleaseCount})`
                  : 'Announce results'
                : released
                  ? 'Results announced'
                  : 'Announce results'}
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
            <Badge tone={released && !canAnnounce ? 'lagoon' : 'ember'}>
              {released && !canAnnounce
                ? 'Results announced'
                : canAnnounce && released
                  ? `${pendingReleaseCount} new result${pendingReleaseCount === 1 ? '' : 's'} pending announce`
                  : 'Results on hold'}
            </Badge>
            {released && data.assessment.resultsReleasedAt ? (
              <span className="text-xs text-ink-900/50">
                Last announced {formatDate(data.assessment.resultsReleasedAt)}
              </span>
            ) : (
              <span className="text-xs text-ink-900/50">
                Students cannot see scores until you announce results.
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
                data.assessment.isPublished
                  ? 'Students have not attempted this assessment yet.'
                  : 'This assessment is still a draft, so students cannot see it.'
              }
              icon={BarChart3}
              action={
                data.assessment.isPublished ? null : (
                  <Link to={`${basePath}/assessments/${id}/edit`}>
                    <Button>Publish it</Button>
                  </Link>
                )
              }
            />
          ) : (
            <Card className="overflow-hidden p-0">
              <ResultsTable
                results={data.results}
                onReattempt={handleReattempt}
                onToggleHide={handleToggleHide}
                onDelete={handleDelete}
                busyAttemptId={busyAttemptId}
                busyAction={busyAction}
              />
            </Card>
          )}

          <p className="mt-4 text-xs text-ink-900/50">
            <Badge tone="ink">Note</Badge> Announce emails tell students to open results on the
            website. Scores are never included in the email. Late attempts after announce stay on
            hold until you announce again. Reattempt clears the score while open; Hide keeps the
            attempt but hides scores; Delete removes the result everywhere.
          </p>
        </>
      ) : null}
    </PageShell>
  );
}
