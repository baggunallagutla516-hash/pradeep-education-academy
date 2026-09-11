import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { optionLabel } from '../../utils/quizFormat';
import { cn } from '../../utils/cn';
import { MathPreview } from './MathText';
import { QuestionPreviewButton, QuestionStudentPreview } from './QuestionStudentPreview';

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const MIN_BLANK_ANSWERS = 1;
export const MAX_BLANK_ANSWERS = 6;
export const MIN_MATRIX_ROWS = 2;
export const MAX_MATRIX_ROWS = 8;

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `q-${Date.now()}-${keyCounter}`;
}

function typeLabel(type) {
  if (type === 'multiple') return 'Multi-select';
  if (type === 'blank') return 'Fill in the blanks';
  if (type === 'matrix') return 'Matrix';
  return 'Single choice';
}

function typeTone(type) {
  if (type === 'multiple') return 'ember';
  if (type === 'blank') return 'ink';
  if (type === 'matrix') return 'ember';
  return 'lagoon';
}

export function makeEmptyQuestion(defaults = {}) {
  return {
    key: nextKey(),
    text: '',
    type: 'single',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    rows: [{ text: '' }, { text: '' }],
    correctOptions: [],
    correctAnswers: [''],
    correctMatrix: [-1, -1],
    marks: '1',
    explanation: '',
    section: defaults.section || '',
  };
}

/** Turns a saved question from the API into editable form state. */
export function toEditableQuestion(question) {
  const type = question.type || 'single';
  const rows =
    type === 'matrix'
      ? (question.rows || []).length >= MIN_MATRIX_ROWS
        ? question.rows.map((row) => ({ text: row.text || '' }))
        : [{ text: '' }, { text: '' }]
      : [{ text: '' }, { text: '' }];
  const correctMatrix =
    type === 'matrix'
      ? rows.map((_, index) => {
          const value = Number(question.correctMatrix?.[index]);
          return Number.isInteger(value) ? value : -1;
        })
      : [-1, -1];

  return {
    key: nextKey(),
    text: question.text || '',
    type,
    options:
      type === 'blank'
        ? [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
        : (question.options || []).map((option) => ({ text: option.text || '' })),
    rows,
    correctOptions: [...(question.correctOptions || [])],
    correctAnswers:
      type === 'blank'
        ? (question.correctAnswers || []).length > 0
          ? question.correctAnswers.map((answer) => answer || '')
          : ['']
        : [''],
    correctMatrix,
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
        rows: [],
        correctOptions: [],
        correctAnswers: question.correctAnswers,
        correctMatrix: [],
        marks: Number(question.marks),
        explanation: question.explanation,
        section: question.section || undefined,
      };
    }

    if (question.type === 'matrix') {
      return {
        text: question.text,
        type: 'matrix',
        options: question.options.map((option) => ({ text: option.text })),
        rows: question.rows.map((row) => ({ text: row.text })),
        correctOptions: [],
        correctAnswers: [],
        correctMatrix: question.correctMatrix,
        marks: Number(question.marks),
        explanation: question.explanation,
        section: question.section || undefined,
      };
    }

    return {
      text: question.text,
      type: question.type,
      options: question.options.map((option) => ({ text: option.text })),
      rows: [],
      correctOptions: question.correctOptions,
      correctAnswers: [],
      correctMatrix: [],
      marks: Number(question.marks),
      explanation: question.explanation,
      section: question.section || undefined,
    };
  });
}

