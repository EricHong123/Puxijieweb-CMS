import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from './analytics.js';

// Tracks pageviews on route changes within the SPA.
// Place once near the top of your component tree.
export function useAnalytics() {
  const location = useLocation();
  const prev = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prev.current) {
      prev.current = location.pathname;
      trackPageview(location.pathname);
    }
  }, [location.pathname]);

  // Track initial page load
  useEffect(() => {
    trackPageview(location.pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
