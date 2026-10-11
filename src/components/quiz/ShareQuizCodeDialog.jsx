import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

export function ShareQuizCodeDialog({ quiz, onClose }) {
  const [src, setSrc] = useState('');
  const code = quiz?.joinCode || '';
  const link = code ? `${window.location.origin}/join/${code}` : '';

  useEffect(() => {
    if (!link) return undefined;
    let active = true;
    QRCode.toDataURL(link, { width: 320, margin: 1 }).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [link]);

  if (!quiz) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-900/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-quiz-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-lift"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3 text-left">
          <div>
            <h2 id="share-quiz-title" className="font-display text-xl font-extrabold text-ink-900">
              {quiz.title}
            </h2>
            <p className="mt-1 text-sm text-ink-900/60">
              Students scan this QR or enter the code, then start the quiz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900/5 text-ink-900 hover:bg-ink-900/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {src ? <img src={src} alt={`QR code for ${code}`} className="mx-auto h-56 w-56" /> : null}
        <p className="mt-3 font-display text-4xl font-extrabold tracking-[0.2em] text-ink-900">{code}</p>
        {!quiz.isPublished ? (
          <p className="mt-2 text-sm text-ink-900/60">Publish the quiz before students can use this code.</p>
        ) : null}
        <Button className="mt-4" variant="secondary" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
