import { useCallback, useEffect, useState } from 'react';
import { Download, PenLine } from 'lucide-react';
import { educatorApi } from '../../api/educatorApi';
import { mediaUrl } from '../../utils/media';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatBytes } from '../../utils/formatBytes';
import { unitLabel } from '../../utils/unitLabel';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

export function EducatorUnitTestsPage() {
  const [unitTests, setUnitTests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const params = classFilter ? { studentClass: classFilter } : undefined;
      const { data } = await educatorApi.unitTests(params);
      setUnitTests(data.data.unitTests || []);
      if (Array.isArray(data.data.classes) && data.data.classes.length > 0) {
        setClasses(data.data.classes);
      }
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load unit tests.'));
    }
  }, [classFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      embedded
      eyebrow="Practice"
      title="Unit tests"
      description="Published unit test papers for all classes. Filter by class if you want a shorter list."
      actions={
        <div className="w-full min-w-[11rem] sm:w-48">
          <Select
            label="Class filter"
            name="studentClass"
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
          >
            <option value="">All classes</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
      }
    >
      {status === 'loading' ? <LoadingState label="Loading unit tests…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && unitTests.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={
            classFilter
              ? `No published unit tests for ${
                  classes.find((c) => c.id === classFilter)?.name || 'this class'
                } yet.`
              : 'No published unit tests are available yet. Check back soon.'
          }
          icon={PenLine}
        />
      ) : null}

      {status === 'ready' && unitTests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {unitTests.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="relative aspect-[16/10] bg-ink-900/5">
                {item.coverImageUrl ? (
                  <img
                    src={mediaUrl(item.coverImageUrl)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-lagoon-100 text-lagoon-700">
                    <PenLine className="h-10 w-10" aria-hidden />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <Badge>{classLabel(item)}</Badge>
                  <Badge tone="ember">{unitLabel(item)}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
                {item.description ? (
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-900/60">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-ink-900/50">
                  {item.fileName || 'Download'}
                  {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ''}
                </p>
                <a
                  href={mediaUrl(item.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex"
                  download={item.fileName || undefined}
                >
                  <Button size="sm">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
