import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

const emptyForm = {
  title: '',
  description: '',
  studentClass: '',
  unitNumber: '',
  unitName: '',
  isPublished: 'true',
};

export function AdminUnitTestFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [classes, setClasses] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [removeCover, setRemoveCover] = useState(false);
  const [existingFileName, setExistingFileName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

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
          const { data } = await adminApi.unitTest(id);
          if (!active) return;
          const item = data.data.unitTest;
          setForm({
            title: item.title,
            description: item.description || '',
            studentClass: item.studentClass || '',
            unitNumber: String(item.unitNumber ?? ''),
            unitName: item.unitName || '',
            isPublished: item.isPublished ? 'true' : 'false',
          });
          setCoverPreview(item.coverImageUrl ? mediaUrl(item.coverImageUrl) : '');
          setExistingFileName(item.fileName || 'Uploaded file');
        } else {
          setForm((prev) => ({
            ...prev,
            studentClass: list[0]?.id || '',
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
    if (next) {
      setCoverPreview(URL.createObjectURL(next));
      setRemoveCover(false);
    }
  }

  function onFileChange(event) {
    const next = event.target.files?.[0] || null;
    setResourceFile(next);
    setFieldErrors((prev) => ({ ...prev, file: '' }));
  }

  function handleRemoveCover() {
    setCoverFile(null);
    setCoverPreview('');
    setRemoveCover(true);
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.studentClass) next.studentClass = 'Class is required.';

    const unit = Number(form.unitNumber);
    if (!form.unitNumber.trim()) {
      next.unitNumber = 'Unit number is required.';
    } else if (!Number.isInteger(unit) || unit < 1 || unit > 200) {
      next.unitNumber = 'Enter a whole number between 1 and 200.';
    }

    if (!isEdit && !resourceFile) next.file = 'Question paper file is required.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('studentClass', form.studentClass);
    fd.append('unitNumber', form.unitNumber.trim());
    fd.append('unitName', form.unitName.trim());
    fd.append('isPublished', form.isPublished);
    if (coverFile) fd.append('coverImage', coverFile);
    if (removeCover && !coverFile) fd.append('removeCoverImage', 'true');
    if (resourceFile) fd.append('file', resourceFile);

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateUnitTest(id, fd);
      } else {
        await adminApi.createUnitTest(fd);
      }
      navigate('/admin/unit-tests');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save unit test.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell embedded title={isEdit ? 'Edit unit test' : 'New unit test'}>
        <LoadingState label="Loading…" />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell embedded title={isEdit ? 'Edit unit test' : 'New unit test'}>
        <ErrorState description={loadError} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Unit tests"
      title={isEdit ? 'Edit unit test' : 'New unit test'}
      description="Pick the class and unit, then upload the question paper as a PDF or Word file. Students in that class can download it."
      actions={
        <Link to="/admin/unit-tests">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      <Card>
        {error ? (
          <Alert type="error" title="Save failed" onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={updateField}
            required
            error={fieldErrors.title}
            hint="Example: Unit 3 Test — Trigonometry"
          />
          <Select
            label="Class"
            name="studentClass"
            value={form.studentClass}
            onChange={updateField}
            required
            error={fieldErrors.studentClass}
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Unit number"
              name="unitNumber"
              type="number"
              min="1"
              max="200"
              step="1"
              value={form.unitNumber}
              onChange={updateField}
              required
              error={fieldErrors.unitNumber}
            />
            <Input
              label="Unit name"
              name="unitName"
              value={form.unitName}
              onChange={updateField}
              hint="Optional chapter name"
            />
          </div>
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows={4}
            hint="Optional instructions for students, such as total marks or duration"
          />
          <Select
            label="Status"
            name="isPublished"
            value={form.isPublished}
            onChange={updateField}
          >
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </Select>

          <div>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-ink-800">Cover image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onCoverChange}
                className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-lagoon-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-lagoon-800"
              />
            </label>
            <p className="mt-1 text-xs text-ink-900/50">
              Optional. Cards show a unit test icon when no image is uploaded.
            </p>
            {fieldErrors.coverImage ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.coverImage}</p>
            ) : null}
            {coverPreview ? (
              <div className="mt-3">
                <img src={coverPreview} alt="" className="h-36 w-full rounded-xl object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={handleRemoveCover}
                >
                  Remove cover image
                </Button>
              </div>
            ) : null}
          </div>

          <div>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-ink-800">
                Question paper{!isEdit ? <span className="ml-0.5 text-ember-600">*</span> : null}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onFileChange}
                className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-lagoon-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-lagoon-800"
              />
            </label>
            <p className="mt-1 text-xs text-ink-900/50">PDF or Word document, up to 25MB.</p>
            {fieldErrors.file ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.file}</p>
            ) : null}
            {existingFileName && !resourceFile ? (
              <p className="mt-1 text-xs text-ink-900/50">Current: {existingFileName}</p>
            ) : null}
          </div>

          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create unit test'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
