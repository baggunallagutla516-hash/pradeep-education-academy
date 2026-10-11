import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contentApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { rememberQuizReturnPath } from '../utils/quizReturnPath';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

function quizPath(data) {
  if (data.playMode === 'individual') return `/quizzes/${data.quizId}`;
  return `/quizzes/${data.quizId}/classroom`;
}

export function JoinQuizPage() {
  const { code: codeParam = '' } = useParams();
  const navigate = useNavigate();
  const { status } = useAuth();
  const [code, setCode] = useState(codeParam.toUpperCase());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const openCode = useCallback(
    async (raw) => {
      const next = String(raw || '').trim().toUpperCase();
      if (next.length !== 4) {
        setError('Enter the 4-character quiz code.');
        return;
      }
      setBusy(true);
      setError('');
      try {
        const { data } = await contentApi.classroomCode(next);
        const path = quizPath(data.data);
        if (status === 'authenticated') {
          navigate(path, { replace: true });
          return;
        }
        rememberQuizReturnPath(path);
        navigate('/login', { replace: true, state: { from: path } });
      } catch (err) {
        setError(getErrorMessage(err, 'No quiz is open for that code.'));
        setBusy(false);
      }
    },
    [navigate, status]
  );

  useEffect(() => {
    if (!codeParam || status === 'loading') return;
    openCode(codeParam);
  }, [codeParam, openCode, status]);

  return (
    <PageShell
      eyebrow="Quiz"
      title="Join with a code"
      description="Scan the quiz QR, or type the 4-character code."
    >
      <div className="mx-auto max-w-md">
        <Card>
          {error ? (
            <Alert type="error" title="Could not open the quiz" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          ) : null}
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              openCode(code);
            }}
          >
            <Input
              label="Quiz code"
              name="code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 4))}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="AB12"
              hint="The code is shown with the quiz QR."
            />
            <Button type="submit" fullWidth loading={busy || (Boolean(codeParam) && status === 'loading')}>
              Open quiz
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
