import { Outlet, useLocation } from 'react-router-dom';
import { StudentSidebar, useSidebarExpanded } from './StudentSidebar';
import { WhatsAppFab } from '../WhatsAppFab';
import { VisitorTracker } from '../VisitorTracker';
import { cn } from '../../utils/cn';

function isQuizSession(pathname) {
  return /^\/quizzes\/[^/]+\/(attempt|result|classroom)$/.test(pathname);
}

export function StudentLayout() {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useSidebarExpanded();
  const quizFocus = isQuizSession(pathname);

  if (quizFocus) {
    return (
      <div className="min-h-screen">
        <VisitorTracker />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StudentSidebar expanded={expanded} onExpandedChange={setExpanded} />
      <VisitorTracker />
      <div
        className={cn(
          'min-h-screen transition-[padding] duration-200 ease-out',
          expanded ? 'pl-64' : 'pl-14'
        )}
      >
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
      <WhatsAppFab />
    </div>
  );
}
