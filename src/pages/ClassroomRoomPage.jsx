import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { getErrorMessage } from '../utils/errors';
import { formatMarks, optionLabel } from '../utils/quizFormat';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { MathText } from '../components/quiz/MathText';
import { QuestionMedia } from '../components/quiz/QuestionMedia';
import { cn } from '../utils/cn';

function formatDelta(value) {
  const number = Number(value || 0);
  if (number > 0) return `+${formatMarks(number)}`;
  return formatMarks(number);
}

function ResultBanner({ result }) {
  if (!result?.emoji) return null;
  const tone =
    result.outcome === 'wrong'
      ? 'border-red-200 bg-red-50'
      : result.outcome === 'pass'
        ? 'border-ember-400/40 bg-ember-400/10'
        : 'border-lagoon-200 bg-lagoon-50';

  return (
    <div className={cn('mb-4 flex items-start gap-4 rounded-3xl border p-4', tone)}>
      <span className="text-5xl leading-none" aria-hidden>
        {result.emoji}
      </span>
      <div>
        <p className="font-display text-xl font-extrabold text-ink-900">{result.headline}</p>
        <p className="mt-1 text-sm text-ink-900/75">{result.detail}</p>
        {result.outcome === 'correct' || result.outcome === 'wrong' || result.outcome === 'award' ? (
          <p className="mt-2 text-sm font-bold text-ink-900">
            {result.groupName} {formatDelta(result.scoreDelta)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function HostBoard({
  session,
  question,
  picked,
  correctSet,
  showKey,
  pickedSet,
  busy,
  actionError,
  onDismissError,
  backTo,
  onToggle,
  onLock,
  onPass,
  onNext,
  onFinish,
  onRestart,
  awardGroupId,
  awardMarks,
  awardCriteria,
  onAwardGroup,
  onAwardMarks,
  onAwardCriteria,
  onAward,
  onPublish,
}) {
  const [awardOpen, setAwardOpen] = useState(false);
  const turnId = question?.open ? question.turnGroupId : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1400px] flex-col">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lagoon-700">
            {session.status === 'finished' ? 'Finished' : 'Live'}
            {session.subject ? ` · ${session.subject}` : ''}
          </p>
          <h1 className="truncate font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {session.title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {session.status === 'live' ? (
            <Button variant="ghost" size="sm" loading={busy === 'finish'} onClick={onFinish}>
              End quiz
            </Button>
          ) : null}
          <Link to={backTo}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {actionError ? (
        <Alert type="error" title="Try again" onClose={onDismissError} className="mt-4">
          {actionError}
        </Alert>
      ) : null}

      <div
        className="mt-5 grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.max(session.groups.length, 1)}, minmax(0, 1fr))` }}
      >
        {session.groups.map((group) => {
          const active = group.id === turnId;
          return (
            <div
              key={group.id}
              className={cn(
                'rounded-3xl border bg-white px-4 py-3 text-center shadow-soft',
                active ? 'border-lagoon-500 ring-2 ring-lagoon-200' : 'border-ink-900/8'
              )}
            >
              <p className="truncate text-sm font-bold uppercase tracking-wide text-ink-900/50">
                {active ? `${group.name} · now` : group.name}
              </p>
              <p className="font-display text-4xl font-extrabold leading-none text-ink-900 sm:text-5xl">
                {formatMarks(group.score)}
              </p>
            </div>
          );
        })}
      </div>

      {session.masterScore > 0 ? (
        <p className="mt-3 text-center text-sm font-semibold text-ink-900/55">
          Master holds {formatMarks(session.masterScore)}
        </p>
      ) : null}

      {session.lastResult?.emoji ? (
        <div
          className={cn(
            'mt-4 flex items-center gap-4 rounded-3xl border px-5 py-4',
            session.lastResult.outcome === 'wrong'
              ? 'border-red-200 bg-red-50'
              : session.lastResult.outcome === 'pass'
                ? 'border-ember-400/40 bg-ember-400/10'
                : 'border-lagoon-200 bg-lagoon-50'
          )}
        >
          <span className="text-5xl leading-none" aria-hidden>
            {session.lastResult.emoji}
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold text-ink-900">{session.lastResult.headline}</p>
            <p className="text-base text-ink-900/70">{session.lastResult.detail}</p>
          </div>
        </div>
      ) : null}

      {question && session.status !== 'finished' ? (
        <div className="mt-4 flex-1 rounded-[2rem] bg-white px-6 py-7 shadow-soft sm:px-10 sm:py-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-lagoon-700">
            Question {question.number} of {question.total}
            {question.open
              ? ` · ${formatMarks(question.stake)} marks · ${question.turnGroupName}`
              : ' · Locked'}
          </p>
          <MathText
            text={question.text}
            className="mt-4 block font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl"
          />
          <QuestionMedia src={question.imageUrl} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {question.options.map((option, index) => {
              const selectedNow = question.open ? picked.includes(index) : pickedSet.has(index);
              const isCorrect = showKey && correctSet.has(index);
              const isWrongPick = showKey && selectedNow && !isCorrect;
              return (
                <button
                  key={`${question.index}-${index}`}
                  type="button"
                  disabled={!session.canAnswer}
                  onClick={() => onToggle(index)}
                  className={cn(
                    'flex min-h-24 items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition',
                    isCorrect && 'border-lagoon-500 bg-lagoon-50',
                    isWrongPick && 'border-red-400 bg-red-50',
                    !isCorrect && !isWrongPick && selectedNow && 'border-lagoon-500 bg-lagoon-50',
                    !isCorrect && !isWrongPick && !selectedNow && 'border-ink-900/10 bg-sand-50',
                    session.canAnswer && 'hover:border-lagoon-300'
                  )}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-ink-900 shadow-sm">
                    {optionLabel(index)}
                  </span>
                  <span className="min-w-0 font-display text-2xl font-bold text-ink-900">
                    {option.text ? <MathText text={option.text} /> : null}
                    <QuestionMedia src={option.imageUrl} size="option" alt="" />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {session.canAnswer ? (
              <>
                <Button
                  size="lg"
                  loading={busy === 'answer'}
                  disabled={picked.length === 0}
                  onClick={onLock}
                >
                  Lock answer
                </Button>
                <Button variant="secondary" size="lg" loading={busy === 'pass'} onClick={onPass}>
                  Pass
                </Button>
              </>
            ) : null}
            {session.status === 'live' && !question.open ? (
              <Button size="lg" loading={busy === 'next'} onClick={onNext}>
                {question.number === question.total ? 'Finish quiz' : 'Next question'}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {session.status === 'finished' ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink-900">Master marks</h2>
                <p className="mt-1 text-sm text-ink-900/60">
                  {formatMarks(session.masterScore)} marks are with the master. Give them to a group before you send results.
                </p>
              </div>
              <Button variant="secondary" loading={busy === 'restart'} onClick={onRestart}>
                Play again
              </Button>
            </div>
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onAward}>
              <Select label="Group" value={awardGroupId} onChange={onAwardGroup}>
                <option value="">Choose a group</option>
                {session.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} · {formatMarks(group.score)}
                  </option>
                ))}
              </Select>
              <Input
                label="Marks"
                type="number"
                min="0.25"
                step="0.25"
                value={awardMarks}
                onChange={onAwardMarks}
              />
              <div className="sm:col-span-2">
                <Textarea label="Reason" rows={2} value={awardCriteria} onChange={onAwardCriteria} />
              </div>
              <Button type="submit" loading={busy === 'award'} disabled={session.masterScore <= 0}>
                Add to group
              </Button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Send results</h2>
            <p className="mt-1 text-sm text-ink-900/60">
              Each student gets the score of the group they were added to when the groups were created.
            </p>
            {session.groups.every((group) => !(group.members || []).length) ? (
              <p className="mt-3 text-sm text-ink-900/60">
                No students are in these groups. Play again and add them while you set up the groups.
              </p>
            ) : null}
            <ul className="mt-4 space-y-3">
              {session.groups.map((group) => (
                <li key={group.id}>
                  <p className="text-sm font-bold text-ink-900">
                    {group.name}
                    <span className="ml-2 font-semibold text-ink-900/45">{formatMarks(group.score)}</span>
                  </p>
                  <p className="text-sm text-ink-900/60">
                    {(group.members || []).length
                      ? group.members.map((member) => member.name).join(', ')
                      : 'No students in this group'}
                  </p>
                </li>
              ))}
            </ul>
            {session.resultsSentCount > 0 ? (
              <p className="mt-3 text-sm font-semibold text-lagoon-700">
                Last send reached {session.resultsSentCount} student{session.resultsSentCount === 1 ? '' : 's'}.
              </p>
            ) : null}
            <Button className="mt-4" loading={busy === 'publish'} onClick={() => onPublish()}>
              Send results to students
            </Button>
          </div>
        </div>
      ) : null}

      {session.status === 'live' ? (
        <div className="mt-4">
          <button
            type="button"
            className="text-sm font-semibold text-ink-900/45 hover:text-ink-900"
            onClick={() => setAwardOpen((open) => !open)}
          >
            {awardOpen ? 'Hide master marks' : `Master marks · ${formatMarks(session.masterScore)}`}
          </button>
          {awardOpen ? (
            <form className="mt-3 grid gap-3 rounded-3xl bg-white p-4 shadow-soft sm:grid-cols-2" onSubmit={onAward}>
              <Select label="Group" value={awardGroupId} onChange={onAwardGroup}>
                <option value="">Choose a group</option>
                {session.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Marks"
                type="number"
                min="0.25"
                step="0.25"
                value={awardMarks}
                onChange={onAwardMarks}
              />
              <div className="sm:col-span-2">
                <Textarea label="Reason" rows={2} value={awardCriteria} onChange={onAwardCriteria} />
              </div>
              <Button type="submit" size="sm" loading={busy === 'award'} disabled={session.masterScore <= 0}>
                Add to group
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Leaderboard({ session }) {
  const turnId = session.question?.open ? session.question.turnGroupId : null;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-lagoon-700" />
        <h3 className="font-display text-lg font-extrabold text-ink-900">Scores</h3>
      </div>
      <ol className="space-y-2">
        {session.groups.map((group) => {
          const active = group.id === turnId;
          const mine = group.id === session.myGroupId;
          return (
            <li
              key={group.id}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-3 py-2',
                active ? 'border-lagoon-400 bg-lagoon-50' : 'border-ink-900/8 bg-white'
              )}
            >
              <span className="w-6 text-sm font-extrabold text-ink-900/45">{group.rank}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">
                  {group.name}
                  {mine ? <span className="ml-2 text-xs font-bold text-lagoon-700">You</span> : null}
                </p>
                <p className="truncate text-xs text-ink-900/45">
                  {group.members.length
                    ? group.members.map((member) => member.name).join(', ')
                    : 'No one seated yet'}
                </p>
              </div>
              <span className="font-display text-xl font-extrabold text-ink-900">
                {formatMarks(group.score)}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

export function ClassroomRoomPage({ mode = 'player', api, backTo = '/quizzes' }) {
  const { id } = useParams();
  const isHost = mode === 'host';
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');
  const [names, setNames] = useState([]);
  const [roster, setRoster] = useState([]);
  const [nameSessionId, setNameSessionId] = useState('');
  const [picked, setPicked] = useState([]);
  const [pickKey, setPickKey] = useState('');
  const [awardGroupId, setAwardGroupId] = useState('');
  const [awardMarks, setAwardMarks] = useState('');
  const [awardCriteria, setAwardCriteria] = useState('');

  useEffect(() => {
    let active = true;

    async function load(silent) {
      try {
        const { data } = await api.get(id);
        if (!active) return;
        setSession(data.data.session);
        setStatus('ready');
        if (!silent) setError('');
      } catch (err) {
        if (!active) return;
        if (!silent) {
          setStatus('error');
          setError(getErrorMessage(err, 'Could not open this classroom.'));
        }
      }
    }

    load(false);
    const timer = setInterval(() => load(true), 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [api, id]);

  const turnKey = session?.question
    ? `${session.id}:${session.question.index}:${session.question.turnGroupId}:${session.question.failCount}:${session.question.open}`
    : '';
  if (turnKey !== pickKey) {
    setPickKey(turnKey);
    setPicked([]);
  }

  if (session?.status === 'lobby' && session.id !== nameSessionId) {
    setNameSessionId(session.id);
    setNames(session.groups.map((group) => group.name));
    setRoster(session.groups.map((group) => (group.members || []).map((member) => member.id)));
  }

  async function run(label, task) {
    setBusy(label);
    setActionError('');
    try {
      const { data } = await task();
      setSession(data.data.session);
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, 'That did not go through.'));
      return false;
    } finally {
      setBusy('');
    }
  }

  function toggleOption(index) {
    if (!session?.canAnswer) return;
    setPicked((current) => {
      if (session.question?.type === 'multiple') {
        return current.includes(index) ? current.filter((item) => item !== index) : [...current, index];
      }
      return [index];
    });
  }

  if (status === 'loading') {
    return (
      <PageShell embedded title="Classroom">
        <LoadingState label="Opening the classroom…" />
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell embedded title="Classroom">
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  const question = session?.question;
  const correctSet = new Set(question?.correctOptions || []);
  const showKey = Array.isArray(question?.correctOptions);
  const pickedSet = new Set(session?.lastResult?.selectedOptions || []);

  if (isHost && session && (session.status === 'live' || session.status === 'finished')) {
    return (
      <HostBoard
        session={session}
        question={question}
        picked={picked}
        correctSet={correctSet}
        showKey={showKey}
        pickedSet={pickedSet}
        busy={busy}
        actionError={actionError}
        onDismissError={() => setActionError('')}
        backTo={backTo}
        onToggle={toggleOption}
        onLock={() => run('answer', () => api.answer(id, { selectedOptions: picked }))}
        onPass={() => run('pass', () => api.pass(id))}
        onNext={() => run('next', () => api.next(id))}
        onFinish={() => run('finish', () => api.finish(id))}
        onRestart={() => run('restart', () => api.open(id, { restart: true }))}
        awardGroupId={awardGroupId}
        awardMarks={awardMarks}
        awardCriteria={awardCriteria}
        onAwardGroup={(event) => setAwardGroupId(event.target.value)}
        onAwardMarks={(event) => setAwardMarks(event.target.value)}
        onAwardCriteria={(event) => setAwardCriteria(event.target.value)}
        onAward={async (event) => {
          event.preventDefault();
          const ok = await run('award', () =>
            api.award(id, {
              groupId: awardGroupId,
              marks: Number(awardMarks),
              criteria: awardCriteria,
            })
          );
          if (ok) {
            setAwardMarks('');
            setAwardCriteria('');
          }
        }}
        onPublish={() => run('publish', () => api.publishResults(id))}
      />
    );
  }

  return (
    <PageShell
      embedded
      eyebrow="Quiz"
      title={session?.title || 'Classroom'}
      description={
        session
          ? 'Groups play in turn. Scores stay sorted from highest to lowest. Pass carries half the marks. Two misses give the marks to the master.'
          : 'The master has not opened this classroom yet.'
      }
      actions={
        <Link to={backTo}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      {actionError ? (
        <Alert type="error" title="Try again" onClose={() => setActionError('')} className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {!session && isHost ? (
        <Card>
          <p className="text-sm text-ink-900/70">
            Open a lobby, name the groups, add the students in each group, then start.
          </p>
          <Button className="mt-4" loading={busy === 'open'} onClick={() => run('open', () => api.open(id))}>
            Open classroom
          </Button>
        </Card>
      ) : null}

      {!session && !isHost ? (
        <Card>
          <p className="text-sm text-ink-900/70">
            Waiting for the master to open the classroom. This page updates on its own.
          </p>
        </Card>
      ) : null}

      {session ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {session.status}
            </span>
            {session.subject ? <span className="text-sm font-medium text-lagoon-700">{session.subject}</span> : null}
          </div>

          <ResultBanner result={session.lastResult} />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              {session.status === 'lobby' && isHost ? (
                <Card className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-ink-900">Groups</h3>
                    <p className="mt-1 text-sm text-ink-900/65">
                      Name each group and add the students who will play in it. Save the groups before you start.
                    </p>
                  </div>
                  {(session.classStudents || []).length === 0 ? (
                    <p className="text-sm text-ink-900/55">No students are in this quiz’s class.</p>
                  ) : null}
                  {names.map((name, index) => {
                    const mine = roster[index] || [];
                    const taken = new Set(roster.flat());
                    const students = session.classStudents || [];
                    const labelFor = (studentId) => {
                      const student = students.find((item) => item.id === studentId);
                      return student ? `${student.name}${student.className ? ` ${student.className}` : ''}` : 'Student';
                    };
                    return (
                      <div key={session.groups[index]?.id || `new-${index}`} className="rounded-2xl border border-ink-900/8 p-3">
                        <Input
                          label={`Group ${index + 1}`}
                          value={name}
                          onChange={(event) =>
                            setNames((current) =>
                              current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item))
                            )
                          }
                        />
                        {mine.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {mine.map((studentId) => (
                              <button
                                key={studentId}
                                type="button"
                                className="rounded-full bg-lagoon-50 px-3 py-1 text-xs font-semibold text-lagoon-800"
                                onClick={() =>
                                  setRoster((current) =>
                                    current.map((ids, itemIndex) =>
                                      itemIndex === index ? ids.filter((id) => id !== studentId) : ids
                                    )
                                  )
                                }
                              >
                                {labelFor(studentId)} ×
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-ink-900/45">No students in this group yet.</p>
                        )}
                        <select
                          className="mt-2 h-11 w-full rounded-xl border border-ink-900/10 bg-white px-3 text-sm text-ink-900"
                          value=""
                          onChange={(event) => {
                            const studentId = event.target.value;
                            if (!studentId) return;
                            setRoster((current) => {
                              const next = names.map((_, itemIndex) => [...(current[itemIndex] || [])]);
                              next[index] = [...(next[index] || []), studentId];
                              return next;
                            });
                          }}
                        >
                          <option value="">Add a student</option>
                          {students
                            .filter((student) => !taken.has(student.id))
                            .map((student) => (
                              <option key={student.id} value={student.id}>
                                {student.name}
                                {student.className ? ` ${student.className}` : ''}
                              </option>
                            ))}
                        </select>
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={names.length >= 8}
                      onClick={() => {
                        setNames((current) => [...current, `Group ${current.length + 1}`]);
                        setRoster((current) => [...current, []]);
                      }}
                    >
                      Add group
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={names.length <= 2}
                      onClick={() => {
                        setNames((current) => current.slice(0, -1));
                        setRoster((current) => current.slice(0, -1));
                      }}
                    >
                      Remove last
                    </Button>
                    <Button
                      size="sm"
                      loading={busy === 'groups'}
                      onClick={() =>
                        run('groups', () =>
                          api.updateGroups(id, {
                            names,
                            members: names.map((_, index) => roster[index] || []),
                          })
                        )
                      }
                    >
                      Save groups
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      loading={busy === 'start'}
                      disabled={names.some((_, index) => !(roster[index] || []).length)}
                      onClick={() =>
                        run('start', async () => {
                          await api.updateGroups(id, {
                            names,
                            members: names.map((_, index) => roster[index] || []),
                          });
                          return api.start(id);
                        })
                      }
                    >
                      Start quiz
                    </Button>
                    <Button
                      variant="secondary"
                      loading={busy === 'finish'}
                      onClick={() => run('finish', () => api.finish(id))}
                    >
                      Close lobby
                    </Button>
                  </div>
                </Card>
              ) : null}

              {session.status === 'lobby' && !isHost ? (
                <Card className="space-y-3">
                  <h3 className="font-display text-lg font-extrabold text-ink-900">Sit with a group</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {session.groups.map((group) => (
                      <Button
                        key={group.id}
                        variant={group.id === session.myGroupId ? 'primary' : 'secondary'}
                        loading={busy === group.id}
                        onClick={() => run(group.id, () => api.join(id, { groupId: group.id }))}
                      >
                        {group.id === session.myGroupId ? `Seated in ${group.name}` : `Join ${group.name}`}
                      </Button>
                    ))}
                  </div>
                </Card>
              ) : null}

              {!isHost && session.status === 'live' ? (
                <Card className="space-y-3">
                  <h3 className="font-display text-lg font-extrabold text-ink-900">Your group</h3>
                  <div className="flex flex-wrap gap-2">
                    {session.groups.map((group) => (
                      <Button
                        key={group.id}
                        size="sm"
                        variant={group.id === session.myGroupId ? 'primary' : 'secondary'}
                        loading={busy === group.id}
                        onClick={() => run(group.id, () => api.join(id, { groupId: group.id }))}
                      >
                        {group.name}
                      </Button>
                    ))}
                  </div>
                </Card>
              ) : null}

              {question ? (
                <Card>
                  <p className="text-xs font-bold uppercase tracking-wide text-lagoon-700">
                    Question {question.number} of {question.total}
                    {question.open
                      ? ` · ${formatMarks(question.stake)} marks for ${question.turnGroupName}`
                      : ' · Locked'}
                  </p>
                  <MathText text={question.text} className="mt-3 block text-lg font-semibold text-ink-900" />
                  <QuestionMedia src={question.imageUrl} />
                  <div className="mt-4 space-y-2">
                    {question.options.map((option, index) => {
                      const selectedNow = question.open ? picked.includes(index) : pickedSet.has(index);
                      const isCorrect = showKey && correctSet.has(index);
                      const isWrongPick = showKey && selectedNow && !isCorrect;
                      return (
                        <button
                          key={`${question.index}-${index}`}
                          type="button"
                          disabled={!session.canAnswer}
                          onClick={() => toggleOption(index)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition',
                            isCorrect && 'border-lagoon-500 bg-lagoon-50',
                            isWrongPick && 'border-red-400 bg-red-50',
                            !isCorrect && !isWrongPick && selectedNow && 'border-lagoon-500 bg-lagoon-50',
                            !isCorrect && !isWrongPick && !selectedNow && 'border-ink-900/10 bg-white',
                            session.canAnswer && 'hover:border-lagoon-300'
                          )}
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900/5 text-xs font-extrabold">
                            {optionLabel(index)}
                          </span>
                          <span className="min-w-0">
                            {option.text ? <MathText text={option.text} /> : null}
                            <QuestionMedia src={option.imageUrl} size="option" alt="" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {session.canAnswer ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        loading={busy === 'answer'}
                        disabled={picked.length === 0}
                        onClick={() => run('answer', () => api.answer(id, { selectedOptions: picked }))}
                      >
                        Lock answer
                      </Button>
                      <Button variant="secondary" loading={busy === 'pass'} onClick={() => run('pass', () => api.pass(id))}>
                        Pass — half marks to the next group
                      </Button>
                    </div>
                  ) : null}
                  {!session.canAnswer && question.open ? (
                    <p className="mt-4 text-sm text-ink-900/60">
                      {session.myGroupId
                        ? `Waiting for ${question.turnGroupName}.`
                        : 'Join a group to answer when it is your turn.'}
                    </p>
                  ) : null}
                  {isHost && session.status === 'live' && !question.open ? (
                    <Button className="mt-4" loading={busy === 'next'} onClick={() => run('next', () => api.next(id))}>
                      {question.number === question.total ? 'Finish quiz' : 'Next question'}
                    </Button>
                  ) : null}
                </Card>
              ) : null}

              {session.status === 'finished' ? (
                <Card>
                  <p className="font-display text-xl font-extrabold text-ink-900">Classroom finished</p>
                  <p className="mt-1 text-sm text-ink-900/65">
                    The master can still move marks from the master pile to a group.
                  </p>
                  {isHost ? (
                    <Button
                      className="mt-4"
                      variant="secondary"
                      loading={busy === 'restart'}
                      onClick={() => run('restart', () => api.open(id, { restart: true }))}
                    >
                      Play again
                    </Button>
                  ) : null}
                </Card>
              ) : null}

              {isHost && session.status === 'live' ? (
                <Button variant="secondary" loading={busy === 'finish'} onClick={() => run('finish', () => api.finish(id))}>
                  End quiz now
                </Button>
              ) : null}
            </div>

            <div className="space-y-4">
              <Leaderboard session={session} />
              <Card className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-900/45">Master</p>
                <p className="font-display text-3xl font-extrabold text-ink-900">{formatMarks(session.masterScore)}</p>
                <p className="mt-1 text-xs text-ink-900/55">
                  Marks land here when two groups miss. Award them to any group, with your reason.
                </p>
                {session.awards?.length ? (
                  <ul className="mt-3 space-y-2 text-sm text-ink-900/75">
                    {session.awards.map((award) => (
                      <li key={award.id}>
                        <span className="font-semibold text-ink-900">
                          {formatMarks(award.marks)} to {award.groupName}
                        </span>
                        {award.criteria ? ` — ${award.criteria}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {isHost && session.status !== 'lobby' ? (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const ok = await run('award', () =>
                        api.award(id, {
                          groupId: awardGroupId,
                          marks: Number(awardMarks),
                          criteria: awardCriteria,
                        })
                      );
                      if (ok) {
                        setAwardMarks('');
                        setAwardCriteria('');
                      }
                    }}
                  >
                    <Select
                      label="Group"
                      value={awardGroupId}
                      onChange={(event) => setAwardGroupId(event.target.value)}
                    >
                      <option value="">Choose a group</option>
                      {session.groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Marks"
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={awardMarks}
                      onChange={(event) => setAwardMarks(event.target.value)}
                    />
                    <Textarea
                      label="Your criteria"
                      rows={2}
                      value={awardCriteria}
                      onChange={(event) => setAwardCriteria(event.target.value)}
                      hint="Why this group should receive the marks"
                    />
                    <Button type="submit" size="sm" loading={busy === 'award'} disabled={session.masterScore <= 0}>
                      Add to group
                    </Button>
                  </form>
                ) : null}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
