import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { NewsMarquee } from './NewsMarquee';
import { WhatsAppFab } from '../WhatsAppFab';
import { VisitorTracker } from '../VisitorTracker';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <NewsMarquee />
      <VisitorTracker />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
