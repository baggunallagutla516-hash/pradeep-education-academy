import { Outlet } from 'react-router-dom';
import { StudentSidebar, useSidebarExpanded } from './StudentSidebar';
import { WhatsAppFab } from '../WhatsAppFab';
import { VisitorTracker } from '../VisitorTracker';
import { cn } from '../../utils/cn';

export function StudentLayout() {
  const [expanded, setExpanded] = useSidebarExpanded();

  return (
    <div className="min-h-screen">
      <StudentSidebar expanded={expanded} onExpandedChange={setExpanded} />
      <VisitorTracker />
      <div
        className={cn(
          'min-h-screen transition-[padding] duration-200 ease-out',
          expanded ? 'pl-56' : 'pl-14'
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
