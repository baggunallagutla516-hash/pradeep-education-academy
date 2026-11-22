import { useEffect, useState } from 'react';
import { ExternalLink, Video } from 'lucide-react';
import { getErrorMessage } from '../../utils/errors';
import { PageShell } from '../layout/PageShell';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';

const PLATFORM_LABEL = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  other: 'Online class',
};

function formatWhen(value) {
  if (!value) return 'Time not set';
  try {
    return new Date(value).toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Time not set';
  }
}

function statusFor(scheduledAt) {
  if (!scheduledAt) return { label: 'Open', tone: 'lagoon' };
  const when = new Date(scheduledAt).getTime();
  if (Number.isNaN(when)) return { label: 'Open', tone: 'lagoon' };
  const diff = when - Date.now();
  if (diff > 30 * 60 * 1000) return { label: 'Upcoming', tone: 'ink' };
  if (diff > -2 * 60 * 60 * 1000) return { label: 'Join now', tone: 'lagoon' };
  return { label: 'Past', tone: 'ember' };
}

/**
 * Shared list page for students, educators (staff), and parents.
 * Opens the Google Meet / Zoom link in a new tab.
 */
export function OnlineClassesAttendPage({
  listApi,
  eyebrow = 'Online classes',
  title = 'Online classes',
  description = 'Join live classes on Google Meet or Zoom. Tap Join to open the meeting link.',
}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await listApi();
      setItems(data.data.onlineClasses || []);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load online classes.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell embedded eyebrow={eyebrow} title={title} description={description}>
      {status === 'loading' ? <LoadingState label="Loading online classes…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && items.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="When a Meet or Zoom link is posted, it will appear here so you can join."
        />
      ) : null}

      {status === 'ready' && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const platform = PLATFORM_LABEL[item.platform] || PLATFORM_LABEL.other;
            const whenStatus = statusFor(item.scheduledAt);
            return (
              <Card
                key={item.id}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge tone="lagoon">{platform}</Badge>
                    <Badge tone={whenStatus.tone}>{whenStatus.label}</Badge>
                  </div>
                  <h2 className="font-display text-lg font-extrabold text-ink-900">{item.title}</h2>
                  <p className="mt-1 text-sm text-ink-900/60">{formatWhen(item.scheduledAt)}</p>
                  {item.description ? (
                    <p className="mt-2 text-sm text-ink-800/80">{item.description}</p>
                  ) : null}
                </div>
                <a
                  href={item.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-lagoon-600 px-5 text-sm font-semibold text-white shadow-lift transition hover:bg-lagoon-700"
                >
                  <Video className="h-4 w-4" />
                  Join
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </Card>
            );
          })}
        </div>
      ) : null}
    </PageShell>
  );
}
