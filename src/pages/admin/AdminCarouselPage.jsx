import { useEffect, useMemo, useState } from 'react';
import { Images, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { toApiDateTime, toDateTimeLocalValue } from '../../utils/quizFormat';
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

const SLIDE_TYPES = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'topper', label: 'Topper' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'featured_post', label: 'Featured post' },
];

const emptyForm = {
  slideType: 'quiz',
  title: '',
  description: '',
  ctaText: 'Attempt Quiz',
  displayOrder: '0',
  isEnabled: true,
  publishAt: '',
  unpublishAt: '',
  quizId: '',
  difficulty: '',
  category: '',
  studentName: '',
  studentClassLabel: '',
  quizName: '',
  scoreDisplay: '',
  percentage: '',
  rank: '',
  badgeLabel: 'Quiz Topper',
  showStudentName: true,
  showStudentClass: true,
  showStudentPhoto: true,
  showScore: true,
  showPercentage: true,
  showRank: false,
  linkPath: '',
};

function PrivacyToggle({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-sand-50 px-3 py-2 text-sm font-medium text-ink-800">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-ink-900/20 text-lagoon-600 focus:ring-lagoon-500"
      />
      {label}
    </label>
  );
}

export function AdminCarouselPage() {
  const [slides, setSlides] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');

  const isTopperLike = form.slideType === 'topper' || form.slideType === 'achievement';
  const sortedSlides = useMemo(
    () => [...slides].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [slides]
  );

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const [carouselRes, quizzesRes] = await Promise.all([
        adminApi.carousel(),
        adminApi.quizzes(),
      ]);
      setSlides(carouselRes.data.data.slides || []);
      setQuizzes(quizzesRes.data.data.quizzes || []);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load carousel slides.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm);
    setImageFile(null);
    setPhotoFile(null);
    setFormError('');
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      slideType: item.slideType || 'quiz',
      title: item.title || '',
      description: item.description || '',
      ctaText: item.ctaText || '',
      displayOrder: String(item.displayOrder ?? 0),
      isEnabled: Boolean(item.isEnabled),
      publishAt: item.publishAt ? toDateTimeLocalValue(item.publishAt) : '',
      unpublishAt: item.unpublishAt ? toDateTimeLocalValue(item.unpublishAt) : '',
      quizId: item.quizId || '',
      difficulty: item.difficulty || '',
      category: item.category || '',
      studentName: item.studentName || '',
      studentClassLabel: item.studentClassLabel || '',
      quizName: item.quizName || '',
      scoreDisplay: item.scoreDisplay || '',
      percentage: item.percentage == null ? '' : String(item.percentage),
      rank: item.rank == null ? '' : String(item.rank),
      badgeLabel: item.badgeLabel || 'Quiz Topper',
      showStudentName: Boolean(item.showStudentName),
      showStudentClass: Boolean(item.showStudentClass),
      showStudentPhoto: Boolean(item.showStudentPhoto),
      showScore: Boolean(item.showScore),
      showPercentage: Boolean(item.showPercentage),
      showRank: Boolean(item.showRank),
      linkPath: item.linkPath || '',
    });
    setImageFile(null);
    setPhotoFile(null);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildFormData() {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        fd.append(key, value ? 'true' : 'false');
      } else if (key === 'publishAt' || key === 'unpublishAt') {
        fd.append(key, value ? toApiDateTime(value) : '');
      } else {
        fd.append(key, value ?? '');
      }
    });
    if (imageFile) fd.append('image', imageFile);
    if (photoFile) fd.append('studentPhoto', photoFile);
    return fd;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (form.slideType === 'quiz' && !form.quizId) {
      setFormError('Select a quiz for this slide.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = buildFormData();
      if (editingId) {
        const { data } = await adminApi.updateCarouselSlide(editingId, payload);
        setSlides((prev) => prev.map((s) => (s.id === editingId ? data.data.slide : s)));
      } else {
        const { data } = await adminApi.createCarouselSlide(payload);
        setSlides((prev) => [data.data.slide, ...prev]);
      }
      resetForm();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save carousel slide.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(item) {
    setBusyId(item.id);
    try {
      const fd = new FormData();
      fd.append('isEnabled', item.isEnabled ? 'false' : 'true');
      const { data } = await adminApi.updateCarouselSlide(item.id, fd);
      setSlides((prev) => prev.map((s) => (s.id === item.id ? data.data.slide : s)));
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not update slide.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this carousel slide?')) return;
    setBusyId(id);
    try {
      await adminApi.deleteCarouselSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not delete slide.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Home carousel"
      description="Manage featured quizzes and public topper achievements on the home page. Visitors can view slides without login."
    >
      <Card className="mb-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {formError ? (
            <Alert type="error" title="Could not save" onClose={() => setFormError('')}>
              {formError}
            </Alert>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-ink-900">
              {editingId ? 'Edit slide' : 'Add new slide'}
            </h3>
            {editingId ? (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Slide type"
              name="slideType"
              value={form.slideType}
              onChange={updateField}
              required
            >
              {SLIDE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={updateField}
              required
              maxLength={160}
            />
            <Input
              label="CTA button text"
              name="ctaText"
              value={form.ctaText}
              onChange={updateField}
              maxLength={60}
              placeholder="Attempt Quiz"
            />
            <Input
              label="Display order"
              name="displayOrder"
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={updateField}
              hint="Lower numbers appear first"
            />
            <Input
              label="Publish at"
              name="publishAt"
              type="datetime-local"
              value={form.publishAt}
              onChange={updateField}
            />
            <Input
              label="Unpublish at"
              name="unpublishAt"
              type="datetime-local"
              value={form.unpublishAt}
              onChange={updateField}
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink-800">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows={3}
              maxLength={600}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition focus:border-lagoon-500"
              placeholder="Short description for the slide…"
            />
          </label>

          {form.slideType === 'quiz' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                label="Linked quiz"
                name="quizId"
                value={form.quizId}
                onChange={updateField}
                required
              >
                <option value="">Select a published quiz…</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                    {quiz.isPublished ? '' : ' (draft)'}
                  </option>
                ))}
              </Select>
              <Input
                label="Difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={updateField}
                placeholder="Easy • Hard • Very Hard"
              />
              <Input
                label="Category"
                name="category"
                value={form.category}
                onChange={updateField}
                placeholder="Culture, Science…"
              />
            </div>
          ) : null}

          {isTopperLike ? (
            <div className="space-y-3 rounded-2xl border border-lagoon-200 bg-lagoon-50/40 p-4">
              <p className="text-sm font-semibold text-lagoon-800">
                Topper details — only show fields you enable below
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Student name"
                  name="studentName"
                  value={form.studentName}
                  onChange={updateField}
                />
                <Input
                  label="Class / grade"
                  name="studentClassLabel"
                  value={form.studentClassLabel}
                  onChange={updateField}
                  placeholder="Class 8"
                />
                <Input
                  label="Quiz name"
                  name="quizName"
                  value={form.quizName}
                  onChange={updateField}
                />
                <Input
                  label="Score display"
                  name="scoreDisplay"
                  value={form.scoreDisplay}
                  onChange={updateField}
                  placeholder="15 / 15"
                />
                <Input
                  label="Percentage"
                  name="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={form.percentage}
                  onChange={updateField}
                />
                <Input
                  label="Rank"
                  name="rank"
                  type="number"
                  min="1"
                  value={form.rank}
                  onChange={updateField}
                />
                <Input
                  label="Badge label"
                  name="badgeLabel"
                  value={form.badgeLabel}
                  onChange={updateField}
                />
                <Select label="Optional linked quiz" name="quizId" value={form.quizId} onChange={updateField}>
                  <option value="">None</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <PrivacyToggle
                  label="Show student name"
                  name="showStudentName"
                  checked={form.showStudentName}
                  onChange={updateField}
                />
                <PrivacyToggle
                  label="Show class"
                  name="showStudentClass"
                  checked={form.showStudentClass}
                  onChange={updateField}
                />
                <PrivacyToggle
                  label="Show photo"
                  name="showStudentPhoto"
                  checked={form.showStudentPhoto}
                  onChange={updateField}
                />
                <PrivacyToggle
                  label="Show score"
                  name="showScore"
                  checked={form.showScore}
                  onChange={updateField}
                />
                <PrivacyToggle
                  label="Show percentage"
                  name="showPercentage"
                  checked={form.showPercentage}
                  onChange={updateField}
                />
                <PrivacyToggle
                  label="Show rank"
                  name="showRank"
                  checked={form.showRank}
                  onChange={updateField}
                />
              </div>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-ink-800">Student photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-lagoon-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-lagoon-800"
                />
              </label>
            </div>
          ) : null}

          {form.slideType === 'featured_post' ? (
            <Input
              label="Internal link path"
              name="linkPath"
              value={form.linkPath}
              onChange={updateField}
              placeholder="/posts/..."
              hint="Must start with /"
            />
          ) : null}

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink-800">Banner / slide image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-800 file:mr-3 file:rounded-lg file:border-0 file:bg-ember-400/20 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ember-700"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-800">
            <input
              type="checkbox"
              name="isEnabled"
              checked={form.isEnabled}
              onChange={updateField}
              className="h-4 w-4 rounded border-ink-900/20 text-lagoon-600 focus:ring-lagoon-500"
            />
            Enabled on home page
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={saving}>
              {editingId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Update slide
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add slide
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {status === 'loading' ? <LoadingState label="Loading slides…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && sortedSlides.length === 0 ? (
        <EmptyState
          title="No carousel slides yet"
          description="Add a quiz or topper slide to feature on the home page."
          icon={Images}
        />
      ) : null}

      {status === 'ready' && sortedSlides.length > 0 ? (
        <div className="space-y-3">
          {sortedSlides.map((item) => (
            <Card key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-20 w-full shrink-0 overflow-hidden rounded-2xl bg-sand-100 sm:w-32">
                {item.imageUrl || item.studentPhotoUrl ? (
                  <img
                    src={item.imageUrl || item.studentPhotoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-800/30">
                    <Images className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge tone="lagoon">{item.slideType}</Badge>
                  <Badge tone={item.isEnabled ? 'ember' : 'ink'}>
                    {item.isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Badge>Order {item.displayOrder ?? 0}</Badge>
                </div>
                <h4 className="truncate font-display text-lg font-bold text-ink-900">{item.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-ink-900/60">
                  {item.description || item.quizTitle || item.quizName || 'No description'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busyId === item.id}
                  onClick={() => toggleEnabled(item)}
                >
                  {item.isEnabled ? 'Disable' : 'Enable'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => startEdit(item)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busyId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
