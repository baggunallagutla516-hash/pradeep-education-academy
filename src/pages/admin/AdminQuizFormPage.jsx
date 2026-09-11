import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { toDateInputValue } from '../../utils/quizFormat';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
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
  subject: '',
  endDate: toDateInputValue(),
  durationMinutes: '15',
  negativeMarkPerWrong: '0',
  allowPartialCredit: 'true',
  showAnswersAfterSubmit: 'true',
  isPublished: 'false',
};

export function AdminQuizFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [questions, setQuestions] = useState([makeEmptyQuestion()]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasAttempts, setHasAttempts] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');

    async function load() {
      try {
        if (isEdit) {
          const [{ data }, resultsRes] = await Promise.all([
            adminApi.quiz(id),
            adminApi.quizResults(id).catch(() => null),
          ]);
          if (!active) return;

          const item = data.data.quiz;
          if (item.isPublished) {
            navigate('/admin/quizzes', { replace: true });
            return;
          }
          setForm({
            title: item.title,
            description: item.description || '',
            subject: item.subject || '',
            endDate: toDateInputValue(item.endDate),
            durationMinutes: String(item.durationMinutes ?? '15'),
            negativeMarkPerWrong: String(item.negativeMarkPerWrong ?? '0'),
            allowPartialCredit: item.allowPartialCredit ? 'true' : 'false',
            showAnswersAfterSubmit: item.showAnswersAfterSubmit ? 'true' : 'false',
            isPublished: item.isPublished ? 'true' : 'false',
          });
          setQuestions((item.questions || []).map(toEditableQuestion));
          setHasAttempts(Boolean(resultsRes?.data?.data?.summary?.submitted));
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
  }, [id, isEdit, navigate]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.endDate) next.endDate = 'End date is required.';

    const duration = Number(form.durationMinutes);
    if (!Number.isFinite(duration) || duration < 1 || duration > 300) {
      next.durationMinutes = 'Enter a duration between 1 and 300 minutes.';
    }

    const negative = Number(form.negativeMarkPerWrong);
    if (!Number.isFinite(negative) || negative < 0 || negative > 10) {
      next.negativeMarkPerWrong = 'Enter a value between 0 and 10.';
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

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      endDate: form.endDate,
      durationMinutes: Number(form.durationMinutes),
      negativeMarkPerWrong: Number(form.negativeMarkPerWrong),
      allowPartialCredit: form.allowPartialCredit === 'true',
      showAnswersAfterSubmit: form.showAnswersAfterSubmit === 'true',
      isPublished: form.isPublished === 'true',
      questions: toApiQuestions(questions),
    };

    setSaving(true);
    try {
      if (isEdit) await adminApi.updateQuiz(id, payload);
      else await adminApi.createQuiz(payload);
      navigate('/admin/quizzes');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this quiz.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell embedded title={isEdit ? 'Edit quiz' : 'New quiz'}>
        <LoadingState label="Loading…" />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell embedded title={isEdit ? 'Edit quiz' : 'New quiz'}>
        <ErrorState description={loadError} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="QUIZ"
      title={isEdit ? 'Edit quiz' : 'New quiz'}
      description="Available to every login: students, educators, and parents. Use single-select and multi-select questions only."
      actions={
        <Link to="/admin/quizzes">
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

      {hasAttempts ? (
        <Alert type="warning" title="Students have already attempted this" className="mb-4">
          Editing questions or marks now will not re-grade results that are already submitted.
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
            hint="Example: Weekly General Quiz"
          />

          <Input
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={updateField}
            hint="Optional, e.g. General knowledge"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="End date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={updateField}
              required
              error={fieldErrors.endDate}
              hint="After this date students can no longer start the quiz"
            />
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
              hint="The quiz submits automatically when time runs out"
            />
          </div>

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
              hint="Every login sees published quizzes"
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
            allowedTypes={['single', 'multiple']}
          />
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create quiz'}
          </Button>
          <Link to="/admin/quizzes">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
