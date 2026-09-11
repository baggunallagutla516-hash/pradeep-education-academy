import { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { optionLabel } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';
import { MathText } from './MathText';

function typeBadge(type) {
  if (type === 'multiple') return { tone: 'ember', label: 'Select all that apply' };
  if (type === 'blank') return { tone: 'ink', label: 'Fill in the blank' };
  if (type === 'matrix') return { tone: 'ember', label: 'Matrix — one per row' };
  return { tone: 'lagoon', label: 'Select one' };
}

/**
 * Student-login style preview of one authored question (read-only).
 */
export function QuestionStudentPreview({ open, onClose, question, number = 1 }) {
  const [matrixPicks, setMatrixPicks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [textAnswer, setTextAnswer] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    setMatrixPicks((question?.rows || []).map(() => -1));
    setSelected([]);
    setTextAnswer('');
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, question]);

  if (!open || !question) return null;

  const badge = typeBadge(question.type);
  const marks = Number(question.marks) || 0;
  const isBlank = question.type === 'blank';
  const isMatrix = question.type === 'matrix';
  const options = (question.options || []).map((option, index) => ({
    index,
    text: option.text || '',
  }));
  const rows = (question.rows || []).map((row, index) => ({
    index,
    text: row.text || '',
  }));

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-900/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Student question preview"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#f4f6f8] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-[#1e3a5f] px-4 py-3 text-white">
          <div>
            <p className="text-sm font-bold">Student view preview</p>
            <p className="text-xs text-white/70">How this question looks after login</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="ink">Q{number}</Badge>
              <Badge tone={badge.tone}>{badge.label}</Badge>
              <span className="text-xs text-ink-900/50">
                {marks} mark{marks === 1 ? '' : 's'}
              </span>
            </div>

            {question.text?.trim() ? (
              <MathText
                as="p"
                text={question.text}
                className="text-base font-semibold leading-relaxed text-ink-900"
              />
            ) : (
              <p className="text-sm italic text-ink-900/45">No question text yet.</p>
            )}

            {isBlank ? (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-semibold text-ink-800">Your answer</label>
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(event) => setTextAnswer(event.target.value)}
                  placeholder="Type your answer"
                  className="h-11 w-full rounded-xl border border-ink-900/10 bg-white px-4 text-sm text-ink-900"
                />
              </div>
            ) : isMatrix ? (
              <div className="mt-4 overflow-x-auto">
                {rows.length === 0 || options.length === 0 ? (
                  <p className="text-sm italic text-ink-900/45">
                    Add rows and columns to preview the matrix table.
                  </p>
                ) : (
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="border border-ink-900/10 bg-sand-50 px-3 py-2 text-left font-semibold text-ink-900/70">
                          Statement
                        </th>
                        {options.map((option) => (
                          <th
                            key={option.index}
                            className="border border-ink-900/10 bg-sand-50 px-3 py-2 text-center font-semibold text-ink-900"
                          >
                            <MathText text={option.text || optionLabel(option.index)} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.index}>
                          <td className="border border-ink-900/10 px-3 py-2 font-medium text-ink-900">
                            <MathText text={row.text || `Row ${row.index + 1}`} />
                          </td>
                          {options.map((option) => {
                            const checked = Number(matrixPicks[row.index]) === option.index;
                            return (
                              <td
                                key={option.index}
                                className="border border-ink-900/10 px-3 py-2 text-center"
                              >
                                <input
                                  type="radio"
                                  name={`preview-matrix-${row.index}`}
                                  checked={checked}
                                  onChange={() =>
                                    setMatrixPicks((prev) => {
                                      const next = [...prev];
                                      next[row.index] = option.index;
                                      return next;
                                    })
                                  }
                                  className="h-4 w-4 accent-lagoon-600"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {options.length === 0 ? (
                  <p className="text-sm italic text-ink-900/45">Add options to preview choices.</p>
                ) : (
                  options.map((option, displayIndex) => {
                    const isSelected = selected.includes(option.index);
                    return (
                      <label
                        key={option.index}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition',
                          isSelected
                            ? 'border-lagoon-500 bg-lagoon-50 shadow-sm'
                            : 'border-ink-900/10 bg-white hover:border-lagoon-300'
                        )}
                      >
                        <input
                          type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                          name="preview-choice"
                          checked={isSelected}
                          onChange={() => {
                            if (question.type === 'multiple') {
                              setSelected((prev) =>
                                prev.includes(option.index)
                                  ? prev.filter((value) => value !== option.index)
                                  : [...prev, option.index].sort((a, b) => a - b)
                              );
                            } else {
                              setSelected([option.index]);
                            }
                          }}
                          className="h-4 w-4 shrink-0 accent-lagoon-600"
                        />
                        <span className="w-5 shrink-0 text-sm font-bold text-ink-900/45">
                          {optionLabel(displayIndex)}
                        </span>
                        <MathText
                          text={option.text || `Option ${optionLabel(displayIndex)}`}
                          className="text-sm leading-relaxed text-ink-900"
                        />
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-ink-900/50">
            Correct answers are hidden here, same as for students during the test.
          </p>
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Close preview
          </Button>
        </div>
      </div>
    </div>
  );
}

export function QuestionPreviewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-lagoon-700 transition hover:bg-lagoon-50"
      aria-label="Preview as student"
      title="Preview as student"
    >
      <Eye className="h-4 w-4" />
      Preview
    </button>
  );
}
