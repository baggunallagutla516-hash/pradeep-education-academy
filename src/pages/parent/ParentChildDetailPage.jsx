import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  GraduationCap,
  Hash,
  Mail,
  Phone,
  School,
} from 'lucide-react';
import { parentApi } from '../../api/parentApi';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatDate, formatDuration, formatMarks } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

function Fact({ icon: Icon, label, value }) {
  const display = value && String(value).trim() ? value : null;
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-ink-900/[0.03] px-3.5 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-lagoon-700 shadow-sm ring-1 ring-ink-900/8">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-900/45">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-ink-900" title={display || undefined}>
          {display || <span className="font-medium text-ink-900/35">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

function scoreTone(percentage) {
  if (percentage >= 75) return 'text-lagoon-700';
  if (percentage >= 40) return 'text-ember-600';
  return 'text-red-600';
}

function ResultsSection({ title, rows, emptyLabel }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-ink-900/8 px-5 py-4">
        <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-900/50">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-ink-900/4 text-xs uppercase tracking-wide text-ink-900/55">
              <tr>
                <th className="px-4 py-3 font-semibold">Assessment</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">%</th>
                <th className="px-4 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8">
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-lagoon-50/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink-900">{row.title}</p>
                    <p className="text-xs text-ink-900/50">
                      {[row.subject, row.chapter].filter(Boolean).join(' · ') || '—'}
                    </p>
                    {row.autoSubmitted ? (
                      <Badge tone="ember" className="mt-1">
                        Auto-submitted
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-ink-900/70">
                    {formatDate(row.date || row.submittedAt) || '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-ink-900">
                    {formatMarks(row.scoredMarks)} / {formatMarks(row.totalMarks)}
                  </td>
                  <td className={cn('px-4 py-3 font-bold tabular-nums', scoreTone(row.percentage))}>
                    {Math.round(row.percentage)}%
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-900/60">
                    {formatDuration(row.timeTakenSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function ParentChildDetailPage() {
  const { studentId } = useParams();
  const [child, setChild] = useState(null);
  const [results, setResults] = useState({ dpps: [], slipTests: [] });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const [childRes, resultsRes] = await Promise.all([
        parentApi.child(studentId),
        parentApi.childResults(studentId),
      ]);
      setChild(childRes.data.data.child);
      setResults(resultsRes.data.data.results || { dpps: [], slipTests: [] });
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load student details.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const totalResults = (results.dpps?.length || 0) + (results.slipTests?.length || 0);

  return (
    <PageShell
      embedded
      eyebrow="Child"
      title={child?.fullName || 'Student details'}
      description="Profile and assessment results for a student linked to your parent account."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {child ? <Badge>{classLabel(child)}</Badge> : null}
          <Link to="/parent/children">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading student…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' && child ? (
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-900/45">
                  Student profile
                </p>
                <p className="mt-0.5 text-sm text-ink-900/60">
                  Contact and class details for {child.fullName.split(' ')[0]}.
                </p>
              </div>
              <Badge>{classLabel(child)}</Badge>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              <Fact icon={Mail} label="Email" value={child.email} />
              <Fact icon={Phone} label="Phone" value={child.phone} />
              <Fact icon={GraduationCap} label="Class" value={classLabel(child)} />
              <Fact icon={School} label="School" value={child.schoolName} />
              <Fact icon={Hash} label="Roll number" value={child.rollNumber} />
            </div>
          </Card>

          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-lagoon-700" />
                <h2 className="font-display text-xl font-bold text-ink-900">Results</h2>
              </div>
              {totalResults > 0 ? (
                <p className="text-sm text-ink-900/50">
                  {totalResults} submitted assessment{totalResults === 1 ? '' : 's'}
                </p>
              ) : null}
            </div>

            {totalResults === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No results yet"
                description="Submitted D.P.P. and slip test scores will appear here once your child completes them."
              />
            ) : (
              <div className="space-y-4">
                <ResultsSection
                  title="D.P.P. results"
                  rows={results.dpps || []}
                  emptyLabel="No D.P.P. submissions yet."
                />
                <ResultsSection
                  title="Slip test results"
                  rows={results.slipTests || []}
                  emptyLabel="No slip test submissions yet."
                />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
