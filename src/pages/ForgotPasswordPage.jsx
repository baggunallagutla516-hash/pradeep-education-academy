import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { getErrorMessage } from '../utils/errors';
import { getPasswordResetRole } from '../constants/passwordReset';
import { PageShell } from '../components/layout/PageShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function ForgotPasswordPage({ role = 'student' }) {
  const config = getPasswordResetRole(role);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await config.api.forgotPassword({ email: trimmed });
      sessionStorage.setItem(config.emailKey, trimmed.toLowerCase());
      navigate(`${config.basePath}/verify`, { state: { email: trimmed.toLowerCase() } });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send OTP. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow={`${config.label} · Forgot password`}
      title="Reset with email OTP"
      description={`Enter the email on your ${config.label.toLowerCase()} account. We will send a 6-digit code if it matches.`}
    >
      <div className="mx-auto max-w-md">
        <Card>
          {error ? (
            <Alert type="error" title="Could not send OTP" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldError('');
              }}
              required
              error={fieldError}
              placeholder={`${config.label.toLowerCase()}@email.com`}
              autoComplete="email"
            />
            <Button type="submit" loading={submitting} fullWidth>
              <Mail className="h-4 w-4" />
              Send OTP
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-900/65">
            Remembered it?{' '}
            <Link to={config.loginPath} className="font-semibold text-lagoon-700 hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
