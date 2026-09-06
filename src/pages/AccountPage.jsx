import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { SITE } from '../constants/site';
import { getErrorMessage } from '../utils/errors';
import { classLabel } from '../utils/classLabel';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';

function DetailRow({ label, value }) {
  const display = value && String(value).trim() ? value : null;

  return (
    <div className="grid gap-1 border-b border-ink-900/8 py-3 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-ink-900/55">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">
        {display || <span className="text-ink-900/40">Not provided</span>}
      </dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export function AccountPage() {
  const { student } = useAuth();
  const [parents, setParents] = useState([]);
  const [parentsStatus, setParentsStatus] = useState('loading');
  const [parentsError, setParentsError] = useState('');

  const loadParents = useCallback(async () => {
    setParentsStatus('loading');
    setParentsError('');
    try {
      const { data } = await authApi.parents();
      setParents(data.data.parents || []);
      setParentsStatus('ready');
    } catch (err) {
      setParentsStatus('error');
      setParentsError(getErrorMessage(err, 'Could not load linked parents.'));
    }
  }, []);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  if (!student) {
    return (
      <PageShell embedded title="My account" description="Your student profile details.">
        <EmptyState
          icon={UserRound}
          title="No account details available"
          description="We could not find student information for this session. Try logging in again."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Account"
      title="My account"
      description="These details were saved during registration and will appear on results and certificates later."
      actions={<Badge tone="lagoon">{classLabel(student)}</Badge>}
    >
      <Alert type="info" title="Need a change?" className="mb-4">
        Profile details cannot be edited here. Contact the academy admin to update your information
        via{' '}
        <a
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lagoon-700 underline underline-offset-2"
        >
          WhatsApp
        </a>
        ,{' '}
        <a
          href={`mailto:${SITE.supportEmail}`}
          className="font-semibold text-lagoon-700 underline underline-offset-2"
        >
          {SITE.supportEmail}
        </a>
        , or the{' '}
        <Link to="/contact" className="font-semibold text-lagoon-700 underline underline-offset-2">
          contact form
        </Link>
        .
      </Alert>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
            <UserRound className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-ink-900">{student.fullName}</h2>
            <p className="truncate text-sm text-ink-900/55">{student.email}</p>
          </div>
        </div>

        <dl>
          <DetailRow label="Full name" value={student.fullName} />
          <DetailRow label="Email" value={student.email} />
          <DetailRow label="Phone" value={student.phone} />
          <DetailRow label="Class" value={classLabel(student)} />
          <DetailRow label="School" value={student.schoolName} />
          <DetailRow label="Roll number" value={student.rollNumber} />
          <DetailRow label="Member since" value={formatDate(student.createdAt)} />
          <DetailRow label="Last login" value={formatDate(student.lastLoginAt)} />
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-bold text-ink-900">Linked parents</h2>
        <p className="mt-1 text-sm text-ink-900/55">
          Parents are linked by the academy admin. Contact them if a parent is missing.
        </p>

        {parentsStatus === 'loading' ? (
          <div className="mt-4">
            <LoadingState label="Loading parents…" />
          </div>
        ) : null}

        {parentsStatus === 'error' ? (
          <Alert type="error" title="Could not load parents" className="mt-4">
            {parentsError}
          </Alert>
        ) : null}

        {parentsStatus === 'ready' && parents.length === 0 ? (
          <p className="mt-4 text-sm text-ink-900/50">No parents linked yet.</p>
        ) : null}

        {parentsStatus === 'ready' && parents.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {parents.map((parent) => (
              <li
                key={parent.id}
                className="rounded-2xl border border-ink-900/8 bg-sand-50/80 px-4 py-3"
              >
                <p className="font-semibold text-ink-900">{parent.fullName}</p>
                <p className="truncate text-sm text-ink-900/55">
                  {parent.email} · {parent.phone}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </PageShell>
  );
}
