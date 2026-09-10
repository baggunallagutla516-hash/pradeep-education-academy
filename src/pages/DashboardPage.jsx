import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FileText,
  PenLine,
  ScrollText,
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
  {
    title: 'Unit test',
    description: 'Download the question paper for each unit of your class.',
    icon: PenLine,
    to: '/unit-tests',
  },
  {
    title: 'C.E.T.',
    description: 'Download Chapter End Test question papers for your class.',
    icon: ScrollText,
    to: '/cets',
  },
  {
    title: 'Online Assessments',
    description: 'Timed fullscreen online tests with single and multi-select questions.',
    icon: ClipboardCheck,
    to: '/assessments',
  },
  {
    title: 'D.P.P.',
    description: 'Daily practice problems. Attempt them online and see your score instantly.',
    icon: ClipboardList,
    to: '/dpps',
  },
  {
    title: 'Slip test',
    description: 'Chapter and topic tests. Attempt them online and see your score instantly.',
    icon: FileText,
    to: '/slip-tests',
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
      <section>
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
    </PageShell>
  );
}
