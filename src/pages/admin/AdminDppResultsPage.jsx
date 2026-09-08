import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatDate, formatMarks } from '../../utils/quizFormat';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResultsTable } from '../../components/quiz/ResultsTable';

export function AdminDppResultsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const res = await adminApi.dppResults(id);
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
          <Link to="/admin/dpps">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <Link to={`/admin/dpps/${id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit DPP
            </Button>
          </Link>
        </div>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading results…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' ? (
        <>
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
                  <Link to={`/admin/dpps/${id}/edit`}>
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

          <p className="mt-4 text-xs text-ink-900/50">
            <Badge tone="ink">Note</Badge> Auto-submitted rows are attempts where the timer ran out
            before the student pressed submit.
          </p>
        </>
      ) : null}
    </PageShell>
  );
}
