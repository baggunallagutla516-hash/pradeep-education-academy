import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { getErrorMessage } from '../utils/errors';
import { getPasswordResetRole } from '../constants/passwordReset';
import { PageShell } from '../components/layout/PageShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function VerifyResetOtpPage({ role = 'student' }) {
  const config = getPasswordResetRole(role);
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail =
    location.state?.email || sessionStorage.getItem(config.emailKey) || '';

  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    initialEmail ? `OTP sent to ${initialEmail}. Enter the 6-digit code from your email.` : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate(config.basePath, { replace: true });
    }
  }, [email, navigate, config.basePath]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const code = otp.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(code)) {
      setFieldError('Enter the 6-digit OTP from your email.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await config.api.verifyResetOtp({ email, otp: code });
      const resetToken = data.data.resetToken;
      sessionStorage.setItem(config.emailKey, data.data.email || email);
      sessionStorage.setItem(config.tokenKey, resetToken);
      navigate(`${config.basePath}/reset`, {
        state: { email: data.data.email || email, resetToken },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'OTP validation failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError('');
    setResending(true);
    try {
      await config.api.forgotPassword({ email });
      setInfo(`A new OTP was sent to ${email}.`);
      setOtp('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not resend OTP. Please try again.'));
    } finally {
      setResending(false);
    }
  }

  if (!email) return null;

  return (
    <PageShell
      eyebrow={`${config.label} · Verify OTP`}
      title="Enter email code"
      description="Check your inbox for the 6-digit password reset code."
    >
      <div className="mx-auto max-w-md">
        <Card>
          {info ? (
            <Alert type="info" title="Check your email" className="mb-4">
              {info}
            </Alert>
          ) : null}

          {error ? (
            <Alert type="error" title="Validation failed" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="OTP"
              name="otp"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
                setFieldError('');
              }}
              required
              error={fieldError}
              placeholder="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <Button type="submit" loading={submitting} fullWidth>
              <ShieldCheck className="h-4 w-4" />
              Verify OTP
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-lagoon-700 hover:underline disabled:opacity-60"
            >
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
            <Link to={config.basePath} className="font-semibold text-ink-900/55 hover:underline">
              Change email
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
