import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { mediaUrl } from '../../utils/media';
import { getSiteLogoUrl, subscribeSiteLogo } from '../../utils/siteLogo';

const DefaultMark = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
    <path
      d="M5 17V7l7 5 7-5v10"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="5.5" r="1.6" fill="#E8852F" />
  </svg>
);

const DEFAULT_LOGO = '/logo.png';

/** Shared site mark: uploaded logo when set, otherwise the academy seal. */
export function SiteLogoMark({
  className,
  boxClassName,
  iconClassName = 'h-6 w-6',
  fallbackTone = 'lagoon',
}) {
  const [logoUrl, setLogoUrl] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getSiteLogoUrl().then((url) => {
      if (active) {
        setLogoUrl(url || '');
        setImgFailed(false);
      }
    });
    return subscribeSiteLogo((url) => {
      if (active) {
        setLogoUrl(url || '');
        setImgFailed(false);
      }
    });
  }, []);

  const sizeClass = boxClassName || 'h-11 w-11';
  const resolvedSrc = logoUrl ? mediaUrl(logoUrl) : DEFAULT_LOGO;

  if (!imgFailed) {
    return (
      <span
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full p-0.5 shadow-lift ring-1 ring-[#c9a227]/40',
          'bg-[radial-gradient(circle_at_50%_42%,#fffaf0_0%,#f6ebcf_52%,#ead7a8_100%)]',
          sizeClass,
          className
        )}
      >
        <img
          src={resolvedSrc}
          alt=""
          className="h-full w-full object-contain"
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  const toneClass =
    fallbackTone === 'ink'
      ? 'bg-ink-900 text-white'
      : fallbackTone === 'ember'
        ? 'bg-ember-500 text-white'
        : 'bg-lagoon-600 text-white';

  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-2xl shadow-lift',
        toneClass,
        sizeClass,
        className
      )}
    >
      <DefaultMark className={iconClassName} />
    </span>
  );
}
