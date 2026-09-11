import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, formatMarks } from '../../utils/quizFormat';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpandableText } from '../../components/ui/ExpandableText';
import { Alert } from '../../components/ui/Alert';

export function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await adminApi.quizzes();
      setQuizzes(data.data.quizzes);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load quizzes.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(item) {
    const warning = item.attemptCount
      ? `Delete "${item.title}"? ${item.attemptCount} student result(s) will be deleted too.`
      : `Delete "${item.title}"?`;
    if (!window.confirm(warning)) return;

    setBusyId(item.id);
    setActionError('');
    try {
      await adminApi.deleteQuiz(item.id);
      setQuizzes((prev) => prev.filter((d) => d.id !== item.id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete this quiz.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="QUIZ"
      description="Open quizzes for every login — students, educators, and parents. Single and multi-select questions only."
      actions={
        <Link to="/admin/quizzes/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New quiz
          </Button>
        </Link>
      }
    >
      {actionError ? (
        <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading quizzes…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="Create a quiz with single and multi-select questions. Students, educators, and parents can attempt it after you publish."
          icon={HelpCircle}
          action={
            <Link to="/admin/quizzes/new">
              <Button>Create quiz</Button>
            </Link>
          }
        />
      ) : null}

      {status === 'ready' && quizzes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((item) => (
            <Card key={item.id}>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge tone={item.isPublished ? 'lagoon' : 'ink'}>
                  {item.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <Badge tone={item.resultsReleased ? 'lagoon' : 'ember'}>
                  {item.resultsReleased ? 'Results out' : 'Results held'}
                </Badge>
                <Badge tone="ink">Everyone</Badge>
                {item.endDate ? (
                  <Badge tone="ink">Ends {formatDate(item.endDate)}</Badge>
                ) : null}
              </div>

              <h3 className="font-display text-lg font-bold text-ink-900">{item.title}</h3>
              {item.subject ? (
                <p className="mt-0.5 text-sm font-medium text-lagoon-700">{item.subject}</p>
              ) : null}
              {item.description ? (
                <ExpandableText text={item.description} lines={2} />
              ) : null}

              <p className="mt-3 text-xs text-ink-900/55">
                {item.questionCount} question{item.questionCount === 1 ? '' : 's'} ·{' '}
                {formatMarks(item.totalMarks)} marks · {item.durationMinutes} min ·{' '}
                {item.attemptCount} attempt{item.attemptCount === 1 ? '' : 's'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/admin/quizzes/${item.id}/results`}>
                  <Button variant="secondary" size="sm">
                    <BarChart3 className="h-4 w-4" />
                    Results
                  </Button>
                </Link>
                {!item.isPublished ? (
                  <Link to={`/admin/quizzes/${item.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                ) : null}
                <Button
                  variant="danger"
                  size="sm"
                  loading={busyId === item.id}
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
