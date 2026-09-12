import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStaffContent } from '../../context/StaffContentContext';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { toApiDateTime, toDateTimeLocalValue } from '../../utils/quizFormat';
import { confirmSavePublishedMessage } from '../../utils/wipeAttemptsConfirm';
import { selectedClassIdsFromItem } from '../../utils/contentClasses';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ClassMultiSelect } from '../../components/ui/ClassMultiSelect';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  QuestionBuilder,
  makeEmptyQuestion,
  toApiQuestions,
  toEditableQuestion,
} from '../../components/quiz/QuestionBuilder';

const emptyForm = {
  title: '',
  description: '',
  studentClasses: [],
  subject: '',
  assessmentDate: toDateTimeLocalValue(),
  endDate: toDateTimeLocalValue(undefined, { endOfDay: true }),
  durationMinutes: '60',
  negativeMarkPerWrong: '0',
  allowPartialCredit: 'true',
  showAnswersAfterSubmit: 'true',
  isPublished: 'false',
};

const DEFAULT_SECTIONS = ['Section A'];

export function AdminAssessmentFormPage() {
  const { basePath, api } = useStaffContent();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [questions, setQuestions] = useState([makeEmptyQuestion({ section: DEFAULT_SECTIONS[0] })]);
  const [classes, setClasses] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasAttempts, setHasAttempts] = useState(false);
  const [initiallyPublished, setInitiallyPublished] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');

    async function load() {
      try {
        const classesRes = await authApi.classes();
        if (!active) return;
        const list = classesRes.data.data.classes || [];
        setClasses(list);

        if (isEdit) {
          const [{ data }, resultsRes] = await Promise.all([
            api.assessment(id),
            api.assessmentResults(id).catch(() => null),
          ]);
          if (!active) return;

          const item = data.data.assessment;
          const attempts =
            item.attemptCount ?? resultsRes?.data?.data?.summary?.submitted ?? 0;
          const nextSections =
            Array.isArray(item.sections) && item.sections.length > 0
              ? item.sections
              : DEFAULT_SECTIONS;
          setForm({
            title: item.title,
            description: item.description || '',
            studentClasses: selectedClassIdsFromItem(item),
            subject: item.subject || '',
            assessmentDate: toDateTimeLocalValue(item.assessmentDate),
            endDate: toDateTimeLocalValue(item.endDate || item.assessmentDate, {
              endOfDay: !item.endDate,
            }),
            durationMinutes: String(item.durationMinutes ?? '60'),
            negativeMarkPerWrong: String(item.negativeMarkPerWrong ?? '0'),
            allowPartialCredit: item.allowPartialCredit ? 'true' : 'false',
            showAnswersAfterSubmit: item.showAnswersAfterSubmit ? 'true' : 'false',
            isPublished: item.isPublished ? 'true' : 'false',
          });
          setSections(nextSections);
          setQuestions(
            (item.questions || []).map((question) => ({
              ...toEditableQuestion(question),
              section: question.section || nextSections[0],
            }))
          );
          setInitiallyPublished(Boolean(item.isPublished));
          setAttemptCount(Number(attempts) || 0);
          setHasAttempts(Boolean(attempts));
        } else {
          setForm((prev) => ({
            ...prev,
            studentClasses: list[0]?.id ? [list[0].id] : [],
          }));
        }
        setLoading(false);
      } catch (err) {
        if (!active) return;
        setLoadError(getErrorMessage(err, 'Could not load form.'));
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function updateSectionName(index, value) {
    const previous = sections[index];
    const next = sections.map((name, i) => (i === index ? value : name));
    setSections(next);
    if (previous && previous !== value) {
      setQuestions((prev) =>
        prev.map((question) =>
          question.section === previous ? { ...question, section: value } : question
        )
      );
    }
  }

  function addSection() {
    const label = `Section ${String.fromCharCode(65 + Math.min(sections.length, 25))}`;
    let name = label;
    let n = 2;
    while (sections.some((item) => item.toLowerCase() === name.toLowerCase())) {
      name = `${label} ${n}`;
      n += 1;
    }
    setSections((prev) => [...prev, name]);
  }

  function removeSection(index) {
    if (sections.length <= 1) return;
    const removed = sections[index];
    const next = sections.filter((_, i) => i !== index);
    setSections(next);
    setQuestions((prev) =>
      prev.map((question) =>
        question.section === removed ? { ...question, section: next[0] } : question
      )
    );
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.studentClasses.length) next.studentClasses = 'Select at least one class.';
    if (!form.assessmentDate) next.assessmentDate = 'Starting date and time is required.';
    if (!form.endDate) next.endDate = 'Ending date and time is required.';
    if (form.assessmentDate && form.endDate && form.endDate < form.assessmentDate) {
      next.endDate = 'Ending date and time cannot be before the starting date and time.';
    }

    const duration = Number(form.durationMinutes);
    if (!Number.isFinite(duration) || duration < 1 || duration > 300) {
      next.durationMinutes = 'Enter a duration between 1 and 300 minutes.';
    }

    const negative = Number(form.negativeMarkPerWrong);
    if (!Number.isFinite(negative) || negative < 0 || negative > 10) {
      next.negativeMarkPerWrong = 'Enter a value between 0 and 10.';
    }

    const cleanedSections = sections.map((name) => name.trim()).filter(Boolean);
    if (cleanedSections.length === 0) {
      next.sections = 'Add at least one section.';
    } else {
      const lower = cleanedSections.map((name) => name.toLowerCase());
      if (new Set(lower).size !== lower.length) {
        next.sections = 'Section names must be unique.';
      }
    }

    setFieldErrors(next);

    if (questions.length === 0) {
      setError('Add at least one question before saving.');
      return false;
    }

    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    const cleanedSections = sections.map((name) => name.trim()).filter(Boolean);
    const fallback = cleanedSections[0];
    const payloadQuestions = toApiQuestions(questions).map((question, index) => ({
      ...question,
      section: questions[index].section?.trim() || fallback,
    }));

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      studentClasses: form.studentClasses,
      subject: form.subject.trim(),
      assessmentDate: toApiDateTime(form.assessmentDate),
      endDate: toApiDateTime(form.endDate),
      durationMinutes: Number(form.durationMinutes),
      negativeMarkPerWrong: Number(form.negativeMarkPerWrong),
      allowPartialCredit: form.allowPartialCredit === 'true',
      showAnswersAfterSubmit: form.showAnswersAfterSubmit === 'true',
      isPublished: form.isPublished === 'true',
      sections: cleanedSections.map((name) => ({ name })),
      questions: payloadQuestions,
    };

    if (isEdit && (initiallyPublished || hasAttempts)) {
      if (!window.confirm(confirmSavePublishedMessage(attemptCount))) return;
      payload.confirmWipeAttempts = true;
    }

    setSaving(true);
    try {
      if (isEdit) await api.updateAssessment(id, payload);
      else await api.createAssessment(payload);
      navigate(`${basePath}/assessments`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this assessment.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell embedded title={isEdit ? 'Edit online assessment' : 'New online assessment'}>
        <LoadingState label="Loading…" />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell embedded title={isEdit ? 'Edit online assessment' : 'New online assessment'}>
        <ErrorState description={loadError} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Online Assessments"
      title={isEdit ? 'Edit online assessment' : 'New online assessment'}
      description="Create sections (e.g. Section A / Section B), then add single and multi-select questions to each."
      actions={
        <Link to={`${basePath}/assessments`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      {error ? (
        <Alert type="error" title="Save failed" onClose={() => setError('')} className="mb-4">
          {error}
        </Alert>
      ) : null}

      {initiallyPublished || hasAttempts ? (
        <Alert type="warning" title="Saving will clear attempt data" className="mb-4">
          Saving deletes all attempt data so corrected answers apply for everyone.
        </Alert>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <Card className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={updateField}
            required
            error={fieldErrors.title}
            hint="Example: Mid-term Assessment — Physics"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ClassMultiSelect
              classes={classes}
              value={form.studentClasses}
              onChange={(studentClasses) => {
                setForm((prev) => ({ ...prev, studentClasses }));
                setFieldErrors((prev) => ({ ...prev, studentClasses: '' }));
              }}
              error={fieldErrors.studentClasses}
            />
            <Input
              label="Subject"
              name="subject"
              value={form.subject}
              onChange={updateField}
              hint="Optional, e.g. Physics"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Starting date and time"
              name="assessmentDate"
              type="datetime-local"
              value={form.assessmentDate}
              onChange={updateField}
              required
              error={fieldErrors.assessmentDate}
            />
            <Input
              label="Ending date and time"
              name="endDate"
              type="datetime-local"
              value={form.endDate}
              onChange={updateField}
              required
              error={fieldErrors.endDate}
              hint="After this date and time students can no longer start the assessment"
            />
          </div>

          <Input
            label="Duration (minutes)"
            name="durationMinutes"
            type="number"
            min="1"
            max="300"
            value={form.durationMinutes}
            onChange={updateField}
            required
            error={fieldErrors.durationMinutes}
            hint="Auto-submits when time runs out. Leaving fullscreen 3 times also auto-submits."
          />

          <Textarea
            label="Instructions"
            name="description"
            value={form.description}
            onChange={updateField}
            rows={3}
            hint="Optional notes shown to students before they start"
          />
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-ink-900">Sections</h3>
              <p className="text-sm text-ink-900/55">
                Students switch sections with tabs during the test (like Section A / Section B).
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4" />
              Add section
            </Button>
          </div>

          {fieldErrors.sections ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.sections}</p>
          ) : null}

          <div className="space-y-2">
            {sections.map((name, index) => (
              <div key={`section-${index}`} className="flex items-center gap-2">
                <Input
                  label={index === 0 ? 'Section name' : undefined}
                  value={name}
                  onChange={(event) => updateSectionName(index, event.target.value)}
                  placeholder={`Section ${String.fromCharCode(65 + index)}`}
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className={index === 0 ? 'mt-6' : ''}
                  disabled={sections.length <= 1}
                  onClick={() => removeSection(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-display text-lg font-bold text-ink-900">Scoring rules</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Negative marks per wrong answer"
              name="negativeMarkPerWrong"
              type="number"
              min="0"
              max="10"
              step="0.25"
              value={form.negativeMarkPerWrong}
              onChange={updateField}
              error={fieldErrors.negativeMarkPerWrong}
              hint="0 means no negative marking. Skipped questions are never penalised."
            />
            <Select
              label="Partial credit on multi-select"
              name="allowPartialCredit"
              value={form.allowPartialCredit}
              onChange={updateField}
              hint="Partial marks only when every picked option is correct"
            >
              <option value="true">Give partial marks</option>
              <option value="false">All or nothing</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Answer key"
              name="showAnswersAfterSubmit"
              value={form.showAnswersAfterSubmit}
              onChange={updateField}
            >
              <option value="true">Show answers after submitting</option>
              <option value="false">Hide answers</option>
            </Select>
            <Select
              label="Status"
              name="isPublished"
              value={form.isPublished}
              onChange={updateField}
              hint="Students only see published assessments"
            >
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </Select>
          </div>
        </Card>

        <Card>
          <QuestionBuilder
            questions={questions}
            onChange={setQuestions}
            allowedTypes={['single', 'multiple', 'matrix']}
            sections={sections}
          />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create online assessment'}
          </Button>
          <Link to={`${basePath}/assessments`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
