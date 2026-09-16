import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { contentApi } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';
import { PageShell } from '../components/layout/PageShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export function ToppersPage() {
  const [toppers, setToppers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await contentApi.carousel();
      setToppers(data.data.toppers || []);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load toppers.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      eyebrow="Achievements"
      title="Toppers & achievements"
      description="Publicly approved student achievements from the academy."
      actions={
        <Link to="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading achievements…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && toppers.length === 0 ? (
        <EmptyState
          title="Toppers & Achievements"
          description="Outstanding student achievements will appear here."
          icon={Trophy}
        />
      ) : null}

      {status === 'ready' && toppers.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {toppers.map((slide) => {
            const photo = slide.studentPhotoUrl || slide.imageUrl;
            return (
              <Card key={slide.id} className="overflow-hidden p-0">
                <div className="bg-[linear-gradient(145deg,#147361_0%,#1F8F78_50%,#E8852F_100%)] px-5 py-6 text-center text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
                    {slide.badgeLabel || 'Quiz Topper'}
                  </p>
                  <div className="mx-auto mt-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white/80 bg-white/15">
                    {photo ? (
                      <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Trophy className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5 text-center">
                  {slide.studentName ? (
                    <h3 className="font-display text-lg font-extrabold text-ink-900">
                      {slide.studentName}
                    </h3>
                  ) : (
                    <h3 className="font-display text-lg font-extrabold text-ink-900">
                      {slide.title}
                    </h3>
                  )}
                  {slide.studentClassLabel ? (
                    <p className="mt-1 text-sm text-ink-800/60">{slide.studentClassLabel}</p>
                  ) : null}
                  {slide.quizName ? (
                    <p className="mt-3 text-sm font-semibold text-lagoon-700">{slide.quizName}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {slide.scoreDisplay ? (
                      <Badge tone="lagoon">Score: {slide.scoreDisplay}</Badge>
                    ) : null}
                    {slide.percentage != null ? (
                      <Badge tone="ember">{Math.round(slide.percentage)}%</Badge>
                    ) : null}
                    {slide.rank != null ? <Badge>Rank #{slide.rank}</Badge> : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </PageShell>
  );
}
