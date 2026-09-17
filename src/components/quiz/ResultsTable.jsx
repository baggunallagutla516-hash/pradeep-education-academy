import { Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { formatDuration, formatMarks } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';

function scoreTone(percentage) {
  if (percentage >= 75) return 'text-lagoon-700';
  if (percentage >= 40) return 'text-ember-600';
  return 'text-red-600';
}

/** Sort by score (best first), then faster time for ties. */
function sortByRank(results) {
  return [...results].sort((a, b) => {
    const pctDiff = Number(b.percentage || 0) - Number(a.percentage || 0);
    if (pctDiff !== 0) return pctDiff;

    const marksDiff = Number(b.scoredMarks || 0) - Number(a.scoredMarks || 0);
    if (marksDiff !== 0) return marksDiff;

    return Number(a.timeTakenSeconds || 0) - Number(b.timeTakenSeconds || 0);
  });
}

/**
 * Competition ranks: equal percentage shares a rank; next distinct score skips
 * (e.g. 33%, 33%, 0% → 1, 1, 3).
 */
function withRanks(results) {
  const sorted = sortByRank(results);
  let lastPercentage = null;
  let lastRank = 0;

  return sorted.map((row, index) => {
    const percentage = Number(row.percentage || 0);
    if (lastPercentage === null || percentage !== lastPercentage) {
      lastRank = index + 1;
      lastPercentage = percentage;
    }
    return { ...row, rank: lastRank };
  });
}

export function ResultsTable({
  results,
  onReattempt,
  onToggleHide,
  onDelete,
  busyAttemptId,
  busyAction,
}) {
  const ranked = withRanks(results);
  const showActions =
    typeof onReattempt === 'function' ||
    typeof onToggleHide === 'function' ||
    typeof onDelete === 'function';

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="bg-ink-900/4 text-xs uppercase tracking-wide text-ink-900/55">
          <tr>
            <th className="px-4 py-3 font-semibold">Rank</th>
            <th className="px-4 py-3 font-semibold">Participant</th>
            {showActions ? <th className="px-4 py-3 font-semibold">Actions</th> : null}
            <th className="px-4 py-3 font-semibold">Score</th>
            <th className="px-4 py-3 font-semibold">%</th>
            <th className="px-4 py-3 font-semibold">Right</th>
            <th className="px-4 py-3 font-semibold">Wrong</th>
            <th className="px-4 py-3 font-semibold">Skipped</th>
            <th className="px-4 py-3 font-semibold">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/8">
          {ranked.map((row) => {
            const anyBusy = Boolean(busyAttemptId);
            const isBusy = (action) => busyAttemptId === row.id && busyAction === action;
            const hidden = Boolean(row.resultsHidden);

            return (
              <tr
                key={row.id}
                className={cn(
                  'transition hover:bg-lagoon-50/50',
                  hidden && 'bg-ink-900/[0.03]'
                )}
              >
                <td className="px-4 py-3 font-display text-base font-extrabold tabular-nums text-ink-900">
                  {row.rank}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <ProfileAvatar
                      src={row.profilePhotoUrl}
                      name={row.studentName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900">{row.studentName}</p>
                      <p className="text-xs text-ink-900/50">
                        {row.roleLabel ? `${row.roleLabel} · ` : ''}
                        {row.rollNumber ? `Roll ${row.rollNumber} · ` : ''}
                        {row.studentEmail}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {row.autoSubmitted ? (
                          <Badge tone="ember">Auto-submitted</Badge>
                        ) : null}
                        {hidden ? <Badge tone="ink">Hidden</Badge> : null}
                      </div>
                    </div>
                  </div>
                </td>
                {showActions ? (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {typeof onReattempt === 'function' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={isBusy('reattempt')}
                          disabled={anyBusy && !isBusy('reattempt')}
                          onClick={() => onReattempt(row)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reattempt
                        </Button>
                      ) : null}
                      {typeof onToggleHide === 'function' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={isBusy('hide')}
                          disabled={anyBusy && !isBusy('hide')}
                          onClick={() => onToggleHide(row)}
                        >
                          {hidden ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                          {hidden ? 'Unhide' : 'Hide'}
                        </Button>
                      ) : null}
                      {typeof onDelete === 'function' ? (
                        <Button
                          size="sm"
                          variant="danger"
                          loading={isBusy('delete')}
                          disabled={anyBusy && !isBusy('delete')}
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
                <td className="px-4 py-3 font-semibold tabular-nums text-ink-900">
                  {formatMarks(row.scoredMarks)} / {formatMarks(row.totalMarks)}
                </td>
                <td className={cn('px-4 py-3 font-bold tabular-nums', scoreTone(row.percentage))}>
                  {Math.round(row.percentage)}%
                </td>
                <td className="px-4 py-3 tabular-nums text-lagoon-700">
                  {row.correctCount}
                  {row.partialCount > 0 ? (
                    <span className="text-ember-600"> (+{row.partialCount} partial)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums text-red-600">{row.wrongCount}</td>
                <td className="px-4 py-3 tabular-nums text-ink-900/55">{row.unansweredCount}</td>
                <td className="px-4 py-3 tabular-nums text-ink-900/60">
                  {formatDuration(row.timeTakenSeconds)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
