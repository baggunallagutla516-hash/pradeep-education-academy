import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStaffContent } from '../../context/StaffContentContext';
import { authApi } from '../../api/authApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { toApiDateTime, toDateTimeLocalValue } from '../../utils/quizFormat';
import { confirmSavePublishedMessage } from '../../utils/wipeAttemptsConfirm';
import {
  appendStudentClasses,
  selectedClassIdsFromItem,
} from '../../utils/contentClasses';
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
  contentMode: 'exam',
  title: '',
  description: '',
  studentClasses: [],
  subject: '',
  chapter: '',
  topic: '',
  startDate: toDateTimeLocalValue(),
  endDate: toDateTimeLocalValue(undefined, { endOfDay: true }),
  durationMinutes: '15',
  negativeMarkPerWrong: '0',
  allowPartialCredit: 'true',
  showAnswersAfterSubmit: 'true',
  isPublished: 'false',
};

export function AdminSlipTestFormPage() {
  const { basePath, api } = useStaffContent();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [questions, setQuestions] = useState([makeEmptyQuestion()]);
  const [classes, setClasses] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [existingFileName, setExistingFileName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasAttempts, setHasAttempts] = useState(false);
  const [initiallyPublished, setInitiallyPublished] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const isFileMode = form.contentMode === 'file';

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
          const { data } = await api.slipTest(id);
          if (!active) return;

          const item = data.data.slipTest;
          const contentMode = item.contentMode === 'file' ? 'file' : 'exam';
          let attempts = 0;
          if (contentMode === 'exam') {
            const resultsRes = await api.slipTestResults(id).catch(() => null);
            attempts =
              item.attemptCount ?? resultsRes?.data?.data?.summary?.submitted ?? 0;
          }
          setForm({
            contentMode,
            title: item.title,
            description: item.description || '',
            studentClasses: selectedClassIdsFromItem(item),
            subject: item.subject || '',
            chapter: item.chapter || '',
            topic: item.topic || '',
            startDate: toDateTimeLocalValue(item.startDate),
            endDate: toDateTimeLocalValue(item.endDate),
            durationMinutes: String(item.durationMinutes ?? '15'),
            negativeMarkPerWrong: String(item.negativeMarkPerWrong ?? '0'),
            allowPartialCredit: item.allowPartialCredit ? 'true' : 'false',
            showAnswersAfterSubmit: item.showAnswersAfterSubmit ? 'true' : 'false',
            isPublished: item.isPublished ? 'true' : 'false',
          });
          if (contentMode === 'exam') {
            setQuestions((item.questions || []).map(toEditableQuestion));
          } else {
            setCoverPreview(item.coverImageUrl ? mediaUrl(item.coverImageUrl) : '');
            setExistingFileName(item.fileName || 'Uploaded file');
          }
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

  function onCoverChange(event) {
    const next = event.target.files?.[0] || null;
    setCoverFile(next);
    setFieldErrors((prev) => ({ ...prev, coverImage: '' }));
    if (next) setCoverPreview(URL.createObjectURL(next));
  }

  function onFileChange(event) {
    const next = event.target.files?.[0] || null;
    setResourceFile(next);
    setFieldErrors((prev) => ({ ...prev, file: '' }));
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.studentClasses.length) next.studentClasses = 'Select at least one class.';
    if (!form.chapter.trim()) next.chapter = 'Chapter is required.';
    if (!form.startDate) next.startDate = 'Starting date and time is required.';
    if (!form.endDate) next.endDate = 'Ending date and time is required.';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      next.endDate = 'Ending date and time cannot be before the starting date and time.';
    }

    if (isFileMode) {
      if (!isEdit && !coverFile) next.coverImage = 'Cover image is required.';
      if (!isEdit && !resourceFile) next.file = 'Slip test file is required.';
      setFieldErrors(next);
      setError('');
      return Object.keys(next).length === 0;
    }

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

    setSaving(true);
    try {
      if (isFileMode) {
        const fd = new FormData();
        fd.append('contentMode', 'file');
        fd.append('title', form.title.trim());
        fd.append('description', form.description.trim());
        appendStudentClasses(fd, form.studentClasses);
        fd.append('subject', form.subject.trim());
        fd.append('chapter', form.chapter.trim());
        fd.append('topic', form.topic.trim());
        fd.append('startDate', toApiDateTime(form.startDate));
        fd.append('endDate', toApiDateTime(form.endDate));
        fd.append('isPublished', form.isPublished);
        if (coverFile) fd.append('coverImage', coverFile);
        if (resourceFile) fd.append('file', resourceFile);

        if (isEdit) await api.updateSlipTest(id, fd);
        else await api.createSlipTest(fd);
      } else {
        const payload = {
          contentMode: 'exam',
          title: form.title.trim(),
          description: form.description.trim(),
          studentClasses: form.studentClasses,
          subject: form.subject.trim(),
          chapter: form.chapter.trim(),
          topic: form.topic.trim(),
          startDate: toApiDateTime(form.startDate),
          endDate: toApiDateTime(form.endDate),
          durationMinutes: Number(form.durationMinutes),
          negativeMarkPerWrong: Number(form.negativeMarkPerWrong),
          allowPartialCredit: form.allowPartialCredit === 'true',
          showAnswersAfterSubmit: form.showAnswersAfterSubmit === 'true',
          isPublished: form.isPublished === 'true',
          questions: toApiQuestions(questions),
        };

        if (isEdit && (initiallyPublished || hasAttempts)) {
          if (!window.confirm(confirmSavePublishedMessage(attemptCount))) {
            setSaving(false);
            return;
          }
          payload.confirmWipeAttempts = true;
        }

        if (isEdit) await api.updateSlipTest(id, payload);
        else await api.createSlipTest(payload);
      }
      navigate(`${basePath}/slip-tests`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this slip test.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell embedded title={isEdit ? 'Edit slip test' : 'New slip test'}>
        <LoadingState label="Loading…" />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell embedded title={isEdit ? 'Edit slip test' : 'New slip test'}>
        <ErrorState description={loadError} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Slip tests"
      title={isEdit ? 'Edit slip test' : 'New slip test'}
      description={
        isFileMode
          ? 'Upload a cover and file for students to download in the chapter window.'
          : 'Set the classes and chapter, then add the MCQ questions students will attempt online.'
      }
      actions={
        <Link to={`${basePath}/slip-tests`}>
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

      {!isFileMode && (initiallyPublished || hasAttempts) ? (
        <Alert type="warning" title="Saving will clear attempt data" className="mb-4">
          Saving deletes all attempt data so corrected answers apply for everyone.
        </Alert>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <Card className="space-y-4">
          {!isEdit ? (
            <Select
              label="How do you want to create this slip test?"
              name="contentMode"
              value={form.contentMode}
              onChange={updateField}
              hint="Online exam builds questions here. Upload file works like worksheets."
            >
              <option value="exam">Online exam (build questions)</option>
              <option value="file">Upload file (downloadable)</option>
            </Select>
          ) : (
            <div>
              <p className="text-sm font-semibold text-ink-800">Type</p>
              <p className="mt-1 text-sm text-ink-900/60">
                {isFileMode ? 'Upload file (downloadable)' : 'Online exam (build questions)'}
              </p>
            </div>
          )}

          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={updateField}
            required
            error={fieldErrors.title}
            hint="Example: Slip Test — Laws of Motion"
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
              label="Chapter"
              name="chapter"
              value={form.chapter}
              onChange={updateField}
              required
              error={fieldErrors.chapter}
            />
            <Input
              label="Topic"
              name="topic"
              value={form.topic}
              onChange={updateField}
              hint="Optional, a narrower topic inside the chapter"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={isFileMode ? 'Download opens' : 'Starting date and time'}
              name="startDate"
              type="datetime-local"
              value={form.startDate}
              onChange={updateField}
              required
              error={fieldErrors.startDate}
            />
            <Input
              label={isFileMode ? 'Download closes' : 'Ending date and time'}
              name="endDate"
              type="datetime-local"
              value={form.endDate}
              onChange={updateField}
              required
              error={fieldErrors.endDate}
              hint={
                isFileMode
                  ? 'After this time students can no longer download the file'
                  : 'After this date and time students can no longer start the slip test'
              }
            />
          </div>

          {!isFileMode ? (
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
              hint="The test submits automatically when time runs out"
            />
          ) : null}

          <Textarea
            label={isFileMode ? 'Description' : 'Instructions'}
            name="description"
            value={form.description}
            onChange={updateField}
            rows={3}
            hint={
              isFileMode
                ? 'Optional short note for students'
                : 'Optional notes shown to students before they start'
            }
          />

          {isFileMode ? (
            <Select
              label="Status"
              name="isPublished"
              value={form.isPublished}
              onChange={updateField}
              hint="Students only see published slip tests"
            >
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </Select>
          ) : null}
        </Card>

        {isFileMode ? (
          <Card className="space-y-4">
            <div>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-ink-800">
                  Cover image{!isEdit ? <span className="ml-0.5 text-ember-600">*</span> : null}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onCoverChange}
                  className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-lagoon-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-lagoon-800"
                />
              </label>
              {fieldErrors.coverImage ? (
                <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.coverImage}</p>
              ) : null}
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt=""
                  className="mt-3 h-36 w-full rounded-xl object-cover"
                />
              ) : null}
            </div>

            <div>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-ink-800">
                  Slip test file{!isEdit ? <span className="ml-0.5 text-ember-600">*</span> : null}
                </span>
                <input
                  type="file"
                  onChange={onFileChange}
                  className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-lagoon-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-lagoon-800"
                />
              </label>
              {fieldErrors.file ? (
                <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.file}</p>
              ) : null}
              {existingFileName && !resourceFile ? (
                <p className="mt-1 text-xs text-ink-900/50">Current: {existingFileName}</p>
              ) : null}
            </div>
          </Card>
        ) : (
          <>
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
                  hint="Students only see published slip tests"
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </Select>
              </div>
            </Card>

            <Card>
              <QuestionBuilder questions={questions} onChange={setQuestions} />
            </Card>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create slip test'}
          </Button>
          <Link to={`${basePath}/slip-tests`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
