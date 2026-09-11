import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

const LINK_OPTIONS = [
  { value: '', label: 'No link (text only)' },
  { value: '/worksheets', label: 'Worksheets' },
  { value: '/unit-tests', label: 'EXAMS' },
  { value: '/cets', label: 'C.E.T.' },
  { value: '/assessments', label: 'Online Assessments' },
  { value: '/dpps', label: 'D.P.P.' },
  { value: '/quizzes', label: 'QUIZ' },
  { value: '/slip-tests', label: 'Slip tests' },
  { value: '/login', label: 'Student login' },
  { value: '/register', label: 'Student register' },
  { value: '/contact', label: 'Contact' },
];

export function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
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
      const { data } = await adminApi.news();
      setNews(data.data.news);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load news.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setText(item.text);
    setLink(item.link || '');
    setFormError('');
  }

  function cancelEdit() {
    setEditingId('');
    setText('');
    setLink('');
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) {
      setFormError('News text is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { text: text.trim(), link: link.trim() };
      if (editingId) {
        const { data } = await adminApi.updateNews(editingId, payload);
        setNews((prev) => prev.map((n) => (n.id === editingId ? data.data.news : n)));
      } else {
        const { data } = await adminApi.createNews({ ...payload, isActive: true });
        setNews((prev) => [data.data.news, ...prev]);
      }
      cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save news.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item) {
    setBusyId(item.id);
    try {
      const { data } = await adminApi.updateNews(item.id, { isActive: !item.isActive });
      setNews((prev) => prev.map((n) => (n.id === item.id ? data.data.news : n)));
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not update news.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this news item?')) return;
    setBusyId(id);
    try {
      await adminApi.deleteNews(id);
      setNews((prev) => prev.filter((n) => n.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not delete news.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="News ticker"
      description="Short announcements that scroll in the top marquee. Add a link so clicks open that page (login first if needed)."
    >
      <Card className="mb-6">
        <form className="space-y-3" onSubmit={handleSubmit}>
          {formError ? (
            <Alert type="error" title="Could not save" onClose={() => setFormError('')}>
              {formError}
            </Alert>
          ) : null}
          <Input
            label={editingId ? 'Edit announcement' : 'New announcement'}
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Short update for the ticker…"
            maxLength={280}
            required
          />
          <Select
            label="Open page on click"
            name="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            hint="Protected pages send guests to student login, then onward to this page."
          >
            {LINK_OPTIONS.map((option) => (
              <option key={option.value || 'none'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
                  Add news
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

      {status === 'loading' ? <LoadingState label="Loading news…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && news.length === 0 ? (
        <EmptyState title="No news yet" description="Add a short announcement above." />
      ) : null}

      {status === 'ready' && news.length > 0 ? (
        <div className="space-y-3">
          {news.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge tone={item.isActive ? 'lagoon' : 'ink'}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </Badge>
                  {item.link ? <Badge tone="ember">{item.link}</Badge> : null}
                </div>
                <p className="text-sm font-medium text-ink-900">{item.text}</p>
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
