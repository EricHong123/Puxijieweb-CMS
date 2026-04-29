// Self-hosted analytics tracking.
// Sends pageview events to the CMS analytics API.
// Uses sessionStorage for session_id persistence.

const STORAGE_KEY = 'puxijie_session_id';
const ANALYTICS_ENDPOINT = 'https://api.puxijietech.com/api/v1/analytics/track';

function getSessionId() {
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function trackPageview(path) {
  const payload = {
    path,
    referrer: document.referrer || '',
    session_id: getSessionId(),
    user_agent: navigator.userAgent || '',
  };

  // Use sendBeacon for reliability when available, fallback to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(payload));
  } else {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently ignore tracking failures — never break the user experience
    });
  }
}