function QuestionCard({ question, index, total, onChange, onRemove, onMove, allowedTypes, sections }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  function update(patch) {
    onChange({ ...question, ...patch });
  }

  function changeType(nextType) {
    if (nextType === 'blank') {
      update({
        type: 'blank',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        rows: [{ text: '' }, { text: '' }],
        correctOptions: [],
        correctAnswers: question.correctAnswers?.length ? question.correctAnswers : [''],
        correctMatrix: [-1, -1],
      });
      return;
    }

    if (nextType === 'matrix') {
      const rows =
        question.rows?.length >= MIN_MATRIX_ROWS ? question.rows : [{ text: '' }, { text: '' }];
      update({
        type: 'matrix',
        options:
          question.options?.length >= MIN_OPTIONS
            ? question.options
            : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        rows,
        correctOptions: [],
        correctAnswers: [''],
        correctMatrix: rows.map((_, index) => {
          const value = Number(question.correctMatrix?.[index]);
          return Number.isInteger(value) && value >= 0 ? value : -1;
        }),
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
      rows: [{ text: '' }, { text: '' }],
      correctMatrix: [-1, -1],
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
      correctMatrix: (question.correctMatrix || []).map((value) => {
        if (value === optionIndex) return -1;
        if (value > optionIndex) return value - 1;
        return value;
      }),
    });
  }

  function changeRowText(rowIndex, text) {
    update({
      rows: question.rows.map((row, i) => (i === rowIndex ? { text } : row)),
    });
  }

  function addRow() {
    if (question.rows.length >= MAX_MATRIX_ROWS) return;
    update({
      rows: [...question.rows, { text: '' }],
      correctMatrix: [...question.correctMatrix, -1],
    });
  }

  function removeRow(rowIndex) {
    if (question.rows.length <= MIN_MATRIX_ROWS) return;
    update({
      rows: question.rows.filter((_, i) => i !== rowIndex),
      correctMatrix: question.correctMatrix.filter((_, i) => i !== rowIndex),
    });
  }

  function setRowCorrect(rowIndex, columnIndex) {
    update({
      correctMatrix: question.correctMatrix.map((value, i) =>
        i === rowIndex ? columnIndex : value
      ),
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
  const isMatrix = question.type === 'matrix';
  const noCorrectPicked = isBlank
    ? !question.correctAnswers.some((answer) => answer.trim())
    : isMatrix
      ? !(question.correctMatrix || []).every(
          (value) => Number.isInteger(value) && value >= 0 && value < question.options.length
        )
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
          <QuestionPreviewButton onClick={() => setPreviewOpen(true)} />
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

      <QuestionStudentPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        question={question}
        number={index + 1}
      />

      <Textarea
        label="Question"
        rows={2}
        required
        value={question.text}
        onChange={(event) => update({ text: event.target.value })}
        placeholder={
          isBlank
            ? 'e.g. The chemical symbol for water is ____'
            : isMatrix
              ? 'e.g. Find A^{-1} for the matrix below'
              : 'Type the question here'
        }
        hint="For formulas use LaTeX, e.g. A^{-1}=\\frac{1}{|A|}\\begin{bmatrix}d & -b \\\\ -c & a\\end{bmatrix}"
      />
      <MathPreview text={question.text} label="Question preview" />

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
          {(!allowedTypes || allowedTypes.includes('matrix')) ? (
            <option value="matrix">Matrix (one answer per row)</option>
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
      ) : isMatrix ? (
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-800">
                Columns
                <span className="ml-2 font-normal text-ink-900/50">
                  Shared choices across every row
                </span>
              </span>
              {question.options.length < MAX_OPTIONS ? (
                <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4" />
                  Add column
                </Button>
              ) : null}
            </div>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="space-y-1">
                  <div className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-3 py-2">
                    <span className="w-5 shrink-0 text-sm font-bold text-ink-900/45">
                      {optionLabel(optionIndex)}
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(event) => changeOptionText(optionIndex, event.target.value)}
                      placeholder={`Column ${optionLabel(optionIndex)}`}
                      className="h-9 w-full rounded-lg border border-ink-900/10 bg-white px-3 text-sm text-ink-900 transition placeholder:text-ink-900/35 focus:border-lagoon-500"
                    />
                    {question.options.length > MIN_OPTIONS ? (
                      <button
                        type="button"
                        aria-label={`Remove column ${optionLabel(optionIndex)}`}
                        onClick={() => removeOption(optionIndex)}
                        className="shrink-0 rounded-lg p-1.5 text-ink-900/40 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <MathPreview text={option.text} label={`Column ${optionLabel(optionIndex)} preview`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-800">
                Rows
                <span className="ml-2 font-normal text-ink-900/50">
                  Pick the correct column for each row
                </span>
              </span>
              {question.rows.length < MAX_MATRIX_ROWS ? (
                <Button type="button" variant="ghost" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4" />
                  Add row
                </Button>
              ) : null}
            </div>
            <div className="space-y-3">
              {question.rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="rounded-xl border border-ink-900/10 bg-sand-50/70 p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="w-8 shrink-0 text-xs font-bold uppercase text-ink-900/45">
                      R{rowIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={row.text}
                      onChange={(event) => changeRowText(rowIndex, event.target.value)}
                      placeholder={`Row ${rowIndex + 1} statement`}
                      className="h-9 w-full rounded-lg border border-ink-900/10 bg-white px-3 text-sm text-ink-900 transition placeholder:text-ink-900/35 focus:border-lagoon-500"
                    />
                    {question.rows.length > MIN_MATRIX_ROWS ? (
                      <button
                        type="button"
                        aria-label={`Remove row ${rowIndex + 1}`}
                        onClick={() => removeRow(rowIndex)}
                        className="shrink-0 rounded-lg p-1.5 text-ink-900/40 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <MathPreview text={row.text} label={`Row ${rowIndex + 1} preview`} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {question.options.map((option, columnIndex) => {
                      const selected = question.correctMatrix?.[rowIndex] === columnIndex;
                      return (
                        <label
                          key={columnIndex}
                          className={cn(
                            'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                            selected
                              ? 'border-lagoon-400 bg-lagoon-50 text-lagoon-800'
                              : 'border-ink-900/10 bg-white text-ink-900/70'
                          )}
                        >
                          <input
                            type="radio"
                            name={`matrix-correct-${question.key}-${rowIndex}`}
                            checked={selected}
                            onChange={() => setRowCorrect(rowIndex, columnIndex)}
                            className="h-3.5 w-3.5 accent-lagoon-600"
                          />
                          {option.text.trim() || optionLabel(columnIndex)}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {noCorrectPicked ? (
              <p className="mt-2 text-xs font-medium text-ember-700">
                Mark the correct column for every row.
              </p>
            ) : null}
          </div>
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
                <div key={optionIndex} className="space-y-1">
                  <div
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
                  <MathPreview text={option.text} label={`Option ${optionLabel(optionIndex)} preview`} />
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
          hint="Optional. Shown to students on the result card. LaTeX formulas are supported."
        />
        <MathPreview text={question.explanation} label="Explanation preview" />
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
