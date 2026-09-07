import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { contactApi } from '../api/contactApi';
import { SITE } from '../constants/site';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = 'Please enter your name (at least 2 characters).';
    }
    const email = form.email.trim();
    if (!email) {
      next.email = 'A valid email is required so we can reply to you.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      next.email = 'Enter a valid email address (example: you@gmail.com).';
    }
    if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      next.phone = 'Phone must be a valid 10-digit Indian mobile number.';
    }
    if (!form.subject.trim()) {
      next.subject = 'Subject is required.';
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      next.message = 'Message must be at least 10 characters.';
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
      const { data } = await contactApi.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccess(data.message || 'Message sent successfully.');
      setForm(initialForm);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send your message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Contact"
      title="Let’s talk"
      description="Send a query through the form, or message directly on WhatsApp for a faster reply."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-ink-900/10 bg-ink-900 p-6 text-white shadow-soft">
          <h2 className="font-display text-2xl font-bold">Direct WhatsApp</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Prefer chatting? Reach {SITE.name} instantly on WhatsApp. Ideal for admission questions,
            class details, or quick doubts.
          </p>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1ebe5d]"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp {SITE.whatsappNumber}
          </a>
          <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-white/70">
            <p className="font-semibold text-white">Also available</p>
            <a className="mt-2 block hover:text-white" href={`mailto:${SITE.supportEmail}`}>
              {SITE.supportEmail}
            </a>
          </div>
        </div>

        <Card>
          <h2 className="font-display text-2xl font-bold text-ink-900">Send a query</h2>
          <p className="mt-2 text-sm text-ink-900/60">
            Use a valid email — the academy replies to that address. Your message is also stored in
            the admin Contact list.
          </p>

          {error ? (
            <Alert className="mt-4" type="error" title="Could not submit" onClose={() => setError('')}>
              {error}
            </Alert>
          ) : null}
          {success ? (
            <Alert
              className="mt-4"
              type="success"
              title="Message received"
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Your name"
                name="name"
                value={form.name}
                onChange={updateField}
                required
                error={fieldErrors.name}
                placeholder="Full name"
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
                placeholder="you@gmail.com"
                autoComplete="email"
                hint="Required — we reply to this address"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Phone (optional)"
                name="phone"
                value={form.phone}
                onChange={updateField}
                error={fieldErrors.phone}
                placeholder="10-digit mobile"
                inputMode="numeric"
                autoComplete="tel"
              />
              <Input
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={updateField}
                required
                error={fieldErrors.subject}
                placeholder="Admission / doubt / other"
              />
            </div>
            <Textarea
              label="Message"
              name="message"
              value={form.message}
              onChange={updateField}
              required
              error={fieldErrors.message}
              placeholder="Tell us how we can help…"
              hint="Minimum 10 characters"
            />
            <Button type="submit" loading={submitting} fullWidth className="sm:w-auto">
              <Send className="h-4 w-4" />
              Submit query
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
