import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Maximize2 } from 'lucide-react';
import { formatClock, optionLabel } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';

function readStoredState(storageKey) {
  if (!storageKey) {
    return { selections: {}, marked: {}, visited: {}, currentIndex: 0 };
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { selections: {}, marked: {}, visited: {}, currentIndex: 0 };
    const parsed = JSON.parse(raw);
    return {
      selections: parsed.selections || {},
      marked: parsed.marked || {},
      visited: parsed.visited || {},
      currentIndex: Number.isInteger(parsed.currentIndex) ? parsed.currentIndex : 0,
    };
  } catch {
    return { selections: {}, marked: {}, visited: {}, currentIndex: 0 };
  }
}

function paletteTone({ answered, marked, visited }) {
  if (answered && marked) return 'bg-violet-600 text-white ring-2 ring-violet-300';
  if (marked) return 'bg-violet-500 text-white';
  if (answered) return 'bg-emerald-500 text-white';
  if (visited) return 'bg-red-500 text-white';
  return 'bg-slate-300 text-slate-700';
}

function isFullscreen() {
  return Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
  );
}

async function requestFullscreenSafe(element) {
  if (!element || isFullscreen()) return;
  try {
    if (element.requestFullscreen) await element.requestFullscreen();
    else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen) await element.msRequestFullscreen();
  } catch {
    /* browser may block without a fresh gesture */
  }
}

async function exitFullscreenSafe() {
  if (!isFullscreen()) return;
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
    else if (document.msExitFullscreen) await document.msExitFullscreen();
  } catch {
    /* ignore */
  }
}

/**
 * CBT-style attempt shell: one question, right-side palette, fullscreen with exit limit.
 */
