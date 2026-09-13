import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function scrollPageToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}

/** Reset scroll when a route opens, so nav links don't land mid-page. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollPageToTop();
  }, [pathname]);

  return null;
}
