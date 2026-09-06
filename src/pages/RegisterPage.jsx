import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  studentClass: '',
  schoolName: '',
  rollNumber: '',
  password: '',
  confirmPassword: '',
};

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [classes, setClasses] = useState([]);
  const [classesStatus, setClassesStatus] = useState('loading');
  const [classesError, setClassesError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadClasses() {
    setClassesStatus('loading');
    setClassesError('');
    try {
      const { data } = await authApi.classes();
      setClasses(data.data.classes || []);
      setClassesStatus('ready');
    } catch (err) {
      setClassesStatus('error');
      setClassesError(getErrorMessage(err, 'Could not load class options.'));
    }
  }

  useEffect(() => {
    loadClasses();
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
      next.studentClass = 'Please select your class.';
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
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        studentClass: form.studentClass,
        schoolName: form.schoolName.trim(),
        rollNumber: form.rollNumber.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (classesStatus === 'loading') {
    return (
      <PageShell
        eyebrow="Registration"
        title="Create your student account"
        description="We are loading class options for the form."
      >
        <LoadingState label="Loading registration form…" />
      </PageShell>
    );
  }

  if (classesStatus === 'error') {
    return (
      <PageShell
        eyebrow="Registration"
        title="Create your student account"
        description="The registration form could not load completely."
      >
        <ErrorState description={classesError} onRetry={loadClasses} />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Registration"
      title="Create your student account"
      description="Fill in your details once. After login you will see your student menu and account page."
    >
      <Card className="mx-auto max-w-2xl">
        {error ? (
          <Alert type="error" title="Registration failed" onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        ) : null}

        {classes.length === 0 ? (
          <Alert type="info" title="No classes available" className="mb-4">
            Class options are empty right now. Please try again later or contact support on WhatsApp.
          </Alert>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                required
                error={fieldErrors.fullName}
                placeholder="As on school records"
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
                placeholder="student@email.com"
                autoComplete="email"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="School name (optional)"
                name="schoolName"
                value={form.schoolName}
                onChange={updateField}
                placeholder="Your school"
              />
              <Input
                label="Roll number (optional)"
                name="rollNumber"
                value={form.rollNumber}
                onChange={updateField}
                placeholder="School roll no."
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
              Create account
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-ink-900/65">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-lagoon-700 hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-900/55">
          Parent?{' '}
          <Link to="/parent/login" className="font-semibold text-lagoon-700 hover:underline">
            Parent login
          </Link>
          {' · '}
          Educator?{' '}
          <Link to="/educator/register" className="font-semibold text-lagoon-700 hover:underline">
            Educator registration
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
