import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEducatorAuth } from '../context/EducatorAuthContext';
import { contentApi } from '../api/adminApi';
import { SITE } from '../constants/site';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { VisitorCounter } from '../components/VisitorCounter';
import { Card } from '../components/ui/Card';

const whatYouGet = [
  {
    emoji: '📄',
    title: 'WORK SHEETS READY',
    body: 'Question papers, slides, and study resources for your class.',
  },
  {
    emoji: '🧠',
    title: 'PRACTICE & EXAMS',
    body: 'Exams, chapter end tests, daily practice problems, and slip tests.',
  },
  {
    emoji: '✨',
    title: 'YOUR OWN SPACE',
    body: 'Account details, progress, and certificates stay with you.',
  },
];

const readyFeatures = [
  {
    title: 'WORK SHEETS',
    description: 'Download question papers, slides, and study resources for your class.',
    emoji: '📚',
    to: '/worksheets',
    educatorTo: '/educator/worksheets',
  },
  {
    title: 'EXAMS',
    description: 'Download the question paper for each exam of your class.',
    emoji: '✏️',
    to: '/unit-tests',
    educatorTo: '/educator/unit-tests',
  },
  {
    title: 'C.E.T.',
    description: 'Download Chapter End Test question papers for your class.',
    emoji: '📖',
    to: '/cets',
    educatorTo: '/educator/cets',
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

function NewsUpdates({ items }) {
  const entries = (items || [])
    .map((n) => ({
      id: n.id,
      text: String(n.text || '').trim(),
      link: String(n.link || '').trim(),
    }))
    .filter((n) => n.text);

  if (!entries.length) return null;

  return (
    <section className="border-b border-ink-900/8 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember-600">News</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">Latest from the academy</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-900/65">
            Notices and updates for students and parents. Click an item to open its page.
          </p>
        </div>

        <ul className="mt-8 max-w-3xl space-y-4 border-l-2 border-ember-500/35 pl-5">
          {entries.map((item) => (
            <li key={item.id} className="text-base leading-relaxed text-ink-800">
              {item.link ? (
                <Link
                  to={item.link}
                  className="font-medium text-lagoon-800 underline-offset-2 transition hover:text-lagoon-600 hover:underline"
                >
                  {item.text}
                </Link>
              ) : (
                item.text
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomePage() {
  const { isAuthenticated, student } = useAuth();
  const { isAuthenticated: isEducator } = useEducatorAuth();
  const [news, setNews] = useState([]);

  function featureLink(item) {
    if (isAuthenticated) return item.to;
    if (isEducator && item.educatorTo) return item.educatorTo;
    return '/register';
  }

  function featureCta(item) {
    if (isAuthenticated || (isEducator && item.educatorTo)) return 'Open';
    return 'Register to open';
  }

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
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#e8f6f1_0%,#f7f3ee_42%,#fff4e8_72%,#eef7fb_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_18%_22%,rgba(20,115,97,0.2),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(232,133,47,0.18),transparent_32%),radial-gradient(circle_at_70%_78%,rgba(56,140,200,0.12),transparent_36%)]" />
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-lagoon-400/25 blur-3xl animate-glow-pulse" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-ember-500/20 blur-3xl animate-glow-pulse anim-delay-3" />

        <span
          className="pointer-events-none absolute left-[8%] top-[18%] select-none text-3xl opacity-70 animate-float sm:text-4xl"
          aria-hidden
        >
          🌟
        </span>
        <span
          className="pointer-events-none absolute right-[12%] top-[22%] select-none text-3xl opacity-70 animate-float anim-delay-2 sm:text-4xl"
          aria-hidden
        >
          🚀
        </span>

        <div className="relative mx-auto grid min-h-[min(88vh,52rem)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="animate-soft-rise text-xs font-semibold uppercase tracking-[0.2em] text-ember-600">
              🎓 Student learning hub
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="inline-block animate-soft-rise anim-delay-2">
                <span className="title-mix animate-gradient-shift">{SITE.name}</span>
              </span>
            </h1>
            <p className="mt-5 max-w-xl animate-soft-rise anim-delay-3 text-lg leading-relaxed text-ink-900/70">
              {SITE.tagline} Register once, then learn from one friendly student space — worksheets,
              practice, and tests in one place.
            </p>

            <div className="relative mt-8 animate-soft-rise anim-delay-4">
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

          <div className="relative flex justify-center lg:justify-end">
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
              <div className="h-[82%] w-[82%] rounded-full bg-[radial-gradient(circle,#fff8eb_0%,#f0e0b8_42%,rgba(212,175,55,0.28)_68%,transparent_78%)] blur-[2px]" />
              <div className="absolute h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.28)_0%,transparent_70%)] blur-2xl" />
            </div>
            <img
              src="/logo.png"
              alt={SITE.name}
              className="relative w-full max-w-[22rem] animate-soft-rise anim-delay-3 rounded-full object-contain drop-shadow-[0_28px_48px_rgba(15,40,55,0.22)] sm:max-w-[26rem] lg:max-w-[30rem]"
            />
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
              Built for curious, confident students
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-900/65">
              Start with worksheets today. Practice, exams, and results unlock as the academy grows.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {whatYouGet.map((item, index) => (
              <div
                key={item.title}
                className={`group animate-soft-rise rounded-3xl border border-ink-900/6 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:border-lagoon-200 hover:shadow-lift ${
                  index === 0 ? 'anim-delay-2' : index === 1 ? 'anim-delay-3' : 'anim-delay-4'
                }`}
              >
                <span
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lagoon-100 text-3xl transition group-hover:scale-110"
                  aria-hidden
                >
                  {item.emoji}
                </span>
                <h3 className="font-display text-xl font-extrabold uppercase tracking-wide text-ink-900">
                  {item.title}
                </h3>
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
            <h2 className="mt-1 font-display text-2xl font-bold text-ink-900">
              Available now 🎒
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-900/60">
              Start with work sheets after you register. More tools unlock in later stages.
            </p>
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {readyFeatures.map((item) => (
              <Card
                key={item.title}
                className="group h-full bg-white/90 transition hover:-translate-y-1 hover:border-lagoon-300 hover:shadow-lift"
              >
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
                <Link to={featureLink(item)} className="mt-4 inline-block">
                  <Button size="sm" variant="ember">
                    {featureCta(item)}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
