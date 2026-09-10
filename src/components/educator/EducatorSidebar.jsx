import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FileStack,
  LayoutDashboard,
  LogOut,
  PenLine,
  ScrollText,
  UserRound,
} from 'lucide-react';
import { useEducatorAuth } from '../../context/EducatorAuthContext';
import { SITE } from '../../constants/site';
import { getErrorMessage } from '../../utils/errors';
import { cn } from '../../utils/cn';
import { SidebarCollapseToggle } from '../layout/SidebarCollapseToggle';
import { SiteLogoMark } from '../layout/SiteLogoMark';

const STORAGE_KEY = 'educator-sidebar-expanded';

const links = [
  { to: '/educator/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/educator/worksheets', label: 'Worksheets', icon: FileStack },
  { to: '/educator/unit-tests', label: 'Unit tests', icon: PenLine },
  { to: '/educator/cets', label: 'C.E.T.', icon: ScrollText },
  { to: '/educator/account', label: 'My account', icon: UserRound },
];

function RailLink({ to, label, icon: Icon, end, expanded }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={expanded ? undefined : label}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center rounded-xl transition',
          expanded ? 'w-full gap-3 px-3' : 'w-10 justify-center',
          isActive
            ? 'bg-lagoon-100 text-lagoon-700'
            : 'text-ink-800/55 hover:bg-ink-900/5 hover:text-ink-800'
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.85} aria-hidden />
      {expanded ? <span className="truncate text-sm font-semibold">{label}</span> : null}
    </NavLink>
  );
}

export function EducatorSidebar({ expanded, onExpandedChange }) {
  const { logout, educator } = useEducatorAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not log out. Please try again.'));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-ink-900/8 bg-[#eef2f1] py-3 transition-[width] duration-200 ease-out',
        expanded ? 'w-56 px-3' : 'w-14 items-center'
      )}
    >
      <div className={cn('mb-3 flex items-center', expanded ? 'gap-2.5 px-1' : 'justify-center')}>
        <Link
          to="/educator/dashboard"
          title={SITE.name}
          aria-label={SITE.name}
          className="transition hover:scale-[1.03]"
        >
          <SiteLogoMark
            fallbackTone="ember"
            boxClassName="h-10 w-10 rounded-xl shadow-soft"
            iconClassName="h-5 w-5"
          />
        </Link>
        {expanded ? (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-extrabold leading-tight text-ink-900">
              Educator portal
            </p>
            <p className="truncate text-[11px] text-ink-900/50">
              {educator?.fullName || SITE.name}
            </p>
          </div>
        ) : null}
      </div>

      <SidebarCollapseToggle expanded={expanded} onExpandedChange={onExpandedChange} />

      <nav
        aria-label="Educator menu"
        className={cn('flex flex-1 flex-col gap-2', expanded ? '' : 'items-center')}
      >
        {links.map((link) => (
          <RailLink key={link.to} {...link} expanded={expanded} />
        ))}
      </nav>

      <div className={cn('mt-auto flex flex-col gap-2', expanded ? '' : 'items-center')}>
        <button
          type="button"
          title="Logout"
          aria-label="Logout"
          disabled={loggingOut}
          onClick={handleLogout}
          className={cn(
            'flex h-10 items-center rounded-xl text-ink-800/55 transition hover:bg-ink-900/5 hover:text-ink-800 disabled:opacity-50',
            expanded ? 'w-full gap-3 px-3' : 'w-10 justify-center'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.85} aria-hidden />
          {expanded ? <span className="text-sm font-semibold">Logout</span> : null}
        </button>
      </div>
    </aside>
  );
}

export function useEducatorSidebarExpanded() {
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, expanded ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [expanded]);

  return [expanded, setExpanded];
}
