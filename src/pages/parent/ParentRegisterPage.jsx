import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useParentAuth } from '../../context/ParentAuthContext';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  studentClass: '',
};

export function ParentRegisterPage() {
  const { register } = useParentAuth();

  const [form, setForm] = useState(initialForm);
  const [classOptions, setClassOptions] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    authApi
      .classes()
      .then(({ data }) => {
        if (!active) return;
        setClassOptions(data.data.classes || []);
      })
      .catch(() => {
        if (!active) return;
        setClassOptions([]);
      });
    return () => {
      active = false;
    };
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
    if (!form.studentClass) {
      next.studentClass = 'Please select a class.';
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
      const data = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        classes: [form.studentClass],
      });
      setForm(initialForm);
      setSuccess(
        data?.message ||
          'Registration successful. Your account is not active yet. Please contact the admin to activate it and link your children.'
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <PageShell
        eyebrow="Parent registration"
        title="Account created"
        description="The admin will activate your account and link your children before you can log in."
      >
        <Card className="mx-auto max-w-2xl">
          <Alert type="success" title="Registration successful">
            {success}
          </Alert>
          <Link to="/parent/login" className="mt-5 block">
            <Button variant="secondary" fullWidth>
              Go to parent login
            </Button>
          </Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Parent registration"
      title="Create your parent account"
      description="Select your child's class from the list created by the academy."
    >
      <Card className="mx-auto max-w-2xl">
        {error ? (
          <Alert type="error" title="Registration failed" onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              required
              error={fieldErrors.fullName}
              placeholder="Your name"
              autoComplete="name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              error={fieldErrors.email}
              placeholder="parent@email.com"
              autoComplete="email"
            />
          </div>

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={updateField}
            required
            error={fieldErrors.phone}
            placeholder="10-digit mobile"
            inputMode="numeric"
            autoComplete="tel"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
              error={fieldErrors.password}
              hint="At least 8 characters"
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              required
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" loading={submitting} fullWidth>
            <UserPlus className="h-4 w-4" />
            Create parent account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-900/65">
          Already registered?{' '}
          <Link to="/parent/login" className="font-semibold text-lagoon-700 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
