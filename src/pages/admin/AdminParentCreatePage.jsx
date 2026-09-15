import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Alert } from '../../components/ui/Alert';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  studentClass: '',
};

export function AdminParentCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [classOptions, setClassOptions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await authApi.classes();
      setClassOptions(data.data.classes || []);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load classes.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

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
    if (!form.studentClass) {
      next.studentClass = 'Please select a class.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaveError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const { data } = await adminApi.createParent({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        classes: [form.studentClass],
      });
      navigate(`/admin/parents/${data.data.parent.id}`);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not create parent.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Parents"
      title="Add parent"
      description="Create a parent account. Share the login email and password with them."
      actions={
        <Link to="/admin/parents">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}

      {status === 'ready' ? (
        <Card>
          {saveError ? (
            <Alert type="error" title="Could not save" onClose={() => setSaveError('')} className="mb-4">
              {saveError}
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSave}>
            <Input
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              error={fieldErrors.fullName}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={updateField}
              error={fieldErrors.phone}
              required
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
              {classOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              error={fieldErrors.password}
              required
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              error={fieldErrors.confirmPassword}
              required
            />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" loading={saving}>
                Create parent
              </Button>
              <Link to="/admin/parents">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      ) : null}
    </PageShell>
  );
}
