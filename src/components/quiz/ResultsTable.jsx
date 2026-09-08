import { Badge } from '../ui/Badge';
import { formatDuration, formatMarks } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';

function scoreTone(percentage) {
  if (percentage >= 75) return 'text-lagoon-700';
  if (percentage >= 40) return 'text-ember-600';
  return 'text-red-600';
}

export function ResultsTable({ results }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] text-left text-sm">
        <thead className="bg-ink-900/4 text-xs uppercase tracking-wide text-ink-900/55">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Student</th>
            <th className="px-4 py-3 font-semibold">Score</th>
            <th className="px-4 py-3 font-semibold">%</th>
            <th className="px-4 py-3 font-semibold">Right</th>
            <th className="px-4 py-3 font-semibold">Wrong</th>
            <th className="px-4 py-3 font-semibold">Skipped</th>
            <th className="px-4 py-3 font-semibold">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/8">
          {results.map((row, index) => (
            <tr key={row.id} className="transition hover:bg-lagoon-50/50">
              <td className="px-4 py-3 font-semibold text-ink-900/45">{index + 1}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-ink-900">{row.studentName}</p>
                <p className="text-xs text-ink-900/50">
                  {row.rollNumber ? `Roll ${row.rollNumber} · ` : ''}
                  {row.studentEmail}
                </p>
                {row.autoSubmitted ? (
                  <Badge tone="ember" className="mt-1">
                    Auto-submitted
                  </Badge>
                ) : null}
              </td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
