import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { formatClock, optionLabel } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';

function readStoredAnswers(storageKey) {
  if (!storageKey) return { selections: {}, textAnswers: {} };
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { selections: {}, textAnswers: {} };
    const parsed = JSON.parse(raw);

    // Legacy format stored only option indexes per question id.
    if (!parsed || Array.isArray(parsed) || (!parsed.selections && !parsed.textAnswers)) {
      return { selections: parsed || {}, textAnswers: {} };
    }

    return {
      selections: parsed.selections || {},
      textAnswers: parsed.textAnswers || {},
    };
  } catch {
    return { selections: {}, textAnswers: {} };
  }
}

function typeBadge(question) {
  if (question.type === 'multiple') {
    return { tone: 'ember', label: 'Select all that apply' };
  }
  if (question.type === 'blank') {
    return { tone: 'ink', label: 'Fill in the blank' };
  }
  return { tone: 'lagoon', label: 'Select one' };
}

function QuestionBlock({ question, selected, textAnswer, onToggle, onTextChange }) {
  const badge = typeBadge(question);
  const isBlank = question.type === 'blank';

  return (
    <div id={`question-${question.number}`} className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="ink">Q{question.number}</Badge>
        <Badge tone={badge.tone}>{badge.label}</Badge>
        <span className="text-xs text-ink-900/50">
          {question.marks} mark{question.marks === 1 ? '' : 's'}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-ink-900">
        {question.text}
      </p>

      {isBlank ? (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor={`blank-${question.id}`}>
            Your answer
          </label>
          <input
            id={`blank-${question.id}`}
            type="text"
            value={textAnswer}
            onChange={(event) => onTextChange(question, event.target.value)}
            placeholder="Type your answer"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-ink-900/10 bg-white px-4 text-sm text-ink-900 transition placeholder:text-ink-900/35 focus:border-lagoon-500 focus:outline-none focus:ring-2 focus:ring-lagoon-500/20"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {question.options.map((option, displayIndex) => {
            const isSelected = selected.includes(option.index);
            return (
              <label
                key={option.index}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition',
                  isSelected
                    ? 'border-lagoon-500 bg-lagoon-50 shadow-sm'
                    : 'border-ink-900/10 bg-white hover:border-lagoon-300 hover:bg-lagoon-50/40'
                )}
              >
                <input
                  type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                  name={`question-${question.id}`}
                  checked={isSelected}
                  onChange={() => onToggle(question, option.index)}
                  className="h-4 w-4 shrink-0 accent-lagoon-600"
                />
                <span className="w-5 shrink-0 text-sm font-bold text-ink-900/45">
                  {optionLabel(displayIndex)}
                </span>
                <span className="text-sm leading-relaxed text-ink-900">{option.text}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AttemptRunner({
  title,
  subtitle,
  questions,
  initialRemainingSeconds,
  storageKey,
  submitting,
  error,
  onDismissError,
  onSubmit,
}) {
  const [selections, setSelections] = useState(() => readStoredAnswers(storageKey).selections);
  const [textAnswers, setTextAnswers] = useState(() => readStoredAnswers(storageKey).textAnswers);
  const [remaining, setRemaining] = useState(initialRemainingSeconds);
  const submittedRef = useRef(false);

  const answeredCount = useMemo(
    () =>
      questions.filter((question) => {
        if (question.type === 'blank') {
          return Boolean((textAnswers[question.id] || '').trim());
        }
        return (selections[question.id] || []).length > 0;
      }).length,
    [questions, selections, textAnswers]
  );

  const handleSubmit = useCallback(
    (autoSubmitted) => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      const answers = questions.map((question) => ({
        questionId: question.id,
        selectedOptions: question.type === 'blank' ? [] : selections[question.id] || [],
        textAnswer: question.type === 'blank' ? textAnswers[question.id] || '' : '',
      }));

      Promise.resolve(onSubmit(answers, autoSubmitted)).catch(() => {
        // Let the student retry if the request failed.
        submittedRef.current = false;
      });
    },
    [onSubmit, questions, selections, textAnswers]
  );

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  useEffect(() => {
    if (remaining === 0) handleSubmit(true);
  }, [remaining, handleSubmit]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ selections, textAnswers })
      );
    } catch {
      /* a full or blocked storage should not break the test */
    }
  }, [selections, textAnswers, storageKey]);

  function toggleOption(question, optionIndex) {
    setSelections((prev) => {
      const current = prev[question.id] || [];
      if (question.type === 'single') {
        return { ...prev, [question.id]: [optionIndex] };
      }
      const next = current.includes(optionIndex)
        ? current.filter((value) => value !== optionIndex)
        : [...current, optionIndex].sort((a, b) => a - b);
      return { ...prev, [question.id]: next };
    });
  }

  function changeTextAnswer(question, value) {
    setTextAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function confirmSubmit() {
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      const message =
        `You have not answered ${unanswered} question${unanswered === 1 ? '' : 's'}. ` +
        'You cannot come back to this test after submitting. Submit anyway?';
      if (!window.confirm(message)) return;
    }
    handleSubmit(false);
  }

  const lowTime = remaining <= 60;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 mb-5 border-b border-ink-900/8 bg-sand-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-ink-900">{title}</p>
            <p className="text-xs text-ink-900/55">
              {subtitle ? `${subtitle} · ` : ''}
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-sm font-bold tabular-nums',
                lowTime ? 'animate-pulse bg-red-100 text-red-700' : 'bg-lagoon-100 text-lagoon-800'
              )}
              aria-label="Time remaining"
            >
              <Clock className="h-4 w-4" />
              {formatClock(remaining)}
            </span>
            <Button size="sm" loading={submitting} onClick={confirmSubmit}>
              Submit
            </Button>
          </div>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink-900/8">
          <div
            className="h-full rounded-full bg-lagoon-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error ? (
        <Alert type="error" title="Could not submit" onClose={onDismissError} className="mb-4">
          {error}
        </Alert>
      ) : null}

      {lowTime && remaining > 0 ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Less than a minute left. Your answers submit automatically when the timer ends.
        </div>
      ) : null}

      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionBlock
            key={question.id}
            question={question}
            selected={selections[question.id] || []}
            textAnswer={textAnswers[question.id] || ''}
            onToggle={toggleOption}
            onTextChange={changeTextAnswer}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-900/10 bg-white p-4">
        <p className="text-sm text-ink-900/60">
          {answeredCount === questions.length
            ? 'All questions answered. You can submit now.'
            : `${questions.length - answeredCount} question(s) still unanswered.`}
        </p>
        <Button loading={submitting} onClick={confirmSubmit}>
          Submit test
        </Button>
      </div>
    </div>
  );
}
