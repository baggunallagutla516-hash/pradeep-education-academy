import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { CLASS_FALLBACK } from '../../constants/site';
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
  studentClass: CLASS_FALLBACK[0],
  isPublished: 'true',
};

export function AdminWorksheetFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [existingFileName, setExistingFileName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoading(true);
    adminApi
      .worksheet(id)
      .then(({ data }) => {
        if (!active) return;
        const item = data.data.worksheet;
        setForm({
          title: item.title,
          description: item.description || '',
          studentClass: item.studentClass,
          isPublished: item.isPublished ? 'true' : 'false',
        });
        setCoverPreview(mediaUrl(item.coverImageUrl));
        setExistingFileName(item.fileName || 'Uploaded file');
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(getErrorMessage(err, 'Could not load worksheet.'));
        setLoading(false);
      });
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
    if (!form.studentClass) next.studentClass = 'Class is required.';
    if (!isEdit && !coverFile) next.coverImage = 'Cover image is required.';
    if (!isEdit && !resourceFile) next.file = 'Worksheet file is required.';
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
    fd.append('isPublished', form.isPublished);
    if (coverFile) fd.append('coverImage', coverFile);
    if (resourceFile) fd.append('file', resourceFile);

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateWorksheet(id, fd);
      } else {
        await adminApi.createWorksheet(fd);
      }
      navigate('/admin/worksheets');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save worksheet.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell embedded title={isEdit ? 'Edit worksheet' : 'New worksheet'}>
        <LoadingState label="Loading…" />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell embedded title="Edit worksheet">
        <ErrorState description={loadError} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Worksheets"
      title={isEdit ? 'Edit worksheet' : 'New worksheet'}
      description="Cover image and file are stored on Supabase Storage. Students in the selected class can download the file."
      actions={
        <Link to="/admin/worksheets">
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
          />
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows={4}
            hint="Optional short note for students"
          />
          <Select
            label="Class"
            name="studentClass"
            value={form.studentClass}
            onChange={updateField}
            required
            error={fieldErrors.studentClass}
          >
            {CLASS_FALLBACK.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
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
            ) : (
              <p className="mt-1 text-xs text-ink-900/55">JPEG, PNG, WebP, or GIF · max 25MB</p>
            )}
            {coverPreview ? (
              <img
                src={coverPreview}
                alt=""
                className="mt-3 h-40 w-full max-w-md rounded-xl object-cover"
              />
            ) : null}
          </div>

          <div>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-ink-800">
                File{!isEdit ? <span className="ml-0.5 text-ember-600">*</span> : null}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={onFileChange}
                className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-lagoon-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-lagoon-800"
              />
            </label>
            {fieldErrors.file ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.file}</p>
            ) : (
              <p className="mt-1 text-xs text-ink-900/55">
                PDF, Word, PowerPoint, Excel, ZIP, or image · max 25MB
                {isEdit && existingFileName && !resourceFile
                  ? ` · current: ${existingFileName}`
                  : ''}
                {resourceFile ? ` · selected: ${resourceFile.name}` : ''}
              </p>
            )}
          </div>

          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Upload worksheet'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
