import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { optionLabel } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const MIN_BLANK_ANSWERS = 1;
export const MAX_BLANK_ANSWERS = 6;

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `q-${Date.now()}-${keyCounter}`;
}

function typeLabel(type) {
  if (type === 'multiple') return 'Multi-select';
  if (type === 'blank') return 'Fill in the blanks';
  return 'Single choice';
}

function typeTone(type) {
  if (type === 'multiple') return 'ember';
  if (type === 'blank') return 'ink';
  return 'lagoon';
}

export function makeEmptyQuestion(defaults = {}) {
  return {
    key: nextKey(),
    text: '',
    type: 'single',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correctOptions: [],
    correctAnswers: [''],
    marks: '1',
    explanation: '',
    section: defaults.section || '',
  };
}

/** Turns a saved question from the API into editable form state. */
export function toEditableQuestion(question) {
  const type = question.type || 'single';
  return {
    key: nextKey(),
    text: question.text || '',
    type,
    options:
      type === 'blank'
        ? [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
        : (question.options || []).map((option) => ({ text: option.text || '' })),
    correctOptions: [...(question.correctOptions || [])],
    correctAnswers:
      type === 'blank'
        ? (question.correctAnswers || []).length > 0
          ? question.correctAnswers.map((answer) => answer || '')
          : ['']
        : [''],
    marks: String(question.marks ?? '1'),
    explanation: question.explanation || '',
    section: question.section || '',
  };
}

/** Strips the local `key` and converts marks back to a number for the API. */
export function toApiQuestions(questions) {
  return questions.map((question) => {
    if (question.type === 'blank') {
      return {
        text: question.text,
        type: 'blank',
        options: [],
        correctOptions: [],
        correctAnswers: question.correctAnswers,
        marks: Number(question.marks),
        explanation: question.explanation,
        section: question.section || undefined,
      };
    }

    return {
      text: question.text,
      type: question.type,
      options: question.options.map((option) => ({ text: option.text })),
      correctOptions: question.correctOptions,
      correctAnswers: [],
      marks: Number(question.marks),
      explanation: question.explanation,
      section: question.section || undefined,
    };
  });
}

function QuestionCard({ question, index, total, onChange, onRemove, onMove, allowedTypes, sections }) {
  function update(patch) {
    onChange({ ...question, ...patch });
  }

  function changeType(nextType) {
    if (nextType === 'blank') {
      update({
        type: 'blank',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correctOptions: [],
        correctAnswers: question.correctAnswers?.length ? question.correctAnswers : [''],
      });
      return;
    }

    const correctOptions =
      nextType === 'single' ? question.correctOptions.slice(0, 1) : question.correctOptions;
    update({
      type: nextType,
      correctOptions,
      options:
        question.options?.length >= MIN_OPTIONS
          ? question.options
          : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    });
  }

  function toggleCorrect(optionIndex) {
    if (question.type === 'single') {
      update({ correctOptions: [optionIndex] });
      return;
    }
    const has = question.correctOptions.includes(optionIndex);
    update({
      correctOptions: has
        ? question.correctOptions.filter((value) => value !== optionIndex)
        : [...question.correctOptions, optionIndex].sort((a, b) => a - b),
    });
  }

  function changeOptionText(optionIndex, text) {
    update({
      options: question.options.map((option, i) => (i === optionIndex ? { text } : option)),
    });
  }

  function addOption() {
    if (question.options.length >= MAX_OPTIONS) return;
    update({ options: [...question.options, { text: '' }] });
  }

  function removeOption(optionIndex) {
    if (question.options.length <= MIN_OPTIONS) return;
    update({
      options: question.options.filter((_, i) => i !== optionIndex),
      // Correct answers are stored as indexes, so everything after the gap shifts down.
      correctOptions: question.correctOptions
        .filter((value) => value !== optionIndex)
        .map((value) => (value > optionIndex ? value - 1 : value)),
    });
  }

  function changeAcceptedAnswer(answerIndex, text) {
    update({
      correctAnswers: question.correctAnswers.map((answer, i) =>
        i === answerIndex ? text : answer
      ),
    });
  }

  function addAcceptedAnswer() {
    if (question.correctAnswers.length >= MAX_BLANK_ANSWERS) return;
    update({ correctAnswers: [...question.correctAnswers, ''] });
  }

  function removeAcceptedAnswer(answerIndex) {
    if (question.correctAnswers.length <= MIN_BLANK_ANSWERS) return;
    update({
      correctAnswers: question.correctAnswers.filter((_, i) => i !== answerIndex),
    });
  }

  const marksValue = Number(question.marks);
  const isBlank = question.type === 'blank';
  const noCorrectPicked = isBlank
    ? !question.correctAnswers.some((answer) => answer.trim())
    : question.correctOptions.length === 0;

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="ink">Q{index + 1}</Badge>
          <Badge tone={typeTone(question.type)}>{typeLabel(question.type)}</Badge>
          {Number.isFinite(marksValue) && marksValue > 0 ? (
            <span className="text-xs text-ink-900/50">
              {marksValue} mark{marksValue === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Move question up"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="rounded-lg p-1.5 text-ink-900/50 transition hover:bg-ink-900/5 hover:text-ink-800 disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move question down"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="rounded-lg p-1.5 text-ink-900/50 transition hover:bg-ink-900/5 hover:text-ink-800 disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Remove question"
            onClick={() => onRemove(index)}
            className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Textarea
        label="Question"
        rows={2}
        required
        value={question.text}
        onChange={(event) => update({ text: event.target.value })}
        placeholder={
          isBlank
            ? 'e.g. The chemical symbol for water is ____'
            : 'Type the question here'
        }
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Select
          label="Answer type"
          value={question.type}
          onChange={(event) => changeType(event.target.value)}
        >
          {(!allowedTypes || allowedTypes.includes('single')) ? (
            <option value="single">Single choice (one answer)</option>
          ) : null}
          {(!allowedTypes || allowedTypes.includes('multiple')) ? (
            <option value="multiple">Multi-select (more than one)</option>
          ) : null}
          {(!allowedTypes || allowedTypes.includes('blank')) ? (
            <option value="blank">Fill in the Blanks</option>
          ) : null}
        </Select>
        <Input
          label="Marks"
          type="number"
          min="0.25"
          step="0.25"
          value={question.marks}
          onChange={(event) => update({ marks: event.target.value })}
        />
      </div>

      {Array.isArray(sections) && sections.length > 0 ? (
        <div className="mt-3">
          <Select
            label="Section"
            value={question.section || sections[0]}
            onChange={(event) => update({ section: event.target.value })}
          >
            {sections.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {isBlank ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-800">
              Accepted answers
              <span className="ml-2 font-normal text-ink-900/50">
                Matching is case-insensitive
              </span>
            </span>
            {question.correctAnswers.length < MAX_BLANK_ANSWERS ? (
              <Button type="button" variant="ghost" size="sm" onClick={addAcceptedAnswer}>
                <Plus className="h-4 w-4" />
                Add alternate
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            {question.correctAnswers.map((answer, answerIndex) => (
              <div
                key={answerIndex}
                className="flex items-center gap-2 rounded-xl border border-lagoon-400 bg-lagoon-50 px-3 py-2"
              >
                <span className="w-5 shrink-0 text-sm font-bold text-ink-900/45">
                  {answerIndex + 1}
                </span>
                <input
                  type="text"
                  value={answer}
                  onChange={(event) => changeAcceptedAnswer(answerIndex, event.target.value)}
                  placeholder={
                    answerIndex === 0 ? 'Correct answer' : `Alternate ${answerIndex + 1}`
                  }
                  className="h-9 w-full rounded-lg border border-ink-900/10 bg-white px-3 text-sm text-ink-900 transition placeholder:text-ink-900/35 focus:border-lagoon-500"
                />
                {question.correctAnswers.length > MIN_BLANK_ANSWERS ? (
                  <button
                    type="button"
                    aria-label={`Remove accepted answer ${answerIndex + 1}`}
                    onClick={() => removeAcceptedAnswer(answerIndex)}
                    className="shrink-0 rounded-lg p-1.5 text-ink-900/40 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {noCorrectPicked ? (
            <p className="mt-2 text-xs font-medium text-ember-700">
              Add at least one accepted answer.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-800">
              Options
              <span className="ml-2 font-normal text-ink-900/50">
                {question.type === 'multiple'
                  ? 'Tick every correct option'
                  : 'Select the one correct option'}
              </span>
            </span>
            {question.options.length < MAX_OPTIONS ? (
              <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4" />
                Add option
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const isCorrect = question.correctOptions.includes(optionIndex);
              return (
                <div
                  key={optionIndex}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 transition',
                    isCorrect ? 'border-lagoon-400 bg-lagoon-50' : 'border-ink-900/10 bg-white'
                  )}
                >
                  <input
                    type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                    name={`correct-${question.key}`}
                    checked={isCorrect}
                    onChange={() => toggleCorrect(optionIndex)}
                    aria-label={`Mark option ${optionLabel(optionIndex)} correct`}
                    className="h-4 w-4 shrink-0 accent-lagoon-600"
                  />
                  <span className="w-5 shrink-0 text-sm font-bold text-ink-900/45">
                    {optionLabel(optionIndex)}
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(event) => changeOptionText(optionIndex, event.target.value)}
                    placeholder={`Option ${optionLabel(optionIndex)}`}
                    className="h-9 w-full rounded-lg border border-ink-900/10 bg-white px-3 text-sm text-ink-900 transition placeholder:text-ink-900/35 focus:border-lagoon-500"
                  />
                  {question.options.length > MIN_OPTIONS ? (
                    <button
                      type="button"
                      aria-label={`Remove option ${optionLabel(optionIndex)}`}
                      onClick={() => removeOption(optionIndex)}
                      className="shrink-0 rounded-lg p-1.5 text-ink-900/40 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {noCorrectPicked ? (
            <p className="mt-2 text-xs font-medium text-ember-700">
              Mark at least one option as correct.
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-3">
        <Textarea
          label="Explanation"
          rows={2}
          value={question.explanation}
          onChange={(event) => update({ explanation: event.target.value })}
          hint="Optional. Shown to students on the result card."
        />
      </div>
    </div>
  );
}

export function QuestionBuilder({ questions, onChange, allowedTypes, sections }) {
  const defaultSection = Array.isArray(sections) && sections.length > 0 ? sections[0] : '';

  function updateAt(index, question) {
    onChange(questions.map((item, i) => (i === index ? question : item)));
  }

  function removeAt(index) {
    onChange(questions.filter((_, i) => i !== index));
  }

  function moveBy(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addQuestion() {
    onChange([...questions, makeEmptyQuestion({ section: defaultSection })]);
  }

  const totalMarks = questions.reduce((sum, question) => {
    const marks = Number(question.marks);
    return sum + (Number.isFinite(marks) ? marks : 0);
  }, 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-ink-900">Questions</h3>
          <p className="text-sm text-ink-900/55">
            {questions.length} question{questions.length === 1 ? '' : 's'} · {totalMarks} total marks
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white/60 px-6 py-10 text-center">
          <p className="text-sm text-ink-900/60">
            No questions yet. Add your first question to build this test.
          </p>
          <Button type="button" size="sm" className="mt-4" onClick={addQuestion}>
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.key}
              question={question}
              index={index}
              total={questions.length}
              onChange={(next) => updateAt(index, next)}
              onRemove={removeAt}
              onMove={moveBy}
              allowedTypes={allowedTypes}
              sections={sections}
            />
          ))}
        </div>
      )}

      {questions.length > 0 ? (
        <Button type="button" variant="secondary" className="mt-4" onClick={addQuestion}>
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      ) : null}
    </div>
  );
}
