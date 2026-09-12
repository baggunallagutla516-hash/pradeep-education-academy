import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useParentAuth } from '../../context/ParentAuthContext';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';

export function ParentLoginPage() {
  const { login } = useParentAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/parent/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required.';
    if (!form.password) next.password = 'Password is required.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Parent login failed. Please check your details.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Parent login"
      title="Welcome, parent"
      description="Sign in to view your linked children and their learning updates."
    >
      <div className="mx-auto max-w-md">
        <Card>
          {error ? (
            <Alert type="error" title="Login failed" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={updateField}
              required
              error={fieldErrors.password}
              placeholder="Your password"
              autoComplete="current-password"
            />
            <div className="-mt-1 text-right">
              <Link
                to="/parent/forgot-password"
                className="text-sm font-semibold text-lagoon-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={submitting} fullWidth>
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-900/65">
            New here?{' '}
            <Link to="/parent/register" className="font-semibold text-lagoon-700 hover:underline">
              Create a parent account
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-ink-900/55">
            Student instead?{' '}
            <Link to="/login" className="font-semibold text-lagoon-700 hover:underline">
              Student login
            </Link>
            {' · '}
            Educator?{' '}
            <Link to="/educator/login" className="font-semibold text-lagoon-700 hover:underline">
              Educator login
            </Link>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
