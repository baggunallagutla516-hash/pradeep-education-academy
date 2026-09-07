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

/** Shared site mark: uploaded logo when set, otherwise the default icon. */
export function SiteLogoMark({
  className,
  boxClassName,
  iconClassName = 'h-6 w-6',
  fallbackTone = 'lagoon',
}) {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    let active = true;
    getSiteLogoUrl().then((url) => {
      if (active) setLogoUrl(url || '');
    });
    return subscribeSiteLogo((url) => {
      if (active) setLogoUrl(url || '');
    });
  }, []);

  const sizeClass = boxClassName || 'h-11 w-11';

  if (logoUrl) {
    return (
      <span
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-ink-900/8',
          sizeClass,
          className
        )}
      >
        <img src={mediaUrl(logoUrl)} alt="" className="h-full w-full object-contain p-0.5" />
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
