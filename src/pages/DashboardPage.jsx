import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { classLabel } from '../utils/classLabel';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const ready = [
  {
    title: 'WORK SHEETS',
    description: 'Download question papers, slides, and study resources for your class.',
    emoji: '📚',
    to: '/worksheets',
  },
  {
    title: 'EXAMS',
    description: 'Download the question paper for each exam of your class.',
    emoji: '✏️',
    to: '/unit-tests',
  },
  {
    title: 'C.E.T.',
    description: 'Download Chapter End Test question papers for your class.',
    emoji: '📖',
    to: '/cets',
  },
  {
    title: 'ONLINE ASSESSMENTS',
    description: 'Timed fullscreen online tests with single and multi-select questions.',
    emoji: '⏱️',
    to: '/assessments',
  },
  {
    title: 'D.P.P.',
    description: 'Daily practice problems. Attempt them online and see your score instantly.',
    emoji: '🎯',
    to: '/dpps',
  },
  {
    title: 'QUIZ',
    description: 'Open quizzes for every student. Single and multi-select questions.',
    emoji: '❓',
    to: '/quizzes',
  },
  {
    title: 'SLIP TESTS',
    description: 'Chapter and topic tests. Attempt them online and see your score instantly.',
    emoji: '📝',
    to: '/slip-tests',
  },
];

export function DashboardPage() {
  const { student } = useAuth();
  const firstName = student?.fullName?.split(' ')[0] || 'student';

  return (
    <PageShell
      embedded
      eyebrow="🏠 Dashboard"
      title={`Hello, ${firstName}! 👋`}
      description="You are logged in. Open work sheets for your class, practice online, and keep growing."
      actions={<Badge>{classLabel(student) || 'Student'}</Badge>}
    >
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-ink-900">
              Available now 🎒
            </h2>
            <p className="mt-1 text-sm text-ink-900/60">
              Resources shared by your teacher for {classLabel(student) || 'your class'}.
            </p>
          </div>
          <p className="rounded-full bg-ember-500/10 px-3 py-1 text-xs font-semibold text-ember-700">
            Keep learning — you have got this 💪
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
