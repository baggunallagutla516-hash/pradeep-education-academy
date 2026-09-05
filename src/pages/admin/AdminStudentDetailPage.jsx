import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Unlink, X } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Alert } from '../../components/ui/Alert';

const emptyParentForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function Row({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-ink-900/8 py-3 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm font-semibold text-ink-900/55">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">{value || '—'}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function AddParentModal({ open, onClose, onSaved, studentName }) {
  const [form, setForm] = useState(emptyParentForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyParentForm);
    setFieldErrors({});
    setError('');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      next.fullName = 'Full name must be at least 2 characters.';
    }
    if (!form.email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    const phone = form.phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      next.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!form.password || form.password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSaved({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save parent.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink-950/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-parent-title"
        className="relative z-10 w-full max-w-lg rounded-3xl border border-ink-900/10 bg-white p-5 shadow-lift sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="add-parent-title" className="font-display text-xl font-bold text-ink-900">
              Add parent
            </h2>
            <p className="mt-1 text-sm text-ink-900/55">
              Create a parent login and link them to {studentName || 'this student'}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-ink-900/50 transition hover:bg-ink-900/5 hover:text-ink-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <Alert type="error" title="Save failed" onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            name="fullName"
            value={form.fullName}
            onChange={updateField}
            required
            error={fieldErrors.fullName}
            placeholder="Parent / guardian name"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email (login)"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              error={fieldErrors.email}
            />
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={updateField}
              required
              error={fieldErrors.phone}
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
              error={fieldErrors.password}
              hint="Share with parent for login"
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              required
              error={fieldErrors.confirmPassword}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save & link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminStudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [linkBusyId, setLinkBusyId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.student(id);
      setStudent(data.data.student);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load student.'));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleActive() {
    if (!student) return;
    setBusy(true);
    setActionError('');
    try {
      const { data } = await adminApi.setStudentActive(student.id, !student.isActive);
      setStudent((prev) => ({
        ...data.data.student,
        parents: prev?.parents || data.data.student.parents || [],
      }));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update status.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveParent(payload) {
    const { data } = await adminApi.addParentToStudent(student.id, payload);
    setActionSuccess(data.message || 'Parent saved and linked.');
    setModalOpen(false);
    await load();
  }

  async function unlinkParent(parentId) {
    if (!window.confirm('Remove this parent link from the student?')) return;
    setLinkBusyId(parentId);
    setActionError('');
    setActionSuccess('');
    try {
      const { data } = await adminApi.unlinkParentStudent({
        parentId,
        studentId: student.id,
      });
      setActionSuccess(data.message || 'Parent unlinked.');
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not unlink parent.'));
    } finally {
      setLinkBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Students"
      title={student?.fullName || 'Student'}
      description="Student details and linked parents."
      actions={
        <Link to="/admin/students">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' && student ? (
        <>
          {actionError ? (
            <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
              {actionError}
            </Alert>
          ) : null}
          {actionSuccess ? (
            <Alert type="success" title="Updated" onClose={() => setActionSuccess('')} className="mb-4">
              {actionSuccess}
            </Alert>
          ) : null}

          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone={student.isActive ? 'lagoon' : 'ink'}>
                {student.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge>{student.studentClass}</Badge>
              <Button
                size="sm"
                variant={student.isActive ? 'danger' : 'primary'}
                loading={busy}
                onClick={toggleActive}
              >
                {student.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
            <dl>
              <Row label="Full name" value={student.fullName} />
              <Row label="Email" value={student.email} />
              <Row label="Phone" value={student.phone} />
              <Row label="Class" value={student.studentClass} />
              <Row label="School" value={student.schoolName} />
              <Row label="Roll number" value={student.rollNumber} />
              <Row label="Member since" value={formatDate(student.createdAt)} />
              <Row label="Last login" value={formatDate(student.lastLoginAt)} />
            </dl>
          </Card>

          <Card className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900">Parents</h2>
                <p className="mt-1 text-sm text-ink-900/55">
                  Add a parent here. They can log in at Parent login with the email and password you set.
                </p>
              </div>
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add parent
              </Button>
            </div>

            {student.parents?.length ? (
              <ul className="mt-4 space-y-3">
                {student.parents.map((parent) => (
                  <li
                    key={parent.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ink-900/8 bg-sand-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900">{parent.fullName}</p>
                      <p className="text-sm text-ink-900/55">
                        {parent.email} · {parent.phone}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={linkBusyId === parent.id}
                      onClick={() => unlinkParent(parent.id)}
                    >
                      <Unlink className="h-4 w-4" />
                      Unlink
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-900/50">No parents linked yet. Click Add parent.</p>
            )}
          </Card>

          <AddParentModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSaved={handleSaveParent}
            studentName={student.fullName}
          />
        </>
      ) : null}
    </PageShell>
  );
}
