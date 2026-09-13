import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SITE } from '../../constants/site';
import { getErrorMessage } from '../../utils/errors';
import { cn } from '../../utils/cn';
import { BrandMark } from './BrandMark';
import { scrollPageToTop } from './ScrollToTop';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={() => {
        scrollPageToTop();
        onClick?.();
      }}
      className={({ isActive }) =>
        cn(
          'rounded-xl px-3 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-lagoon-100 text-lagoon-800'
            : 'text-ink-800/80 hover:bg-white hover:text-lagoon-700'
        )
      }
    >
      {label}
    </NavLink>
  );
}

export function Navbar() {
  const { isAuthenticated, student, logout, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function handleLogout() {
    setLogoutError('');
    setLoggingOut(true);
    try {
      await logout();
      setOpen(false);
      navigate('/');
    } catch (err) {
      setLogoutError(getErrorMessage(err, 'Could not log out. Please try again.'));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/8 bg-sand-50/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <BrandMark compact />

        <div className="hidden items-center gap-2 md:flex">
          {isLoading ? (
            <span className="text-sm text-ink-900/50">Checking session…</span>
          ) : isAuthenticated ? (
            <>
              <Link
                to="/account"
                className="inline-flex max-w-[180px] items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-800 shadow-soft"
              >
                <UserRound className="h-4 w-4 text-lagoon-600" />
                <span className="truncate">{student?.fullName?.split(' ')[0]}</span>
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout} loading={loggingOut}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <nav className="flex items-center gap-1" aria-label="Primary">
              {publicLinks.map((link) => (
                <NavItem key={link.to + link.label} to={link.to} label={link.label} />
              ))}
            </nav>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-900/10 bg-white md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {logoutError ? (
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 lg:px-8">
          <Alert type="error" title="Logout failed" onClose={() => setLogoutError('')}>
            {logoutError}
          </Alert>
        </div>
      ) : null}

      {open ? (
        <div className="border-t border-ink-900/8 bg-sand-50 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {!isAuthenticated
              ? publicLinks.map((link) => (
                  <NavItem
                    key={`m-${link.to}-${link.label}`}
                    to={link.to}
                    label={link.label}
                    onClick={() => setOpen(false)}
                  />
                ))
              : null}
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <p className="px-3 text-sm text-ink-900/60">
                  Signed in as <strong>{student?.fullName}</strong>
                </p>
                <Link
                  to="/dashboard"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-800"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/account"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-800"
                  onClick={() => setOpen(false)}
                >
                  My Account
                </Link>
                <Button variant="secondary" onClick={handleLogout} loading={loggingOut}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-xl px-3 py-2 text-center text-sm font-semibold text-lagoon-700"
                onClick={() => setOpen(false)}
              >
                WhatsApp {SITE.whatsappNumber}
              </a>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
