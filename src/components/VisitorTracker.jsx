import { useEffect, useRef } from 'react';
import { visitorApi } from '../api/visitorApi';

const TRACK_KEY = 'ps_visitor_track_requested';

/**
 * Tracks a unique visitor once per browser day via httpOnly cookie on the API.
 * sessionStorage avoids double-count races under React StrictMode.
 * Failures are logged; they must not break page rendering.
 */
export function VisitorTracker() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(TRACK_KEY)) {
      return;
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(TRACK_KEY, '1');
    }

    visitorApi.track().catch((err) => {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(TRACK_KEY);
      }
      console.error('[VisitorTracker]', err.response?.data?.message || err.message);
    });
  }, []);

  return null;
}
