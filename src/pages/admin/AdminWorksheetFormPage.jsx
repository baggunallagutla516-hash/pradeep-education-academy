import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStaffContent } from '../../context/StaffContentContext';
import { authApi } from '../../api/authApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
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

const emptyForm = {
  title: '',
  description: '',
  studentClasses: [],
  isPublished: 'true',
};

export function AdminWorksheetFormPage() {
  const { basePath, api } = useStaffContent();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
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
          const { data } = await api.worksheet(id);
          if (!active) return;
          const item = data.data.worksheet;
          setForm({
            title: item.title,
            description: item.description || '',
            studentClasses: selectedClassIdsFromItem(item),
            isPublished: item.isPublished ? 'true' : 'false',
          });
          setCoverPreview(mediaUrl(item.coverImageUrl));
          setExistingFileName(item.fileName || 'Uploaded file');
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
    appendStudentClasses(fd, form.studentClasses);
    fd.append('isPublished', form.isPublished);
    if (coverFile) fd.append('coverImage', coverFile);
    if (resourceFile) fd.append('file', resourceFile);

    setSaving(true);
    try {
      if (isEdit) {
        await api.updateWorksheet(id, fd);
      } else {
        await api.createWorksheet(fd);
      }
      navigate(`${basePath}/worksheets`);
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
      <PageShell embedded title={isEdit ? 'Edit worksheet' : 'New worksheet'}>
        <ErrorState description={loadError} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Worksheets"
      title={isEdit ? 'Edit worksheet' : 'New worksheet'}
      description="Cover image and file are stored on Supabase Storage. Students in the selected classes can download the file."
      actions={
        <Link to={`${basePath}/worksheets`}>
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
          <ClassMultiSelect
            classes={classes}
            value={form.studentClasses}
            onChange={(studentClasses) => {
              setForm((prev) => ({ ...prev, studentClasses }));
              setFieldErrors((prev) => ({ ...prev, studentClasses: '' }));
            }}
            error={fieldErrors.studentClasses}
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
                Worksheet file{!isEdit ? <span className="ml-0.5 text-ember-600">*</span> : null}
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

          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create worksheet'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
