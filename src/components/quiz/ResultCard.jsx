import { Check, CircleSlash, Minus, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDuration, formatMarks, optionLabel } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';
import { MathText } from './MathText';

const OUTCOMES = {
  correct: { label: 'Correct', tone: 'text-lagoon-700', chip: 'bg-lagoon-100 text-lagoon-800', icon: Check },
  partial: { label: 'Partly correct', tone: 'text-ember-700', chip: 'bg-ember-400/20 text-ember-700', icon: Minus },
  wrong: { label: 'Wrong', tone: 'text-red-600', chip: 'bg-red-100 text-red-700', icon: X },
  unanswered: { label: 'Not answered', tone: 'text-ink-900/50', chip: 'bg-ink-900/8 text-ink-800', icon: CircleSlash },
};

function Stat({ label, value, className }) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2.5 text-center">
      <p className={cn('font-display text-xl font-extrabold', className)}>{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-900/50">
        {label}
      </p>
    </div>
  );
}

function ReviewQuestion({ item }) {
  const outcome = OUTCOMES[item.outcome] || OUTCOMES.unanswered;
  const OutcomeIcon = outcome.icon;
  const isBlank = item.type === 'blank';
  const isMatrix = item.type === 'matrix';

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="ink">Q{item.number}</Badge>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold',
            outcome.chip
          )}
        >
          <OutcomeIcon className="h-3.5 w-3.5" />
          {outcome.label}
        </span>
        <span className="text-xs text-ink-900/50">
          {formatMarks(item.awardedMarks)} / {formatMarks(item.marks)} marks
        </span>
      </div>

      <MathText
        as="p"
        text={item.text}
        className="text-base font-semibold leading-relaxed text-ink-900"
      />

      {isBlank ? (
        <div className="mt-3 space-y-2">
          <div
            className={cn(
              'rounded-xl border px-4 py-2.5 text-sm',
              item.outcome === 'correct' && 'border-lagoon-400 bg-lagoon-50',
              item.outcome === 'wrong' && 'border-red-300 bg-red-50',
              item.outcome === 'unanswered' && 'border-ink-900/10 bg-white'
            )}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-900/45">
              Your answer
            </p>
            <MathText
              text={item.textAnswer?.trim() ? item.textAnswer : '—'}
              className="mt-1 block font-medium text-ink-900"
            />
          </div>
          <div className="rounded-xl border border-lagoon-400 bg-lagoon-50 px-4 py-2.5 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-lagoon-800">
              Accepted answer{(item.correctAnswers || []).length === 1 ? '' : 's'}
            </p>
            <MathText
              text={(item.correctAnswers || []).join(' · ') || '—'}
              className="mt-1 block font-medium text-ink-900"
            />
          </div>
        </div>
      ) : isMatrix ? (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-ink-900/10 bg-sand-50 px-3 py-2 text-left">Row</th>
                <th className="border border-ink-900/10 bg-sand-50 px-3 py-2 text-left">Your pick</th>
                <th className="border border-ink-900/10 bg-sand-50 px-3 py-2 text-left">Correct</th>
              </tr>
            </thead>
            <tbody>
              {(item.rows || []).map((row) => {
                const picked = Number(item.matrixAnswers?.[row.index]);
                const correct = Number(item.correctMatrix?.[row.index]);
                const pickLabel =
                  Number.isInteger(picked) && picked >= 0
                    ? item.options?.find((option) => option.index === picked)?.text || optionLabel(picked)
                    : '—';
                const correctLabel =
                  Number.isInteger(correct) && correct >= 0
                    ? item.options?.find((option) => option.index === correct)?.text ||
                      optionLabel(correct)
                    : '—';
                const rowOk = picked === correct && picked >= 0;
                return (
                  <tr key={row.index}>
                    <td className="border border-ink-900/10 px-3 py-2 font-medium text-ink-900">
                      <MathText text={row.text} />
                    </td>
                    <td
                      className={cn(
                        'border border-ink-900/10 px-3 py-2',
                        rowOk ? 'bg-lagoon-50 text-lagoon-800' : 'bg-red-50 text-red-700'
                      )}
                    >
                      <MathText text={pickLabel} />
                    </td>
                    <td className="border border-ink-900/10 bg-lagoon-50 px-3 py-2 text-lagoon-800">
                      <MathText text={correctLabel} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {item.options.map((option, displayIndex) => {
            const isCorrect = item.correctOptions.includes(option.index);
            const isPicked = item.selectedOptions.includes(option.index);

            return (
              <div
                key={option.index}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-4 py-2.5 text-sm',
                  isCorrect && 'border-lagoon-400 bg-lagoon-50',
                  !isCorrect && isPicked && 'border-red-300 bg-red-50',
                  !isCorrect && !isPicked && 'border-ink-900/10 bg-white'
                )}
              >
                <span className="w-5 shrink-0 pt-0.5 text-sm font-bold text-ink-900/45">
                  {optionLabel(displayIndex)}
                </span>
                <MathText text={option.text} className="flex-1 leading-relaxed text-ink-900" />
                <span className="flex shrink-0 flex-wrap justify-end gap-1">
                  {isPicked ? (
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 text-[11px] font-bold',
                        isCorrect ? 'bg-lagoon-200 text-lagoon-800' : 'bg-red-200 text-red-800'
                      )}
                    >
                      Your answer
                    </span>
                  ) : null}
                  {isCorrect ? (
                    <span className="rounded-md bg-lagoon-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      Correct
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {item.explanation ? (
        <div className="mt-3 rounded-xl border border-lagoon-200 bg-lagoon-50/60 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-lagoon-800">Explanation</p>
          <MathText
            text={item.explanation}
            className="mt-1 block text-sm leading-relaxed text-ink-900/75"
          />
        </div>
      ) : null}
    </div>
  );
}

export function ResultCard({ result }) {
  const percentage = Math.round(result.percentage);

  return (
    <div>
      <Card className="animate-fade-up overflow-hidden bg-gradient-to-br from-lagoon-50 via-white to-sand-100 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-soft">
          <span className="text-5xl leading-none" role="img" aria-label={result.tierLabel}>
            {result.emoji}
          </span>
        </div>

        <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">
          {result.tierLabel}
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-ink-900/60">
          {result.tierMessage}
        </p>

        <p className="mt-5 font-display text-5xl font-extrabold tracking-tight text-ink-900">
          {formatMarks(result.scoredMarks)}
          <span className="text-2xl text-ink-900/40"> / {formatMarks(result.totalMarks)}</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-lagoon-700">{percentage}% score</p>

        <div
          className="mx-auto mt-4 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-ink-900/8"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-lagoon-400 to-lagoon-600 transition-[width] duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Correct" value={result.correctCount} className="text-lagoon-700" />
          {result.partialCount > 0 ? (
            <Stat label="Partly right" value={result.partialCount} className="text-ember-600" />
          ) : null}
          <Stat label="Wrong" value={result.wrongCount} className="text-red-600" />
          <Stat label="Skipped" value={result.unansweredCount} className="text-ink-900/60" />
          {result.partialCount > 0 ? null : (
            <Stat
              label="Time taken"
              value={formatDuration(result.timeTakenSeconds)}
              className="text-ink-900"
            />
          )}
        </div>

        {result.partialCount > 0 ? (
          <p className="mt-3 text-xs text-ink-900/50">
            Finished in {formatDuration(result.timeTakenSeconds)}
          </p>
        ) : null}

        {result.autoSubmitted ? (
          <p className="mt-3 text-xs font-medium text-ember-700">
            Time ran out, so this was submitted automatically.
          </p>
        ) : null}
      </Card>

      {result.showAnswers && result.review?.length ? (
        <section className="mt-8">
          <h3 className="mb-1 font-display text-xl font-bold text-ink-900">Answer review</h3>
          <p className="mb-4 text-sm text-ink-900/60">
            Go through the ones you missed — correct answers are highlighted in green.
          </p>
          <div className="space-y-4">
            {result.review.map((item) => (
              <ReviewQuestion key={item.number} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {!result.showAnswers ? (
        <p className="mt-6 rounded-2xl border border-dashed border-ink-900/15 bg-white/60 px-6 py-5 text-center text-sm text-ink-900/60">
          Your teacher has not released the answer key for this test.
        </p>
      ) : null}
    </div>
  );
}
