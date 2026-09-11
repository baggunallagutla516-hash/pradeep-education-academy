import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../../components/layout/PageShell';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/admin';

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
      setError(getErrorMessage(err, 'Admin login failed.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Admin login"
      description="Sign in with your admin account. This is separate from student login."
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
              autoComplete="username"
            />
            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={updateField}
              required
              error={fieldErrors.password}
              autoComplete="current-password"
            />
            <div className="-mt-1 text-right">
              <Link
                to="/admin/forgot-password"
                className="text-sm font-semibold text-lagoon-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={submitting} fullWidth>
              <Shield className="h-4 w-4" />
              Sign in as admin
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
