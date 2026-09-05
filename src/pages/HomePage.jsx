import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  ClipboardList,
  FileStack,
  FileText,
  GraduationCap,
  Laptop,
  Megaphone,
  MonitorOff,
  PenLine,
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

const readyFeatures = [
  {
    title: 'Work sheets',
    description: 'Download question papers, slides, and study resources for your class.',
    icon: FileStack,
  },
];

const upcomingFeatures = [
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

function NewsTicker({ items }) {
  if (!items.length) return null;

  const line = items.map((n) => n.text).join('   •   ');

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-900/8 bg-lagoon-50/90 shadow-soft">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          <Megaphone className="h-3 w-3" aria-hidden />
          News
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="animate-[marquee_28s_linear_infinite] whitespace-nowrap text-sm font-medium text-ink-800">
            {line}
            <span className="mx-8 text-ink-900/20">·</span>
            {line}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
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
      <section className="relative overflow-hidden border-b border-ink-900/8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,115,97,0.12),transparent_45%),linear-gradient(225deg,rgba(232,133,47,0.14),transparent_40%)]" />
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-lagoon-400/20 blur-3xl animate-glow-pulse" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-ember-500/20 blur-3xl animate-glow-pulse anim-delay-3" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <div className="animate-soft-rise">
              <Badge tone="ember">Guided learning</Badge>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="inline-block animate-soft-rise">
                <span className="title-mix animate-gradient-shift">{SITE.name}</span>
              </span>
            </h1>
            <p className="mt-4 max-w-xl animate-soft-rise anim-delay-3 text-lg leading-relaxed text-ink-900/70">
              {SITE.tagline} Register once, then open work sheets and grow into practice tests,
              exams, and results from one calm dashboard.
            </p>
            <div className="mt-8 flex animate-soft-rise anim-delay-4 flex-wrap gap-3">
              {isAuthenticated ? (
                <>
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
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="ember">
                      Create student account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
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
                </>
              )}
            </div>
            <p className="mt-4 animate-soft-rise anim-delay-5 text-sm font-medium text-ink-900/65">
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-lagoon-700"
              >
                WhatsApp {SITE.whatsappNumber}
              </a>
            </p>
            <div className="mt-6 animate-soft-rise anim-delay-6">
              <VisitorCounter />
            </div>
            {isAuthenticated ? (
              <p className="mt-4 animate-fade-in anim-delay-6 text-sm font-medium text-lagoon-800">
                Welcome back, {student?.fullName?.split(' ')[0]}. Your learning space is ready.
              </p>
            ) : null}
          </div>

          <div className="relative animate-slide-in-right anim-delay-2">
            <div className="absolute -inset-4 rounded-[2rem] bg-lagoon-600/10 blur-2xl animate-glow-pulse" />
            <div className="relative animate-float overflow-hidden rounded-[2rem] border border-ink-900/8 bg-ink-900 p-6 text-white shadow-lift sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-ember-500/30 blur-2xl animate-glow-pulse" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                What you get
              </p>
              <ul className="relative mt-6 space-y-4">
                {[
                  {
                    icon: FileStack,
                    title: 'Work sheets ready',
                    body: 'Question papers, slides, and study resources for your class.',
                  },
                  {
                    icon: BookOpenCheck,
                    title: 'Practice & exams',
                    body: 'Unit tests, D.P.P., slip tests, and online exams as they unlock.',
                  },
                  {
                    icon: Sparkles,
                    title: 'Your own space',
                    body: 'Account details, progress, and certificates stay with you.',
                  },
                ].map((item, index) => (
                  <li
                    key={item.title}
                    className={`flex gap-3 rounded-2xl bg-white/5 p-3 transition duration-300 hover:bg-white/10 hover:translate-x-1 animate-soft-rise ${
                      index === 0
                        ? 'anim-delay-3'
                        : index === 1
                          ? 'anim-delay-4'
                          : 'anim-delay-5'
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon-500/20 text-lagoon-200">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-white/60">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-900/8 bg-[linear-gradient(180deg,rgba(232,133,47,0.08),rgba(245,248,247,0.95)_40%,rgba(20,115,97,0.06))]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <NewsTicker items={news} />
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
              <Link to={isAuthenticated ? '/worksheets' : '/register'} className="mt-4 inline-block">
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
