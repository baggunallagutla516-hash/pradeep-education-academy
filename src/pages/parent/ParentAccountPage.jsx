import { useEffect, useState } from 'react';
import { Pencil, UserRound, X } from 'lucide-react';
import { useParentAuth } from '../../context/ParentAuthContext';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';

function DetailRow({ label, value }) {
  const display = value && String(value).trim() ? value : null;
  return (
    <div className="grid gap-1 border-b border-ink-900/8 py-3 last:border-0 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-ink-900/55">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">
        {display || <span className="text-ink-900/40">Not provided</span>}
      </dd>
    </div>
  );
}

function formFromParent(parent) {
  return {
    fullName: parent.fullName || '',
    email: parent.email || '',
    phone: parent.phone || '',
  };
}

export function ParentAccountPage() {
  const { parent, updateProfile } = useParentAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => (parent ? formFromParent(parent) : null));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (parent && !editing) {
      setForm(formFromParent(parent));
    }
  }, [parent, editing]);

  if (!parent) {
    return (
      <PageShell embedded title="My account" description="Your parent profile details.">
        <EmptyState
          icon={UserRound}
          title="No account details available"
          description="Try logging in again."
        />
      </PageShell>
    );
  }

  function startEdit() {
    setForm(formFromParent(parent));
    setFieldErrors({});
    setError('');
    setSuccess('');
    setEditing(true);
  }

  function cancelEdit() {
    setForm(formFromParent(parent));
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
      });
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update profile.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Account"
      title="My account"
      description="Your parent profile details."
      actions={
        !editing ? (
          <Button variant="secondary" size="sm" onClick={startEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        ) : null
      }
    >
      {success ? (
        <Alert type="success" title="Saved" onClose={() => setSuccess('')} className="mb-4">
          {success}
        </Alert>
      ) : null}

      <Card>
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
            <DetailRow label="Full name" value={parent.fullName} />
            <DetailRow label="Email" value={parent.email} />
            <DetailRow label="Phone" value={parent.phone} />
            <DetailRow
              label="Linked students"
              value={String(parent.studentIds?.length || 0)}
            />
          </dl>
        )}
      </Card>
    </PageShell>
  );
}
