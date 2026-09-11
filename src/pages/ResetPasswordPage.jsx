import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { getErrorMessage } from '../utils/errors';
import { getPasswordResetRole } from '../constants/passwordReset';
import { PageShell } from '../components/layout/PageShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PasswordInput } from '../components/ui/PasswordInput';

export function ResetPasswordPage({ role = 'student' }) {
  const config = getPasswordResetRole(role);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || sessionStorage.getItem(config.emailKey) || '';
  const resetToken =
    location.state?.resetToken || sessionStorage.getItem(config.tokenKey) || '';

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email || !resetToken) {
      navigate(config.basePath, { replace: true });
    }
  }, [email, resetToken, navigate, config.basePath]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.newPassword || form.newPassword.length < 8) {
      next.newPassword = 'Password must be at least 8 characters.';
    }
    if (form.newPassword !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data } = await config.api.resetPassword({
        email,
        resetToken,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      sessionStorage.removeItem(config.emailKey);
      sessionStorage.removeItem(config.tokenKey);
      setSuccess(data.message || 'Password updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset password. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!email || !resetToken) return null;

  if (success) {
    return (
      <PageShell
        eyebrow="Password updated"
        title="You can log in now"
        description={`Your new ${config.label.toLowerCase()} password is ready.`}
      >
        <div className="mx-auto max-w-md">
          <Card>
            <Alert type="success" title="Password reset successful">
              {success}
            </Alert>
            <Link to={config.loginPath} className="mt-5 block">
              <Button fullWidth>Go to login</Button>
            </Link>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={`${config.label} · New password`}
      title="Set a new password"
      description={`Choose a strong password for your ${config.label.toLowerCase()} account.`}
    >
      <div className="mx-auto max-w-md">
        <Card>
          {error ? (
            <Alert type="error" title="Reset failed" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <PasswordInput
              label="New password"
              name="newPassword"
              value={form.newPassword}
              onChange={updateField}
              required
              error={fieldErrors.newPassword}
              hint="At least 8 characters"
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm new password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              required
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
            <Button type="submit" loading={submitting} fullWidth>
              <KeyRound className="h-4 w-4" />
              Save new password
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-900/65">
            <Link to={config.loginPath} className="font-semibold text-lagoon-700 hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
