import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FileText,
  Laptop,
  MonitorOff,
  PenLine,
  ScrollText,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { contentApi } from '../api/adminApi';
import { SITE } from '../constants/site';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { VisitorCounter } from '../components/VisitorCounter';
import { Card } from '../components/ui/Card';

const whatYouGet = [
  {
    icon: FileStack,
    title: 'Work sheets ready',
    body: 'Question papers, slides, and study resources for your class.',
  },
  {
    icon: BookOpenCheck,
    title: 'Practice & exams',
    body: 'Unit tests, chapter end tests, daily practice problems, and slip tests.',
  },
  {
    icon: Sparkles,
    title: 'Your own space',
    body: 'Account details, progress, and certificates stay with you.',
  },
];

const readyFeatures = [
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

const upcomingFeatures = [
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

function NewsUpdates({ items }) {
  const entries = (items || [])
    .map((n) => ({ id: n.id, text: String(n.text || '').trim() }))
    .filter((n) => n.text);

  if (!entries.length) return null;

  return (
    <section className="border-b border-ink-900/8 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember-600">News</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">Latest from the academy</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-900/65">
            Notices and updates for students and parents.
          </p>
        </div>

        <ul className="mt-8 max-w-3xl space-y-4 border-l-2 border-ember-500/35 pl-5">
          {entries.map((item) => (
            <li key={item.id} className="text-base leading-relaxed text-ink-800">
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomePage() {
  const { isAuthenticated, student } = useAuth();
  const [news, setNews] = useState([]);

  useEffect(() => {
    let active = true;
    contentApi
      .news()
      .then((newsRes) => {
        if (!active) return;
        setNews(newsRes.data.data.news || []);
      })
      .catch(() => {
        if (!active) return;
        setNews([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="relative min-h-[min(88vh,52rem)] overflow-hidden border-b border-ink-900/8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#eef6f3_0%,#f7f3ee_48%,#f3ebe3_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_22%,rgba(20,115,97,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(232,133,47,0.16),transparent_32%),radial-gradient(circle_at_70%_78%,rgba(20,115,97,0.1),transparent_36%)]" />
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-lagoon-400/25 blur-3xl animate-glow-pulse" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-ember-500/20 blur-3xl animate-glow-pulse anim-delay-3" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,243,238,0)_0%,rgba(20,115,97,0.06)_40%,rgba(232,133,47,0.1)_100%)]" />
          <div className="absolute right-[12%] top-[18%] h-40 w-40 rounded-[2rem] border border-lagoon-600/15 bg-white/40 shadow-soft backdrop-blur-sm animate-float" />
          <div className="absolute right-[28%] top-[42%] h-28 w-28 rounded-full border border-ember-500/20 bg-ember-500/10 animate-float anim-delay-3" />
          <div className="absolute bottom-[16%] right-[18%] h-36 w-52 rounded-[1.75rem] border border-ink-900/8 bg-white/50 shadow-lift backdrop-blur-sm animate-soft-rise anim-delay-4" />
        </div>

        <div className="relative mx-auto flex min-h-[min(88vh,52rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="animate-soft-rise text-xs font-semibold uppercase tracking-[0.2em] text-ember-600">
              Guided learning
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="inline-block animate-soft-rise anim-delay-2">
                <span className="title-mix animate-gradient-shift">{SITE.name}</span>
              </span>
            </h1>
            <p className="mt-5 max-w-xl animate-soft-rise anim-delay-3 text-lg leading-relaxed text-ink-900/70">
              {SITE.tagline} Register once, then learn from one calm student space.
            </p>

            <div className="mt-8 animate-soft-rise anim-delay-4">
              {isAuthenticated ? (
                <div className="flex flex-wrap gap-3">
                  <Link to="/dashboard">
                    <Button size="lg">
                      Go to dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/account">
                    <Button size="lg" variant="secondary">
                      View my account
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-3">
                    <Link to="/login">
                      <Button size="lg" variant="secondary">
                        Student login
                      </Button>
                    </Link>
                    <Link to="/parent/login">
                      <Button size="lg" variant="secondary">
                        Parent login
                      </Button>
                    </Link>
                    <Link to="/educator/login">
                      <Button size="lg" variant="secondary">
                        Educator login
                      </Button>
                    </Link>
                  </div>
                  <div>
                    <Link to="/register">
                      <Button size="lg" variant="ember">
                        Create student account
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-5 animate-soft-rise anim-delay-5 text-sm font-medium text-ink-900/60">
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-lagoon-700"
              >
                WhatsApp {SITE.whatsappNumber}
              </a>
            </p>

            {isAuthenticated ? (
              <p className="mt-4 animate-fade-in anim-delay-6 text-sm font-medium text-lagoon-800">
                Welcome back, {student?.fullName?.split(' ')[0]}. Your learning space is ready.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <NewsUpdates items={news} />

      <section className="border-b border-ink-900/8 bg-sand-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lagoon-700">
              What you get
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">
              Built for calm, steady progress
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-900/65">
              Start with worksheets today. Practice, exams, and results unlock as the academy grows.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {whatYouGet.map((item, index) => (
              <div
                key={item.title}
                className={`animate-soft-rise ${
                  index === 0 ? 'anim-delay-2' : index === 1 ? 'anim-delay-3' : 'anim-delay-4'
                }`}
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink-900/8 bg-[linear-gradient(180deg,rgba(232,133,47,0.08),rgba(245,248,247,0.95)_40%,rgba(20,115,97,0.06))]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <VisitorCounter />
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lagoon-700">
              Learning areas
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink-900">Available now</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-900/60">
              Start with work sheets after you register. More tools unlock in later stages.
            </p>
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {readyFeatures.map((item) => (
              <Card key={item.title} className="h-full bg-white/90">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-lagoon-100 text-lagoon-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="mb-2">
                  <Badge tone="lagoon">Ready</Badge>
                </div>
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{item.description}</p>
                <Link
                  to={isAuthenticated ? item.to : '/register'}
                  className="mt-4 inline-block"
                >
                  <Button size="sm" variant="ember">
                    {isAuthenticated ? 'Open' : 'Register to open'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          <div className="mb-4">
            <h2 className="font-display text-xl font-bold text-ink-900">Coming in later stages</h2>
            <p className="mt-2 text-sm text-ink-900/60">
              These areas are planned next. They are listed for clarity — not clickable until ready.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingFeatures.map((item) => (
              <Card key={item.title} className="border-dashed bg-white/70">
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
        </div>
      </section>
    </div>
  );
}
