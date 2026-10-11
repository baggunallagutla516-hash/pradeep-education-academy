import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { NewsMarquee } from './NewsMarquee';
import { WhatsAppFab } from '../WhatsAppFab';
import { VisitorTracker } from '../VisitorTracker';
import { useAuth } from '../../context/AuthContext';

function isLoggedInQuizIntro(pathname) {
  return /^\/quizzes\/[^/]+$/.test(pathname);
}

export function MainLayout() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const quizFocus = isAuthenticated && isLoggedInQuizIntro(pathname);

  if (quizFocus) {
    return (
      <div className="flex min-h-screen flex-col">
        <VisitorTracker />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

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
