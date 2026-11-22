import { useEffect, useState } from 'react';
import { ExternalLink, Pencil, Plus, Trash2, Video } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

const AUDIENCE_OPTIONS = [
  { value: 'student', label: 'Students' },
  { value: 'educator', label: 'Staff' },
  { value: 'parent', label: 'Parents' },
];

const PLATFORM_LABEL = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  other: 'Other',
};

const EMPTY_FORM = {
  title: '',
  meetingLink: '',
  description: '',
  scheduledAt: '',
  visibleTo: ['student', 'educator', 'parent'],
};

function toLocalInputValue(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWhen(value) {
  if (!value) return 'No schedule';
  try {
    return new Date(value).toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'No schedule';
  }
}

function audienceLabel(list) {
  const labels = AUDIENCE_OPTIONS.filter((opt) => list?.includes(opt.value)).map((opt) => opt.label);
  return labels.length ? labels.join(', ') : 'Nobody';
}

export function AdminOnlineClassesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.onlineClasses();
      setItems(data.data.onlineClasses || []);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load online classes.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      meetingLink: item.meetingLink || '',
      description: item.description || '',
      scheduledAt: toLocalInputValue(item.scheduledAt),
      visibleTo: item.visibleTo?.length ? [...item.visibleTo] : ['student', 'educator', 'parent'],
    });
    setFormError('');
  }

  function cancelEdit() {
    setEditingId('');
    setForm(EMPTY_FORM);
    setFormError('');
  }

  function toggleAudience(value) {
    setForm((prev) => {
      const has = prev.visibleTo.includes(value);
      const next = has
        ? prev.visibleTo.filter((item) => item !== value)
        : [...prev.visibleTo, value];
      return { ...prev, visibleTo: next };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!form.meetingLink.trim()) {
      setFormError('Paste a Google Meet or Zoom link.');
      return;
    }
    if (form.visibleTo.length === 0) {
      setFormError('Choose who can see this class: students, staff, and/or parents.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title.trim(),
        meetingLink: form.meetingLink.trim(),
        description: form.description.trim(),
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
        visibleTo: form.visibleTo,
      };

      if (editingId) {
        const { data } = await adminApi.updateOnlineClass(editingId, payload);
        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? data.data.onlineClass : item))
        );
      } else {
        const { data } = await adminApi.createOnlineClass({ ...payload, isActive: true });
        setItems((prev) => [data.data.onlineClass, ...prev]);
      }
      cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save online class link.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item) {
    setBusyId(item.id);
    try {
      const { data } = await adminApi.updateOnlineClass(item.id, { isActive: !item.isActive });
      setItems((prev) => prev.map((row) => (row.id === item.id ? data.data.onlineClass : row)));
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not update visibility.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this online class link?')) return;
    setBusyId(id);
    try {
      await adminApi.deleteOnlineClass(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not delete online class.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Online classes"
      description="Paste a Google Meet or Zoom link once. Staff, parents, and students open the same menu and Join to go into the meeting."
    >
      <Card className="mb-6">
        <form className="space-y-3" onSubmit={handleSubmit}>
          {formError ? (
            <Alert type="error" title="Could not save" onClose={() => setFormError('')}>
              {formError}
            </Alert>
          ) : null}
          <Input
            label="Class title"
            name="title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Class 10 Maths — live doubt session"
            maxLength={200}
            required
          />
          <Input
            label="Upload Google Meet / Zoom link"
            name="meetingLink"
            type="url"
            value={form.meetingLink}
            onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
            placeholder="https://meet.google.com/… or https://zoom.us/j/…"
            hint="Paste the full meeting URL. Staff, parents, and students tap Join to open it."
            required
          />
          <Input
            label="Date & time (optional)"
            name="scheduledAt"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
          />
          <Textarea
            label="Notes (optional)"
            name="description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Topic, host name, or join tips…"
            rows={3}
            maxLength={1000}
          />
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink-800">Who can see & join</legend>
            <div className="flex flex-wrap gap-3">
              {AUDIENCE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-800"
                >
                  <input
                    type="checkbox"
                    checked={form.visibleTo.includes(opt.value)}
                    onChange={() => toggleAudience(opt.value)}
                    className="h-4 w-4 rounded border-ink-900/20 text-lagoon-600 focus:ring-lagoon-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {editingId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Save link
                </>
              )}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      {status === 'loading' ? <LoadingState label="Loading online classes…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && items.length === 0 ? (
        <EmptyState
          title="No meeting links yet"
          description="Paste a Google Meet or Zoom URL above so everyone can join from one menu."
        />
      ) : null}

      {status === 'ready' && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge tone={item.isActive ? 'lagoon' : 'ink'}>
                    {item.isActive ? 'Visible' : 'Hidden'}
                  </Badge>
                  <Badge tone="ember">{PLATFORM_LABEL[item.platform] || 'Other'}</Badge>
                  <Badge tone="ink">{audienceLabel(item.visibleTo)}</Badge>
                </div>
                <p className="font-display text-base font-extrabold text-ink-900">{item.title}</p>
                <p className="mt-1 text-sm text-ink-900/55">{formatWhen(item.scheduledAt)}</p>
                {item.description ? (
                  <p className="mt-2 text-sm text-ink-800/75">{item.description}</p>
                ) : null}
                <a
                  href={item.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-lagoon-700 hover:underline"
                >
                  <Video className="h-3.5 w-3.5 shrink-0" />
                  {item.meetingLink}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => startEdit(item)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={busyId === item.id}
                  onClick={() => toggleActive(item)}
                >
                  {item.isActive ? 'Hide' : 'Show'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={busyId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
