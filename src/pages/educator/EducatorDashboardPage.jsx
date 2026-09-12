import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEducatorAuth } from '../../context/EducatorAuthContext';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const ready = [
  {
    title: 'WORK SHEETS',
    description: 'Download question papers, slides, and study resources for every class.',
    emoji: '📚',
    to: '/educator/worksheets',
  },
  {
    title: 'EXAMS',
    description: 'Download exam question papers published for every class.',
    emoji: '✏️',
    to: '/educator/unit-tests',
  },
  {
    title: 'C.E.T.',
    description: 'Download Chapter End Test papers for every class.',
    emoji: '📖',
    to: '/educator/cets',
  },
  {
    title: 'ONLINE ASSESSMENTS',
    description: 'Attempt timed online assessments for every class, like a student.',
    emoji: '⏱️',
    to: '/educator/assessments',
  },
  {
    title: 'D.P.P.',
    description: 'Attempt daily practice problems online and see your score when released.',
    emoji: '🎯',
    to: '/educator/dpps',
  },
  {
    title: 'QUIZ',
    description: 'Open and attempt quizzes for every login.',
    emoji: '❓',
    to: '/educator/quizzes',
  },
  {
    title: 'SLIP TESTS',
    description: 'Attempt chapter and topic slip tests for every class.',
    emoji: '📝',
    to: '/educator/slip-tests',
  },
];

export function EducatorDashboardPage() {
  const { educator } = useEducatorAuth();

  return (
    <PageShell
      embedded
      eyebrow="Educator"
      title={`Hello, ${educator?.fullName?.split(' ')[0] || 'teacher'}`}
      description="Download papers and attempt assessments across all classes — the same experience as students."
    >
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-ink-900">
            Available now
          </h2>
          <p className="mt-1 text-sm text-ink-900/60">
            All classes. Filter inside each section when you need a shorter list.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ready.map((item) => (
            <Link key={item.title} to={item.to} className="group block">
              <Card className="h-full transition group-hover:-translate-y-1 group-hover:border-lagoon-300 group-hover:shadow-lift">
                <span
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lagoon-100 to-ember-400/20 text-2xl transition group-hover:scale-110"
                  aria-hidden
                >
                  {item.emoji}
                </span>
                <div className="mb-2">
                  <Badge tone="lagoon">Ready</Badge>
                </div>
                <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-lagoon-700">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
