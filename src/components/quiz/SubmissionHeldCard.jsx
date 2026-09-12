import { Clock3 } from 'lucide-react';
import { formatDate } from '../../utils/quizFormat';
import { Card } from '../ui/Card';
import { ConfettiBurst } from '../ui/ConfettiBurst';

/**
 * Post-submit “results held” panel with thank-you copy and a short confetti burst.
 */
export function SubmissionHeldCard({
  submittedAt,
  activityLabel = 'attempt',
  celebrate = true,
}) {
  return (
    <>
      <ConfettiBurst active={celebrate} />
      <Card className="relative mx-auto max-w-xl overflow-hidden text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
          <Clock3 className="h-7 w-7" />
        </div>
        <p className="font-display text-2xl font-extrabold text-lagoon-800">
          Thank you for attempting!
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-900/65">
          Your {activityLabel} was submitted
          {submittedAt ? ` on ${formatDate(submittedAt)}` : ''}. Great work completing it.
        </p>
        <h2 className="mt-5 font-display text-xl font-bold text-ink-900">Results on hold</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-900/60">
          The academy will release results soon. You will get an email when they are available —
          then open them here on the site.
        </p>
        <p className="mt-4 text-xs text-ink-900/45">Scores are not shared by email.</p>
      </Card>
    </>
  );
}
