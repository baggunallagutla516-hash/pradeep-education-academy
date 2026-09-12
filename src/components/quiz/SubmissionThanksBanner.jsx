import { PartyPopper } from 'lucide-react';
import { Card } from '../ui/Card';
import { ConfettiBurst } from '../ui/ConfettiBurst';

/**
 * Shared post-submit thank-you banner used when scores are already visible.
 */
export function SubmissionThanksBanner({
  celebrate = true,
  activityLabel = 'attempt',
}) {
  if (!celebrate) return null;

  return (
    <>
      <ConfettiBurst active />
      <Card className="relative mx-auto mb-6 max-w-xl overflow-hidden text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
          <PartyPopper className="h-6 w-6" />
        </div>
        <p className="font-display text-2xl font-extrabold text-lagoon-800">
          Thank you for attempting!
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-900/65">
          Your {activityLabel} was submitted successfully. Great work completing it.
        </p>
      </Card>
    </>
  );
}
