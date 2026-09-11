import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Newspaper,
  FileStack,
  GraduationCap,
  PenLine,
  ScrollText,
  ClipboardCheck,
  Settings,
  Users,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { SITE } from '../../constants/site';
import { getErrorMessage } from '../../utils/errors';
import { cn } from '../../utils/cn';
import { SidebarCollapseToggle } from '../layout/SidebarCollapseToggle';
import { SiteLogoMark } from '../layout/SiteLogoMark';
const STORAGE_KEY = 'admin-sidebar-expanded';

const links = [
  { to: '/admin', label: 'DASHBOARD', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'STUDENTS', icon: Users },
  { to: '/admin/educators', label: 'EDUCATORS', icon: GraduationCap },
  { to: '/admin/contact-queries', label: 'CONTACT', icon: MessageSquare },
  { to: '/admin/worksheets', label: 'WORKSHEETS', icon: FileStack },
  { to: '/admin/unit-tests', label: 'EXAMS', icon: PenLine },
  { to: '/admin/cets', label: 'C.E.T.', icon: ScrollText },
  { to: '/admin/assessments', label: 'ONLINE ASSESSMENTS', icon: ClipboardCheck },
  { to: '/admin/dpps', label: 'D.P.P.', icon: ClipboardList },
  { to: '/admin/quizzes', label: 'QUIZ', icon: HelpCircle },
  { to: '/admin/slip-tests', label: 'SLIP TESTS', icon: FileText },
  { to: '/admin/news', label: 'NEWS', icon: Newspaper },
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
      {expanded ? (
        <span className="truncate text-sm font-extrabold uppercase tracking-wide">{label}</span>
      ) : null}
    </NavLink>
  );
}

export function AdminSidebar({ expanded, onExpandedChange }) {
  const { logout, admin } = useAdminAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      window.alert(getErrorMessage(err, 'Could not log out.'));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-ink-900/8 bg-[#eef2f1] py-3 transition-[width] duration-200 ease-out',
        expanded ? 'w-64 px-3' : 'w-14 items-center'
      )}
    >
      <div className={cn('mb-3 flex items-center', expanded ? 'gap-2.5 px-1' : 'justify-center')}>
        <Link
          to="/admin"
          title="Admin"
          aria-label="Admin dashboard"
          className="transition hover:scale-[1.03]"
        >
          <SiteLogoMark
            fallbackTone="ink"
            boxClassName="h-10 w-10 rounded-xl shadow-soft"
            iconClassName="h-5 w-5"
          />
        </Link>
        {expanded ? (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-extrabold text-ink-900">Admin</p>
            <p className="truncate text-[11px] text-ink-900/50">{admin?.fullName || SITE.name}</p>
          </div>
        ) : null}
      </div>

      <SidebarCollapseToggle expanded={expanded} onExpandedChange={onExpandedChange} />

      <nav
        aria-label="Admin menu"
        className={cn('flex flex-1 flex-col gap-2', expanded ? '' : 'items-center')}
      >
        {links.map((link) => (
          <RailLink key={link.to} {...link} expanded={expanded} />
        ))}
      </nav>

      <div className={cn('mt-auto flex flex-col gap-2', expanded ? '' : 'items-center')}>
        <RailLink to="/admin/settings" label="SETTINGS" icon={Settings} expanded={expanded} />
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
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.85} />
          {expanded ? <span className="text-sm font-semibold">Logout</span> : null}
        </button>
      </div>
    </aside>
  );
}

export function useAdminSidebarExpanded() {
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
