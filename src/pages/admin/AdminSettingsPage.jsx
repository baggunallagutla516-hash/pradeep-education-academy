import { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { clearSiteLogoCache, notifySiteLogoChanged } from '../../utils/siteLogo';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

export function AdminSettingsPage() {
  const [logoUrl, setLogoUrl] = useState('');
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [className, setClassName] = useState('');
  const [editingId, setEditingId] = useState('');
  const [savingClass, setSavingClass] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [logoBusy, setLogoBusy] = useState(false);

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.settings();
      setLogoUrl(data.data.settings.logoUrl || '');
      setClasses(data.data.classes || []);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load settings.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLogoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const fd = new FormData();
    fd.append('logo', file);
    setLogoBusy(true);
    setFormError('');
    try {
      const { data } = await adminApi.uploadLogo(fd);
      setLogoUrl(data.data.settings.logoUrl || '');
      clearSiteLogoCache();
      notifySiteLogoChanged(data.data.settings.logoUrl || '');
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not upload logo.'));
    } finally {
      setLogoBusy(false);
    }
  }

  async function handleRemoveLogo() {
    if (!window.confirm('Remove the website logo?')) return;
    setLogoBusy(true);
    setFormError('');
    try {
      await adminApi.removeLogo();
      setLogoUrl('');
      clearSiteLogoCache();
      notifySiteLogoChanged('');
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not remove logo.'));
    } finally {
      setLogoBusy(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setClassName(item.name);
    setFormError('');
  }

  function cancelEdit() {
    setEditingId('');
    setClassName('');
    setFormError('');
  }

  async function handleClassSubmit(event) {
    event.preventDefault();
    if (!className.trim()) {
      setFormError('Class name is required.');
      return;
    }
    setSavingClass(true);
    setFormError('');
    try {
      if (editingId) {
        const { data } = await adminApi.updateClass(editingId, { name: className.trim() });
        setClasses((prev) => prev.map((c) => (c.id === editingId ? data.data.class : c)));
      } else {
        const { data } = await adminApi.createClass({ name: className.trim() });
        setClasses((prev) =>
          [...prev, data.data.class].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        );
      }
      cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save class.'));
    } finally {
      setSavingClass(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Permanently delete this class? This cannot be undone.')) {
      return;
    }
    setBusyId(id);
    setFormError('');
    try {
      await adminApi.deleteClass(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not delete class.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Settings"
      description="Upload the website logo and manage classes shown in registration and worksheet dropdowns."
    >
      {status === 'loading' ? <LoadingState label="Loading settings…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' ? (
        <div className="space-y-6">
          {formError ? (
            <Alert type="error" title="Action failed" onClose={() => setFormError('')}>
              {formError}
            </Alert>
          ) : null}

          <Card>
            <h2 className="font-display text-lg font-bold text-ink-900">Website logo</h2>
            <p className="mt-1 text-sm text-ink-900/55">
              Shown in the site header. Stored on Supabase Storage. JPEG, PNG, WebP, or GIF up to 2
              MB.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-lagoon-100 text-lagoon-700">
                {logoUrl ? (
                  <img
                    src={mediaUrl(logoUrl)}
                    alt="Website logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer">
                  <span className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-lagoon-600 px-3 text-sm font-semibold text-white shadow-lift transition hover:bg-lagoon-700">
                    {logoBusy ? 'Please wait…' : logoUrl ? 'Replace logo' : 'Upload logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={logoBusy}
                    onChange={handleLogoChange}
                  />
                </label>
                {logoUrl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={logoBusy}
                    onClick={handleRemoveLogo}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold text-ink-900">Custom classes</h2>
            <p className="mt-1 text-sm text-ink-900/55">
              These classes appear in class dropdowns. Students store the class id.
            </p>

            <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={handleClassSubmit}>
              <div className="min-w-[12rem] flex-1">
                <Input
                  label={editingId ? 'Edit class name' : 'New class name'}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Class 8"
                />
              </div>
              <Button type="submit" size="sm" loading={savingClass}>
                {editingId ? (
                  'Save'
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add class
                  </>
                )}
              </Button>
              {editingId ? (
                <Button type="button" size="sm" variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
              ) : null}
            </form>

            {classes.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No classes yet"
                  description="Add classes that students and worksheets can select."
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-ink-900/8">
                {classes.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink-900">{item.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => startEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        loading={busyId === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </PageShell>
  );
}
