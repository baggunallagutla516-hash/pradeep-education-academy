import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { contentApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/errors';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

function codeFromScan(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  try {
    const url = new URL(text);
    const parts = url.pathname.split('/').filter(Boolean);
    const index = parts.lastIndexOf('join');
    const fromPath = index >= 0 ? parts[index + 1] : '';
    if (/^[A-Za-z0-9]{4}$/.test(fromPath || '')) return fromPath.toUpperCase();
  } catch {
    /* The scan may be the code itself. */
  }
  const plain = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^[A-Z0-9]{4}$/.test(plain) ? plain : '';
}

export function JoinQuizDialog({ open, onClose, basePath = '/quizzes' }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [mode, setMode] = useState('type');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [scanError, setScanError] = useState('');
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => {
    if (busy) return;
    onClose();
  }, [busy, onClose]);

  const openQuiz = useCallback(
    async (raw) => {
      const next = String(raw || '').trim().toUpperCase();
      if (!/^[A-Z0-9]{4}$/.test(next)) {
        setError('Use the 4-character quiz code.');
        setMode('type');
        return;
      }
      setBusy(true);
      setError('');
      try {
        const { data } = await contentApi.classroomCode(next);
        const quizPath =
          data.data.playMode === 'individual'
            ? `${basePath}/${data.data.quizId}`
            : `${basePath}/${data.data.quizId}/classroom`;
        navigate(quizPath);
        onClose();
      } catch (err) {
        setError(getErrorMessage(err, 'No quiz is open for that code.'));
        setMode('type');
        setBusy(false);
      }
    },
    [basePath, navigate, onClose]
  );

  const openQuizRef = useRef(openQuiz);
  openQuizRef.current = openQuiz;

  useEffect(() => {
    if (!open) return undefined;
    setMode('type');
    setCode('');
    setError('');
    setScanError('');
    setBusy(false);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || mode !== 'scan') return undefined;
    const video = videoRef.current;
    let stopped = false;
    let controls = null;

    async function start() {
      setScanError('');
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (stopped || !video) return;
        const reader = new BrowserQRCodeReader();
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          video,
          (result) => {
            if (!result || stopped) return;
            const found = codeFromScan(result.getText());
            if (!found) {
              setScanError('That QR is not a quiz code.');
              return;
            }
            stopped = true;
            controls?.stop();
            setCode(found);
            openQuizRef.current(found);
          }
        );
      } catch {
        if (!stopped) {
          setScanError('Camera is unavailable. Type the code instead.');
        }
      }
    }

    start();
    return () => {
      stopped = true;
      controls?.stop();
      const stream = video?.srcObject;
      if (stream && typeof stream.getTracks === 'function') {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, mode]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-900/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-quiz-title"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-lift"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="join-quiz-title" className="font-display text-xl font-extrabold text-ink-900">
              Join a quiz
            </h2>
            <p className="mt-1 text-sm text-ink-900/60">Scan the QR, or type the code.</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900/5 text-ink-900 hover:bg-ink-900/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-ink-900/5 p-1">
          {[
            ['type', 'Enter code'],
            ['scan', 'Scan QR'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setError('');
                setScanError('');
              }}
              className={cn(
                'h-9 rounded-xl text-sm font-semibold',
                mode === value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-900/55'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <Alert type="error" title="Could not open the quiz" onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        ) : null}

        {mode === 'scan' ? (
          <div>
            <div className="overflow-hidden rounded-2xl bg-ink-900">
              <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
            </div>
            <p className="mt-3 text-sm text-ink-900/60">
              Point the camera at the quiz QR.
            </p>
            {scanError ? <p className="mt-2 text-sm font-medium text-red-600">{scanError}</p> : null}
            {busy ? <p className="mt-2 text-sm font-semibold text-lagoon-700">Opening the quiz…</p> : null}
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              openQuiz(code);
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
              hint="Four characters from the quiz."
            />
            <Button type="submit" fullWidth loading={busy}>
              Open quiz
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
