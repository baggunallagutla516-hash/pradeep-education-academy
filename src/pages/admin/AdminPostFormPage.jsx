import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
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
  summary: '',
  body: '',
  isPublished: 'true',
};

export function AdminPostFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
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
      .post(id)
      .then(({ data }) => {
        if (!active) return;
        const post = data.data.post;
        setForm({
          title: post.title,
          summary: post.summary || '',
          body: post.body,
          isPublished: post.isPublished ? 'true' : 'false',
        });
        setPreview(mediaUrl(post.posterImage));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(getErrorMessage(err, 'Could not load post.'));
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

  function onFileChange(event) {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setFieldErrors((prev) => ({ ...prev, posterImage: '' }));
    if (next) {
      setPreview(URL.createObjectURL(next));
    }
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.body.trim()) next.body = 'Body is required.';
    if (!isEdit && !file) next.posterImage = 'Poster image is required.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('summary', form.summary.trim());
    fd.append('body', form.body.trim());
    fd.append('isPublished', form.isPublished);
    if (file) fd.append('posterImage', file);

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updatePost(id, fd);
      } else {
        await adminApi.createPost(fd);
      }
      navigate('/admin/posts');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save post.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell embedded title={isEdit ? 'Edit post' : 'New post'}>
        <LoadingState label="Loading…" />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell embedded title="Edit post">
        <ErrorState description={loadError} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Posts"
      title={isEdit ? 'Edit post' : 'New post'}
      description="Poster image appears on the home feed. Students can open the full post after login."
      actions={
        <Link to="/admin/posts">
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
          <Input
            label="Summary"
            name="summary"
            value={form.summary}
            onChange={updateField}
            hint="Short line shown under the title on the feed"
          />
          <Textarea
            label="Body"
            name="body"
            value={form.body}
            onChange={updateField}
            required
            rows={8}
            error={fieldErrors.body}
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
                Poster image{!isEdit ? <span className="ml-0.5 text-ember-600">*</span> : null}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onFileChange}
                className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-lagoon-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-lagoon-800"
              />
            </label>
            {fieldErrors.posterImage ? (
              <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.posterImage}</p>
            ) : (
              <p className="mt-1 text-xs text-ink-900/55">JPEG, PNG, WebP, or GIF · max 5MB</p>
            )}
            {preview ? (
              <img src={preview} alt="" className="mt-3 h-40 w-full max-w-md rounded-xl object-cover" />
            ) : null}
          </div>

          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create post'}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