export function CbtAttemptRunner({
  title,
  subject,
  studentName,
  questions,
  sections: sectionsProp,
  initialRemainingSeconds,
  durationMinutes,
  storageKey,
  submitting,
  error,
  onDismissError,
  onSubmit,
  fullscreenExitCount = 0,
  maxFullscreenExits = 3,
  onFullscreenExit,
}) {
  const rootRef = useRef(null);
  const submittedRef = useRef(false);
  const exitHandlingRef = useRef(false);
  const stored = useMemo(() => readStoredState(storageKey), [storageKey]);

  const sections = useMemo(() => {
    if (Array.isArray(sectionsProp) && sectionsProp.length > 0) return sectionsProp;
    const seen = [];
    questions.forEach((item) => {
      const name = item.section || 'Section A';
      if (!seen.includes(name)) seen.push(name);
    });
    return seen.length > 0 ? seen : ['Section A'];
  }, [sectionsProp, questions]);

  const [selections, setSelections] = useState(stored.selections);
  const [marked, setMarked] = useState(stored.marked);
  const [visited, setVisited] = useState(() => {
    const next = { ...stored.visited };
    const first = questions[stored.currentIndex]?.id || questions[0]?.id;
    if (first) next[first] = true;
    return next;
  });
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(stored.currentIndex, 0), Math.max(questions.length - 1, 0))
  );
  const [remaining, setRemaining] = useState(initialRemainingSeconds);
  const [exitCount, setExitCount] = useState(fullscreenExitCount);
  const [needsFullscreenGesture, setNeedsFullscreenGesture] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);

  const question = questions[currentIndex];
  const activeSection = question?.section || sections[0];
  const selected = question ? selections[question.id] || [] : [];
  const exitsRemaining = Math.max(0, maxFullscreenExits - exitCount);

  const sectionQuestions = useMemo(
    () =>
      questions
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => (item.section || sections[0]) === activeSection),
    [questions, activeSection, sections]
  );

  const goTo = useCallback(
    (index) => {
      const nextIndex = Math.min(Math.max(index, 0), questions.length - 1);
      const nextQuestion = questions[nextIndex];
      setCurrentIndex(nextIndex);
      if (nextQuestion) {
        setVisited((prev) => ({ ...prev, [nextQuestion.id]: true }));
      }
    },
    [questions]
  );

  function switchSection(sectionName) {
    if (sectionName === activeSection) return;
    const first = questions.findIndex((item) => (item.section || sections[0]) === sectionName);
    if (first >= 0) goTo(first);
  }

  const buildAnswers = useCallback(
    () =>
      questions.map((item) => ({
        questionId: item.id,
        selectedOptions: selections[item.id] || [],
        textAnswer: '',
      })),
    [questions, selections]
  );

  const handleSubmit = useCallback(
    (autoSubmitted, submitReason = 'manual') => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      Promise.resolve(onSubmit(buildAnswers(), autoSubmitted, submitReason)).catch(() => {
        submittedRef.current = false;
      });
    },
    [buildAnswers, onSubmit]
  );

  useEffect(() => {
    const el = rootRef.current;
    requestFullscreenSafe(el).then(() => {
      if (!isFullscreen()) setNeedsFullscreenGesture(true);
    });

    function onFsChange() {
      if (isFullscreen()) {
        setNeedsFullscreenGesture(false);
        return;
      }
      if (submittedRef.current || exitHandlingRef.current) return;
      exitHandlingRef.current = true;
      Promise.resolve(onFullscreenExit?.())
        .then((data) => {
          const nextCount = data?.fullscreenExitCount ?? exitCount + 1;
          setExitCount(nextCount);
          if (data?.forceSubmit || nextCount >= maxFullscreenExits) {
            handleSubmit(true, 'fullscreen_exits');
            return;
          }
          setNeedsFullscreenGesture(true);
        })
        .catch(() => {
          setNeedsFullscreenGesture(true);
        })
        .finally(() => {
          exitHandlingRef.current = false;
        });
    }

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      exitFullscreenSafe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  useEffect(() => {
    if (remaining === 0) handleSubmit(true, 'timer');
  }, [remaining, handleSubmit]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ selections, marked, visited, currentIndex })
      );
    } catch {
      /* ignore */
    }
  }, [selections, marked, visited, currentIndex, storageKey]);

  function toggleOption(optionIndex) {
    if (!question) return;
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

  function clearResponse() {
    if (!question) return;
    setSelections((prev) => ({ ...prev, [question.id]: [] }));
  }

  const totalSeconds = Math.max(
    1,
    Number(durationMinutes) > 0
      ? Math.round(Number(durationMinutes) * 60)
      : initialRemainingSeconds
  );
  const elapsedSeconds = Math.max(0, totalSeconds - remaining);
  const submitUnlockAt = Math.ceil(totalSeconds * 0.2);
  const canSubmit = elapsedSeconds >= submitUnlockAt;
  const secondsUntilSubmitUnlock = Math.max(0, submitUnlockAt - elapsedSeconds);

  const isLastQuestion = (() => {
    const position = sectionQuestions.findIndex(({ index }) => index === currentIndex);
    if (position >= 0 && position < sectionQuestions.length - 1) return false;
    const sectionPos = sections.indexOf(activeSection);
    return !(sectionPos >= 0 && sectionPos < sections.length - 1);
  })();

  function saveAndNext() {
    if (isLastQuestion) return;
    const position = sectionQuestions.findIndex(({ index }) => index === currentIndex);
    if (position >= 0 && position < sectionQuestions.length - 1) {
      goTo(sectionQuestions[position + 1].index);
      return;
    }
    const sectionPos = sections.indexOf(activeSection);
    if (sectionPos >= 0 && sectionPos < sections.length - 1) {
      switchSection(sections[sectionPos + 1]);
    }
  }

  function markForReviewAndNext() {
    if (!question) return;
    setMarked((prev) => ({ ...prev, [question.id]: true }));
    if (!isLastQuestion) saveAndNext();
  }

  function confirmSubmit() {
    if (!canSubmit) return;
    const unanswered = questions.filter((item) => !(selections[item.id] || []).length).length;
    if (unanswered > 0) {
      const message =
        `You have not answered ${unanswered} question${unanswered === 1 ? '' : 's'}. ` +
        'You cannot come back after submitting. Submit anyway?';
      if (!window.confirm(message)) return;
    }
    handleSubmit(false, 'manual');
  }

  const lowTime = remaining <= 60;
  const answeredCount = questions.filter((item) => (selections[item.id] || []).length > 0).length;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex flex-col bg-[#f4f6f8] text-slate-900"
    >
      {needsFullscreenGesture ? (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-ink-900/70 p-6">
          <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <Maximize2 className="mx-auto h-8 w-8 text-lagoon-700" />
            <h2 className="mt-3 font-display text-xl font-bold text-ink-900">
              Continue in fullscreen
            </h2>
            <p className="mt-2 text-sm text-ink-900/65">
              Leaving fullscreen counts as an exit. After {maxFullscreenExits} exits the test
              submits automatically.
              {exitsRemaining < maxFullscreenExits
                ? ` You have ${exitsRemaining} exit${exitsRemaining === 1 ? '' : 's'} left.`
                : null}
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-lagoon-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-lagoon-700"
              onClick={() => requestFullscreenSafe(rootRef.current)}
            >
              <Maximize2 className="h-4 w-4" />
              Enter fullscreen
            </button>
          </div>
        </div>
      ) : null}

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-[#1e3a5f] px-4 py-2.5 text-white">
        <div className="min-w-0">
          <p className="truncate font-semibold">{title}</p>
          {subject ? <p className="text-xs text-white/70">{subject}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span
            className={cn(
              'rounded-md px-3 py-1.5 font-mono font-bold tabular-nums',
              lowTime ? 'animate-pulse bg-red-500' : 'bg-white/15'
            )}
          >
            Time Left :- {formatClock(remaining)}
          </span>
          <span className="font-medium">{studentName || 'Student'}</span>
          <span className="rounded-md bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-ink-900">
            FS exits left: {exitsRemaining}/{maxFullscreenExits}
          </span>
        </div>
      </header>

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}{' '}
          <button type="button" className="font-semibold underline" onClick={onDismissError}>
            Dismiss
          </button>
        </div>
      ) : null}

      {lowTime && remaining > 0 ? (
        <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Less than a minute left. Answers submit automatically when the timer ends.
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          {sections.length > 1 ? (
            <div className="flex flex-wrap gap-1 border-b border-slate-300 bg-[#243b55] px-3 py-2">
              {sections.map((name) => {
                const isActive = name === activeSection;
                const count = questions.filter(
                  (item) => (item.section || sections[0]) === name
                ).length;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => switchSection(name)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition sm:text-sm',
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-500/80 text-white hover:bg-slate-400'
                    )}
                  >
                    {name}
                    <span className="ml-1.5 font-normal opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm">
            <span className="font-bold text-[#1e3a5f]">Qus. No {question?.number}</span>
            {activeSection ? (
              <>
                <span className="mx-2 text-slate-400">|</span>
                <span className="font-semibold text-slate-600">{activeSection}</span>
              </>
            ) : null}
            <span className="mx-2 text-slate-400">|</span>
            <span className="font-semibold">
              {question?.type === 'multiple' ? 'MCQ Multiple' : 'MCQ Single'}
            </span>
            <span className="mx-2 text-slate-400">|</span>
            <span>
              Marks : {question?.marks}
              {question?.type === 'multiple' ? ' (select all that apply)' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-ink-900">
              {question?.text}
            </p>

            <div className="mt-5 space-y-2.5">
              {(question?.options || []).map((option, displayIndex) => {
                const isSelected = selected.includes(option.index);
                return (
                  <label
                    key={option.index}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition',
                      isSelected
                        ? 'border-[#1e3a5f] bg-[#e8eef6]'
                        : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                    )}
                  >
                    <input
                      type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                      name={`question-${question.id}`}
                      checked={isSelected}
                      onChange={() => toggleOption(option.index)}
                      className="h-4 w-4 shrink-0 accent-[#1e3a5f]"
                    />
                    <span className="w-5 shrink-0 text-sm font-bold text-slate-500">
                      {optionLabel(displayIndex)}
                    </span>
                    <span className="text-sm leading-relaxed">{option.text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-300 bg-white px-4 py-3">
            <button
              type="button"
              onClick={markForReviewAndNext}
              className="rounded-md bg-amber-400 px-3 py-2 text-xs font-bold text-ink-900 hover:bg-amber-500 sm:text-sm"
            >
              Mark for Review & Next
            </button>
            <button
              type="button"
              onClick={clearResponse}
              className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 sm:text-sm"
            >
              Clear Response
            </button>
            <button
              type="button"
              onClick={saveAndNext}
              disabled={isLastQuestion}
              className="ml-auto rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              SAVE & NEXT
            </button>
          </div>
        </main>

        <aside
          className={cn(
            'flex shrink-0 flex-col border-l border-slate-300 bg-white transition-[width]',
            paletteOpen ? 'w-[17rem] sm:w-[19rem]' : 'w-10'
          )}
        >
          <button
            type="button"
            aria-label={paletteOpen ? 'Collapse palette' : 'Expand palette'}
            onClick={() => setPaletteOpen((prev) => !prev)}
            className="absolute right-[calc(theme(spacing.0))] hidden"
          />
          {paletteOpen ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Question palette
                </p>
                <button
                  type="button"
                  aria-label="Collapse palette"
                  onClick={() => setPaletteOpen(false)}
                  className="rounded px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  «
                </button>
              </div>
              <div className="border-b border-slate-200 px-3 py-3 text-xs">
                <p className="mb-2 font-bold uppercase tracking-wide text-slate-500">Legend</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-sm bg-emerald-500" /> Answered
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-sm bg-red-500" /> Not Answered
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-violet-500" /> Marked
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-sm bg-slate-300" /> Not Visited
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-violet-600 ring-2 ring-violet-300" />{' '}
                    Answered & Marked
                  </li>
                </ul>
                <p className="mt-3 text-slate-500">
                  {answeredCount}/{questions.length} answered
                </p>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-3">
                {sections.map((sectionName) => {
                  const items = questions
                    .map((item, index) => ({ item, index }))
                    .filter(({ item }) => (item.section || sections[0]) === sectionName);
                  if (items.length === 0) return null;
                  return (
                    <div key={sectionName}>
                      <p
                        className={cn(
                          'mb-2 text-xs font-semibold uppercase tracking-wide',
                          sectionName === activeSection ? 'text-[#1e3a5f]' : 'text-slate-500'
                        )}
                      >
                        {sectionName}
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {items.map(({ item, index }, localIndex) => {
                          const answered = (selections[item.id] || []).length > 0;
                          const isMarked = Boolean(marked[item.id]);
                          const wasVisited = Boolean(visited[item.id]);
                          const isCurrent = index === currentIndex;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => goTo(index)}
                              className={cn(
                                'flex h-9 w-9 items-center justify-center text-xs font-bold transition',
                                isMarked ? 'rounded-full' : 'rounded-sm',
                                paletteTone({
                                  answered,
                                  marked: isMarked,
                                  visited: wasVisited,
                                }),
                                isCurrent &&
                                  'outline outline-2 outline-offset-1 outline-[#1e3a5f]'
                              )}
                            >
                              {localIndex + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-200 p-3">
                <button
                  type="button"
                  disabled={submitting || !canSubmit}
                  onClick={confirmSubmit}
                  title={
                    canSubmit
                      ? 'Submit the test'
                      : `Submit unlocks after 20% of the time (${formatClock(secondsUntilSubmitUnlock)} left to unlock)`
                  }
                  className="w-full rounded-md bg-emerald-700 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'SUBMIT TEST'}
                </button>
                {!canSubmit ? (
                  <p className="mt-2 text-center text-[11px] leading-snug text-slate-500">
                    Submit unlocks after 20% of the timer
                    {secondsUntilSubmitUnlock > 0
                      ? ` (in ${formatClock(secondsUntilSubmitUnlock)})`
                      : ''}
                    .
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <button
              type="button"
              className="flex h-full items-center justify-center text-xs font-bold text-slate-500"
              onClick={() => setPaletteOpen(true)}
            >
              »
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
