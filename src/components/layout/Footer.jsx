import { Link } from 'react-router-dom';
import { SITE } from '../../constants/site';
import { BrandMark } from './BrandMark';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink-900/8 bg-ink-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <BrandMark tone="dark" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            A student learning space for lessons, practice, exams, and progress — built for clarity
            and consistent growth.
          </p>
        </div>

        <div>
          <h2 className="font-display text-base font-bold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link className="hover:text-white" to="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/contact">
                Contact
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/register">
                Student registration
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/login">
                Student login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-base font-bold">Reach out</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <a
                className="hover:text-white"
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp: {SITE.whatsappNumber}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`mailto:${SITE.supportEmail}`}>
                {SITE.supportEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p>Built for students who want steady progress.</p>
        </div>
      </div>
    </footer>
  );
}
