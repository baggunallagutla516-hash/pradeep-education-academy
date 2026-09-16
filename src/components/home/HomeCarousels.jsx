import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle, Trophy } from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

function QuizSlideCard({ slide, isLazy }) {
  const href = `/quizzes/${slide.quizId}`;
  const meta = [
    slide.questionCount != null ? `${slide.questionCount} Questions` : null,
    slide.difficulty || null,
    slide.category || null,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white shadow-soft transition hover:-translate-y-1 hover:border-lagoon-300 hover:shadow-lift"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-lagoon-100 via-sand-50 to-ember-400/20">
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt=""
            loading={isLazy ? 'lazy' : 'eager'}
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-lagoon-700/70">
            <HelpCircle className="h-14 w-14" strokeWidth={1.4} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent" />
        {slide.category ? (
          <span className="absolute left-3 top-3">
            <Badge tone="ember">{slide.category}</Badge>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ember-600">
          Featured quiz
        </p>
        <h3 className="mt-1 font-display text-xl font-extrabold text-ink-900 transition group-hover:text-lagoon-700">
          {slide.title}
        </h3>
        {slide.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-900/65">
            {slide.description}
          </p>
        ) : null}
        {meta ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-800/55">
            {meta}
          </p>
        ) : null}
        <span className="mt-5 inline-flex">
          <Button size="sm" variant="ember" className="pointer-events-none">
            {slide.ctaText || 'Attempt Quiz'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </span>
      </div>
    </Link>
  );
}

function TopperSlideCard({ slide, isLazy }) {
  const photo = slide.studentPhotoUrl || slide.imageUrl;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-gradient-to-b from-white to-lagoon-50/60 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative flex items-center justify-center bg-[linear-gradient(145deg,#147361_0%,#1F8F78_45%,#E8852F_100%)] px-5 pb-10 pt-6 text-white">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,#fff,transparent_35%),radial-gradient(circle_at_80%_30%,#fff,transparent_28%)]" />
        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
            {slide.badgeLabel || 'Quiz Topper'}
          </p>
          <div className="mx-auto mt-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white/80 bg-white/20 shadow-lg">
            {photo ? (
              <img
                src={photo}
                alt=""
                loading={isLazy ? 'lazy' : 'eager'}
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Trophy className="h-10 w-10 text-white/90" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative -mt-6 flex flex-1 flex-col px-5 pb-5 text-center">
        <div className="rounded-2xl border border-ink-900/8 bg-white px-4 py-4 shadow-soft">
          {slide.studentName ? (
            <h3 className="font-display text-lg font-extrabold text-ink-900">{slide.studentName}</h3>
          ) : (
            <h3 className="font-display text-lg font-extrabold text-ink-900">
              {slide.title}
            </h3>
          )}
          {slide.studentClassLabel ? (
            <p className="mt-1 text-sm font-medium text-ink-800/60">{slide.studentClassLabel}</p>
          ) : null}
          {slide.quizName ? (
            <p className="mt-3 text-sm font-semibold text-lagoon-700">{slide.quizName}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {slide.scoreDisplay ? (
              <Badge tone="lagoon">Score: {slide.scoreDisplay}</Badge>
            ) : null}
            {slide.percentage != null ? (
              <Badge tone="ember">{Math.round(slide.percentage)}%</Badge>
            ) : null}
            {slide.rank != null ? <Badge>Rank #{slide.rank}</Badge> : null}
          </div>
          {slide.description ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-900/60">{slide.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FeaturedQuizzesCarousel({ slides = [] }) {
  return (
    <section className="border-b border-ink-900/8 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember-600">
            Featured quizzes
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">
            Try a quiz today
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-900/65">
            Browse the latest quizzes. Anyone can view them — login is only needed to attempt
            and save your score.
          </p>
        </div>

        <ImageCarousel
          items={slides}
          ariaLabel="Featured quizzes"
          renderItem={(slide, _i, { isLazy }) => (
            <QuizSlideCard slide={slide} isLazy={isLazy} />
          )}
          emptyState={
            <div className="rounded-3xl border border-dashed border-ink-900/15 bg-sand-50 px-6 py-12 text-center">
              <p className="text-3xl" aria-hidden>
                📚
              </p>
              <h3 className="mt-3 font-display text-xl font-bold text-ink-900">
                New Quizzes Coming Soon!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-900/60">
                If you are a registered student, check back soon for exciting new quizzes.
              </p>
            </div>
          }
        />
      </div>
    </section>
  );
}

export function ToppersCarousel({ slides = [] }) {
  return (
    <section className="border-b border-ink-900/8 bg-[linear-gradient(180deg,rgba(20,115,97,0.06),rgba(245,248,247,0.98)_50%,rgba(232,133,47,0.07))]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lagoon-700">
              Toppers & achievements
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">
              Celebrating student excellence
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-900/65">
              Publicly approved achievements from recent quizzes — shared only when the academy
              chooses to celebrate them.
            </p>
          </div>
          {slides.length > 0 ? (
            <Link to="/toppers">
              <Button variant="secondary">
                View all toppers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </div>

        <ImageCarousel
          items={slides}
          ariaLabel="Quiz toppers and achievements"
          autoPlayMs={6500}
          renderItem={(slide, _i, { isLazy }) => (
            <TopperSlideCard slide={slide} isLazy={isLazy} />
          )}
          emptyState={
            <div className="rounded-3xl border border-dashed border-ink-900/15 bg-white/80 px-6 py-12 text-center">
              <p className="text-3xl" aria-hidden>
                🏆
              </p>
              <h3 className="mt-3 font-display text-xl font-bold text-ink-900">
                Toppers & Achievements
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-900/60">
                Outstanding student achievements will appear here.
              </p>
            </div>
          }
        />
      </div>
    </section>
  );
}

function FeaturedPostCard({ slide, isLazy }) {
  const href = slide.linkPath || '#';
  const inner = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-sand-100 to-lagoon-100">
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt=""
            loading={isLazy ? 'lazy' : 'eager'}
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lagoon-700">
          Featured post
        </p>
        <h3 className="mt-1 font-display text-xl font-extrabold text-ink-900">{slide.title}</h3>
        {slide.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-900/65">
            {slide.description}
          </p>
        ) : null}
        {slide.ctaText ? (
          <span className="mt-5 inline-flex">
            <Button size="sm" variant="secondary" className="pointer-events-none">
              {slide.ctaText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </span>
        ) : null}
      </div>
    </>
  );

  if (!slide.linkPath) {
    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white shadow-soft">
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white shadow-soft transition hover:-translate-y-1 hover:border-lagoon-300 hover:shadow-lift"
    >
      {inner}
    </Link>
  );
}

export function FeaturedPostsCarousel({ slides = [] }) {
  if (!slides.length) return null;

  return (
    <section className="border-b border-ink-900/8 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember-600">
            Featured posts
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">
            From the academy
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-900/65">
            Educational highlights and updates selected for every visitor.
          </p>
        </div>
        <ImageCarousel
          items={slides}
          ariaLabel="Featured educational posts"
          renderItem={(slide, _i, { isLazy }) => (
            <FeaturedPostCard slide={slide} isLazy={isLazy} />
          )}
        />
      </div>
    </section>
  );
}
