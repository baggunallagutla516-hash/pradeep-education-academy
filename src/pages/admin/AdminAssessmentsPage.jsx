import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStaffContent } from '../../context/StaffContentContext';
import { getErrorMessage } from '../../utils/errors';
import { classLabel } from '../../utils/classLabel';
import { formatDateTime, formatMarks } from '../../utils/quizFormat';
import {
  classOptionsFromItems,
  itemMatchesClassFilter,
} from '../../utils/contentClasses';
import {
  confirmEditPublishedMessage,
  confirmUnpublishMessage,
} from '../../utils/wipeAttemptsConfirm';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpandableText } from '../../components/ui/ExpandableText';
import { Alert } from '../../components/ui/Alert';

export function AdminAssessmentsPage() {
  const { basePath, api } = useStaffContent();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const { data } = await api.assessments();
      setAssessments(data.data.assessments);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(getErrorMessage(err, 'Could not load assessments.'));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const classes = useMemo(
    () => classOptionsFromItems(assessments, classLabel),
    [assessments]
  );

  const visible = useMemo(
    () => assessments.filter((item) => itemMatchesClassFilter(item, classFilter)),
    [assessments, classFilter]
  );

  function handleEdit(item) {
    if (item.isPublished || item.attemptCount > 0) {
      if (!window.confirm(confirmEditPublishedMessage(item.title, item.attemptCount || 0))) {
        return;
      }
    }
    navigate(`${basePath}/assessments/${item.id}/edit`);
  }

  async function handleTogglePublish(item) {
    if (item.isPublished) {
      if (!window.confirm(confirmUnpublishMessage(item.title, item.attemptCount || 0))) {
        return;
      }
    }

    setBusyId(item.id);
    setActionError('');
    try {
      const payload = item.isPublished
        ? { isPublished: false, confirmWipeAttempts: true }
        : { isPublished: true };
      await api.updateAssessment(item.id, payload);
      setAssessments((prev) =>
        prev.map((d) =>
          d.id === item.id
            ? {
                ...d,
                isPublished: !item.isPublished,
                ...(item.isPublished ? { attemptCount: 0, resultsReleased: false } : {}),
              }
            : d
        )
      );
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update publish status.'));
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(item) {
    const warning = item.attemptCount
      ? `Delete "${item.title}"? ${item.attemptCount} student result(s) will be deleted too.`
      : `Delete "${item.title}"?`;
    if (!window.confirm(warning)) return;

    setBusyId(item.id);
    setActionError('');
    try {
      await api.deleteAssessment(item.id);
      setAssessments((prev) => prev.filter((d) => d.id !== item.id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete this assessment.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <PageShell
      embedded
      eyebrow="Admin"
      title="Online Assessments"
      description="Timed online assessments with fullscreen CBT mode. Students attempt them online."
      actions={
        <div className="flex flex-wrap items-end gap-3">
          {classes.length > 1 ? (
            <div className="w-full min-w-[11rem] sm:w-48">
              <Select
                label="Class filter"
                name="classFilter"
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
          ) : null}
          <Link to={`${basePath}/assessments/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New online assessment
            </Button>
          </Link>
        </div>
      }
    >
      {actionError ? (
        <Alert type="error" title="Action failed" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState label="Loading online assessments…" /> : null}
      {status === 'error' ? <ErrorState description={error} onRetry={load} /> : null}
      {status === 'ready' && assessments.length === 0 ? (
        <EmptyState
          title="No online assessments yet"
          description="Create an assessment with single/multi-select questions and publish it to one or more classes."
          icon={ClipboardCheck}
          action={
            <Link to={`${basePath}/assessments/new`}>
              <Button>Create online assessment</Button>
            </Link>
          }
        />
      ) : null}
      {status === 'ready' && assessments.length > 0 && visible.length === 0 ? (
        <EmptyState
          title="Nothing for this class"
          description="No online assessments have been created for the selected class yet."
          icon={ClipboardCheck}
        />
      ) : null}

      {status === 'ready' && visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <Card key={item.id}>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge tone={item.isPublished ? 'lagoon' : 'ink'}>
                  {item.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <Badge tone={item.resultsReleased ? 'lagoon' : 'ember'}>
                  {item.resultsReleased ? 'Results out' : 'Results held'}
                </Badge>
                <Badge tone="ink">{classLabel(item)}</Badge>
                <Badge tone="ember">{formatDateTime(item.assessmentDate)}</Badge>
                {item.endDate ? (
                  <Badge tone="ink">Ends {formatDateTime(item.endDate)}</Badge>
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
                <Link to={`${basePath}/assessments/${item.id}/results`}>
                  <Button variant="secondary" size="sm">
                    <BarChart3 className="h-4 w-4" />
                    Results
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={busyId === item.id}
                  onClick={() => handleTogglePublish(item)}
                >
                  {item.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
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
