import { useCallback, useEffect, useState } from 'react';
import { Pencil, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { CLASS_FALLBACK } from '../constants/site';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';

function DetailRow({ label, value }) {
  const display = value && String(value).trim() ? value : null;

  return (
    <div className="grid gap-1 border-b border-ink-900/8 py-3 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-ink-900/55">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">
        {display || <span className="text-ink-900/40">Not provided</span>}
      </dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return null;
  }
}

function formFromStudent(student) {
  return {
    fullName: student.fullName || '',
    email: student.email || '',
    phone: student.phone || '',
    studentClass: student.studentClass || '',
    schoolName: student.schoolName || '',
    rollNumber: student.rollNumber || '',
  };
}

export function AccountPage() {
  const { student, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => (student ? formFromStudent(student) : null));
  const [classes, setClasses] = useState(CLASS_FALLBACK);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [parents, setParents] = useState([]);
  const [parentsStatus, setParentsStatus] = useState('loading');
  const [parentsError, setParentsError] = useState('');

  const loadParents = useCallback(async () => {
    setParentsStatus('loading');
    setParentsError('');
    try {
      const { data } = await authApi.parents();
      setParents(data.data.parents || []);
      setParentsStatus('ready');
    } catch (err) {
      setParentsStatus('error');
      setParentsError(getErrorMessage(err, 'Could not load linked parents.'));
    }
  }, []);

  useEffect(() => {
    if (student && !editing) {
      setForm(formFromStudent(student));
    }
  }, [student, editing]);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  useEffect(() => {
    let active = true;
    authApi
      .classes()
      .then(({ data }) => {
        if (!active) return;
        const list = data.data.classes || [];
        setClasses(list.length ? list : CLASS_FALLBACK);
      })
      .catch(() => {
        if (active) setClasses(CLASS_FALLBACK);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!student) {
    return (
      <PageShell embedded title="My account" description="Your student profile details.">
        <EmptyState
          icon={UserRound}
          title="No account details available"
          description="We could not find student information for this session. Try logging in again."
        />
      </PageShell>
    );
  }

  function startEdit() {
    setForm(formFromStudent(student));
    setFieldErrors({});
    setError('');
    setSuccess('');
    setEditing(true);
  }

  function cancelEdit() {
    setForm(formFromStudent(student));
    setFieldErrors({});
    setError('');
    setEditing(false);
  }

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
    if (!form.studentClass) {
      next.studentClass = 'Please select your class.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        studentClass: form.studentClass,
        schoolName: form.schoolName.trim(),
        rollNumber: form.rollNumber.trim(),
      });
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Account"
      title="My account"
      description="These details were saved during registration and will appear on results and certificates later."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="lagoon">{student.studentClass}</Badge>
          {!editing ? (
            <Button variant="secondary" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </div>
      }
    >
      {success ? (
        <Alert type="success" title="Saved" onClose={() => setSuccess('')} className="mb-4">
          {success}
        </Alert>
      ) : null}

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
            <UserRound className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-ink-900">{student.fullName}</h2>
            <p className="truncate text-sm text-ink-900/55">{student.email}</p>
          </div>
        </div>

        {editing ? (
          <form className="space-y-4" onSubmit={handleSave} noValidate>
            {error ? (
              <Alert type="error" title="Update failed" onClose={() => setError('')}>
                {error}
              </Alert>
            ) : null}

            <Input
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              required
              error={fieldErrors.fullName}
            />
            <Input
              label="Email"
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
              hint="10-digit Indian mobile number"
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
              {classes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Input
              label="School"
              name="schoolName"
              value={form.schoolName}
              onChange={updateField}
            />
            <Input
              label="Roll number"
              name="rollNumber"
              value={form.rollNumber}
              onChange={updateField}
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit} disabled={saving}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <dl>
            <DetailRow label="Full name" value={student.fullName} />
            <DetailRow label="Email" value={student.email} />
            <DetailRow label="Phone" value={student.phone} />
            <DetailRow label="Class" value={student.studentClass} />
            <DetailRow label="School" value={student.schoolName} />
            <DetailRow label="Roll number" value={student.rollNumber} />
            <DetailRow label="Member since" value={formatDate(student.createdAt)} />
            <DetailRow label="Last login" value={formatDate(student.lastLoginAt)} />
          </dl>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-bold text-ink-900">Linked parents</h2>
        <p className="mt-1 text-sm text-ink-900/55">
          Parents are linked by the academy admin. Contact them if a parent is missing.
        </p>

        {parentsStatus === 'loading' ? (
          <div className="mt-4">
            <LoadingState label="Loading parents…" />
          </div>
        ) : null}

        {parentsStatus === 'error' ? (
          <Alert type="error" title="Could not load parents" className="mt-4">
            {parentsError}
          </Alert>
        ) : null}

        {parentsStatus === 'ready' && parents.length === 0 ? (
          <p className="mt-4 text-sm text-ink-900/50">No parents linked yet.</p>
        ) : null}

        {parentsStatus === 'ready' && parents.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {parents.map((parent) => (
              <li
                key={parent.id}
                className="rounded-2xl border border-ink-900/8 bg-sand-50/80 px-4 py-3"
              >
                <p className="font-semibold text-ink-900">{parent.fullName}</p>
                <p className="truncate text-sm text-ink-900/55">
                  {parent.email} · {parent.phone}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </PageShell>
  );
}
