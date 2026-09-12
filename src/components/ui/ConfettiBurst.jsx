import { useEffect, useMemo, useState } from 'react';

const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#10b981', '#f97316'];

function makePieces(count = 48) {
  return Array.from({ length: count }, (_, index) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const duration = 2.2 + Math.random() * 1.6;
    const size = 6 + Math.random() * 8;
    const rotate = Math.random() * 360;
    const drift = (Math.random() - 0.5) * 120;
    const color = COLORS[index % COLORS.length];
    const round = Math.random() > 0.55;
    return { id: index, left, delay, duration, size, rotate, drift, color, round };
  });
}

/**
 * Short celebratory sprinkle/confetti burst for post-submit result screens.
 */
export function ConfettiBurst({ active = true, durationMs = 4200 }) {
  const pieces = useMemo(() => makePieces(), []);
  const [visible, setVisible] = useState(Boolean(active));

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [active, durationMs]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -12vh, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift), 110vh, 0) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          style={{
            position: 'absolute',
            top: '-8vh',
            left: `${piece.left}%`,
            width: piece.round ? piece.size : piece.size * 0.55,
            height: piece.size,
            borderRadius: piece.round ? '999px' : '2px',
            background: piece.color,
            opacity: 0.95,
            ['--drift']: `${piece.drift}px`,
            animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s forwards`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
