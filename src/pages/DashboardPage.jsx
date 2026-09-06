import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FileText,
  GraduationCap,
  Laptop,
  MonitorOff,
  PenLine,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { classLabel } from '../utils/classLabel';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const ready = [
  {
    title: 'Work sheets',
    description: 'Download question papers, slides, and study resources for your class.',
    icon: FileStack,
    to: '/worksheets',
  },
];

const upcoming = [
  {
    title: 'Unit test',
    description: 'Chapter-wise unit tests with marks and feedback.',
    icon: PenLine,
  },
  {
    title: 'D.P.P.',
    description: 'Daily practice problems assigned for regular revision.',
    icon: ClipboardList,
  },
  {
    title: 'Slip test',
    description: 'Short classroom slip tests and quick score updates.',
    icon: FileText,
  },
  {
    title: 'Assessments',
    description: 'Periodic assessments to track subject-wise progress.',
    icon: ClipboardCheck,
  },
  {
    title: 'C.E.T',
    description: 'Common entrance test style papers and practice sets.',
    icon: GraduationCap,
  },
  {
    title: 'Online exams',
    description: 'Attempt timed exams online and view auto-graded scores.',
    icon: Laptop,
  },
  {
    title: 'Offline exams',
    description: 'Schedules and materials for centre-based offline exams.',
    icon: MonitorOff,
  },
  {
    title: 'Results',
    description: 'Exam results, ranks, and performance summaries.',
    icon: Trophy,
  },
];

export function DashboardPage() {
  const { student } = useAuth();

  return (
    <PageShell
      embedded
      eyebrow="Dashboard"
      title={`Hello, ${student?.fullName?.split(' ')[0] || 'student'}`}
      description="You are logged in. Open work sheets for your class, or check back as more tools unlock."
      actions={<Badge>{classLabel(student) || 'Student'}</Badge>}
    >
      <section className="mb-10">
        <h2 className="mb-2 font-display text-xl font-bold text-ink-900">Available now</h2>
        <p className="mb-4 text-sm text-ink-900/60">
          Resources shared by your teacher for {classLabel(student) || 'your class'}.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ready.map((item) => (
            <Link key={item.title} to={item.to} className="group block">
              <Card className="h-full transition group-hover:border-lagoon-300 group-hover:shadow-md">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="mb-2">
                  <Badge tone="lagoon">Ready</Badge>
                </div>
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
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

      <section>
        <h2 className="mb-2 font-display text-xl font-bold text-ink-900">Coming in later stages</h2>
        <p className="mb-4 text-sm text-ink-900/60">
          These areas are planned next. They are listed for clarity — not clickable until ready.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((item) => (
            <Card key={item.title} className="border-dashed bg-white/55">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900/5 text-ink-800">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="mb-2">
                <Badge tone="ink">Upcoming</Badge>
              </div>
              <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
