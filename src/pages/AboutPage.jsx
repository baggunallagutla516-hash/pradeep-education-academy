import { Link } from 'react-router-dom';
import { SITE } from '../constants/site';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const pillars = [
  {
    title: 'Clear teaching',
    body: 'Lessons and practice material structured so students know what to do next.',
  },
  {
    title: 'Account-first learning',
    body: 'Your registration details follow you into results, certificates, and progress sheets.',
  },
  {
    title: 'Direct support',
    body: `Reach ${SITE.name} instantly on WhatsApp at ${SITE.whatsappNumber} whenever you need help.`,
  },
];

export function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title={`About ${SITE.name}`}
      description="A focused learning portal for school students — registration, study updates, exams, worksheets, and personal results in one place."
      actions={
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ember">Chat on WhatsApp</Button>
        </a>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="font-display text-2xl font-bold text-ink-900">Why this portal exists</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-900/70">
            Students deserve a calm, reliable place to study and track progress. This platform is
            being built stage by stage — starting with secure student accounts — so every future
            feature (posts, files, exams, certificates) sits on a solid foundation.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-900/70">
            Whether you are preparing for school exams or revising with worksheets, your account
            keeps everything connected: who you are, what you attempt, and how you improve.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register">
              <Button>Create student account</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary">Contact us</Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-4">
          {pillars.map((item) => (
            <Card key={item.title} className="bg-lagoon-50/70">
              <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-900/65">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
