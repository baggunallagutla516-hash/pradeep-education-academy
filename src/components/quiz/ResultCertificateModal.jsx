import { useEffect, useState } from 'react';
import { Camera, Printer, X } from 'lucide-react';
import { classLabel } from '../../utils/classLabel';
import { formatDate, formatMarks } from '../../utils/quizFormat';
import { Button } from '../ui/Button';

const CERTIFICATE_LOGO = '/logo.png';

function dash(value) {
  const text = value == null ? '' : String(value).trim();
  return text || '—';
}

function InfoCell({ label, value }) {
  return (
    <div className="rounded-lg border border-ink-900/8 bg-sand-50/80 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-900/45">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-ink-900">{dash(value)}</p>
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="rounded-lg bg-ink-900/[0.04] px-2 py-3 text-center">
      <p className="font-display text-xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-900/45">
        {label}
      </p>
    </div>
  );
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  lines.forEach((entry, index) => {
    ctx.fillText(entry, x, y + index * lineHeight);
  });
  return lines.length;
}

async function loadLogoImage() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = CERTIFICATE_LOGO;
  });
}

/** Build a downloadable PNG of the certificate (no external libs). */
async function downloadCertificatePng({ result, student, kindLabel, activityLabel, dateValue, fileBase }) {
  const percentage = Math.round(Number(result.percentage) || 0);
  const resultDate = formatDate(
    dateValue || result.assessmentDate || result.practiceDate || result.submittedAt
  );
  const width = 900;
  const height = 1180;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const logo = await loadLogoImage();
  if (logo) {
    const size = 112;
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, 96, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logo, width / 2 - size / 2, 96 - size / 2, size, size);
    ctx.restore();
  }

  ctx.fillStyle = '#0b1c28';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px Georgia, "Times New Roman", serif';
  wrapText(ctx, result.title || 'Result', width / 2, 180, width - 120, 30, 2);

  ctx.fillStyle = '#5a6a75';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(
    `${kindLabel.toUpperCase()}${resultDate ? ` · ${resultDate}` : ''}`,
    width / 2,
    245
  );

  const fields = [
    ['Name', student?.fullName],
    ['Email', student?.email],
    ['Mobile / WhatsApp', student?.phone],
    ['Class / Section', classLabel(student)],
    ['Roll number', student?.rollNumber],
    ['School', student?.schoolName],
    [activityLabel, result.title],
    ['Subject', result.subject],
  ];

  const colW = (width - 120) / 2;
  let y = 280;
  fields.forEach((pair, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 60 + col * (colW + 20);
    const top = y + row * 78;
    ctx.fillStyle = '#f7f4ef';
    ctx.strokeStyle = 'rgba(11,28,40,0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, top, colW, 66, 10);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8a96a0';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(String(pair[0]).toUpperCase(), x + 14, top + 22);
    ctx.fillStyle = '#0b1c28';
    ctx.font = '600 15px system-ui, sans-serif';
    wrapText(ctx, dash(pair[1]), x + 14, top + 44, colW - 28, 18, 1);
  });

  y = 280 + 4 * 78 + 24;
  const stats = [
    ['Questions', result.questionCount ?? '—'],
    ['Correct', result.correctCount ?? 0],
    ['Incorrect', result.wrongCount ?? 0],
    ['Unattempted', result.unansweredCount ?? 0],
  ];
  const statW = (width - 120 - 36) / 4;
  stats.forEach((stat, index) => {
    const x = 60 + index * (statW + 12);
    ctx.fillStyle = '#f0f2f4';
    roundRect(ctx, x, y, statW, 78, 10);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0b1c28';
    ctx.font = 'bold 28px Georgia, "Times New Roman", serif';
    ctx.fillText(String(stat[1]), x + statW / 2, y + 38);
    ctx.fillStyle = '#8a96a0';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(String(stat[0]).toUpperCase(), x + statW / 2, y + 58);
  });

  y += 100;
  const grad = ctx.createLinearGradient(60, y, width - 60, y);
  grad.addColorStop(0, '#f0c14b');
  grad.addColorStop(0.5, '#f5d76e');
  grad.addColorStop(1, '#e8b923');
  ctx.fillStyle = grad;
  roundRect(ctx, 60, y, width - 120, 92, 14);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.font = '40px system-ui, sans-serif';
  ctx.fillText(result.emoji || '🏆', 82, y + 60);
  ctx.fillStyle = '#0b1c28';
  ctx.font = 'bold 24px Georgia, "Times New Roman", serif';
  ctx.fillText(result.tierLabel || 'Result', 150, y + 42);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(11,28,40,0.7)';
  wrapText(ctx, result.tierMessage || '', 150, y + 66, width - 320, 18, 1);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0b1c28';
  ctx.font = 'bold 40px Georgia, "Times New Roman", serif';
  ctx.fillText(`${percentage}%`, width - 82, y + 58);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#6b7780';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(
    `Marks: ${formatMarks(result.scoredMarks)} / ${formatMarks(result.totalMarks)} · Result published`,
    width / 2,
    y + 130
  );

  const link = document.createElement('a');
  link.download = `${fileBase}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Shareable result certificate: Print A4 or download screenshot.
 */
export function ResultCertificateModal({
  open,
  onClose,
  result,
  student,
  kindLabel = 'Online assessment result',
  activityLabel = 'Assessment',
  dateValue,
}) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || !result) return null;

  const percentage = Math.round(Number(result.percentage) || 0);
  const resultDate = formatDate(
    dateValue || result.assessmentDate || result.practiceDate || result.submittedAt
  );
  const fileBase = `${(result.title || 'result').replace(/[^\w\-]+/g, '_').slice(0, 40)}_result`;

  async function handleScreenshot() {
    setBusy('screenshot');
    setError('');
    try {
      await downloadCertificatePng({
        result,
        student,
        kindLabel,
        activityLabel,
        dateValue,
        fileBase,
      });
    } catch (err) {
      setError('Could not capture screenshot. Try Print A4 instead.');
    } finally {
      setBusy('');
    }
  }

  function handlePrint() {
    setError('');
    document.body.classList.add('printing-result-certificate');
    const cleanup = () => {
      document.body.classList.remove('printing-result-certificate');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    window.setTimeout(cleanup, 1000);
  }

  return (
    <div
      className="result-certificate-modal fixed inset-0 z-[80] flex items-end justify-center bg-ink-900/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot result"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-xl flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3 print:hidden">
          <p className="text-sm font-semibold text-white">Screenshot result</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-[#e8f2f8] p-3 sm:p-5 print:bg-white print:p-0">
          <div className="result-certificate-print mx-auto w-full max-w-lg rounded-xl bg-white px-5 py-6 shadow-lift sm:px-7 sm:py-8">
            <div className="flex flex-col items-center text-center">
              <img
                src={CERTIFICATE_LOGO}
                alt=""
                className="h-24 w-24 object-contain"
              />
              <p className="mt-4 font-display text-base font-bold text-ink-900 sm:text-lg">
                {result.title}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-900/50">
                {kindLabel}
                {resultDate ? ` · ${resultDate}` : ''}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoCell label="Name" value={student?.fullName} />
              <InfoCell label="Email" value={student?.email} />
              <InfoCell label="Mobile / WhatsApp" value={student?.phone} />
              <InfoCell label="Class / Section" value={classLabel(student)} />
              <InfoCell label="Roll number" value={student?.rollNumber} />
              <InfoCell label="School" value={student?.schoolName} />
              <InfoCell label={activityLabel} value={result.title} />
              <InfoCell label="Subject" value={result.subject} />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <StatCell label="Questions" value={result.questionCount ?? '—'} />
              <StatCell label="Correct" value={result.correctCount ?? 0} />
              <StatCell label="Incorrect" value={result.wrongCount ?? 0} />
              <StatCell label="Unattempted" value={result.unansweredCount ?? 0} />
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#f0c14b] via-[#f5d76e] to-[#e8b923] px-4 py-3.5 text-ink-900 shadow-soft">
              <span className="text-3xl leading-none" role="img" aria-hidden>
                {result.emoji || '🏆'}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-display text-base font-extrabold leading-tight sm:text-lg">
                  {result.tierLabel}
                </p>
                {result.tierMessage ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-900/70">{result.tierMessage}</p>
                ) : null}
              </div>
              <p className="shrink-0 font-display text-2xl font-extrabold sm:text-3xl">
                {percentage}%
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-ink-900/55">
              Marks: {formatMarks(result.scoredMarks)} / {formatMarks(result.totalMarks)}
              {' · Result published'}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-center text-sm text-red-100 print:hidden">{error}</p>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2 print:hidden sm:gap-3">
          <Button
            variant="primary"
            className="bg-[#1e3a5f] hover:bg-[#162c48]"
            onClick={handlePrint}
            disabled={Boolean(busy)}
          >
            <Printer className="h-4 w-4" />
            Print A4
          </Button>
          <Button
            variant="secondary"
            loading={busy === 'screenshot'}
            onClick={handleScreenshot}
            disabled={busy === 'screenshot'}
          >
            <Camera className="h-4 w-4" />
            Screenshot
          </Button>
        </div>
      </div>
    </div>
  );
}
