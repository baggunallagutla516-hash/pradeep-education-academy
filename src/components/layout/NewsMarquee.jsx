import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '../../api/adminApi';

function NewsItem({ item }) {
  const text = String(item.text || '').trim();
  if (!text) return null;

  const classNames =
    'inline-flex shrink-0 items-center whitespace-nowrap px-5 text-sm font-semibold text-white/95' +
    (item.link ? ' cursor-pointer transition hover:text-ember-400' : ' cursor-default');

  if (item.link) {
    return (
      <Link to={item.link} className={classNames} title="Open related page">
        {text}
      </Link>
    );
  }

  return <span className={classNames}>{text}</span>;
}

export function NewsMarquee() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    contentApi
      .news()
      .then((res) => {
        if (!active) return;
        setItems(res.data.data.news || []);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const entries = useMemo(
    () =>
      (items || [])
        .map((n) => ({
          id: n.id,
          text: String(n.text || '').trim(),
          link: String(n.link || '').trim(),
        }))
        .filter((n) => n.text),
    [items]
  );

  if (!entries.length) return null;

  // Build a long enough half, then duplicate it for a seamless -50% loop.
  let half = [...entries];
  while (half.length < 8) {
    half = half.concat(entries);
  }
  const strip = [...half, ...half];

  return (
    <div
      className="relative z-30 flex w-full items-center justify-center border-y border-white/10 bg-black/45 py-2.5 backdrop-blur-sm"
      role="region"
      aria-label="Academy news ticker"
    >
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.16em] text-ember-400 sm:left-4 sm:text-xs">
        News
      </span>

      <div className="news-marquee-track mx-auto w-full max-w-xl overflow-hidden px-12 sm:max-w-2xl sm:px-16">
        <div className="news-marquee-strip flex w-max items-center">
          {strip.map((item, index) => (
            <span key={`${item.id}-${index}`} className="inline-flex items-center">
              <NewsItem item={item} />
              <span className="text-white/30" aria-hidden>
                •
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
