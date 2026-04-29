import { describe, it, expect, vi, beforeEach } from 'vitest';

import { trackPageview } from '../analytics.js';

describe('trackPageview', () => {
  let mockBeacon;
  let mockFetch;
  let storage;

  beforeEach(() => {
    storage = {};
    mockBeacon = vi.fn();
    mockFetch = vi.fn(() => Promise.resolve());

    vi.stubGlobal('navigator', {
      sendBeacon: mockBeacon,
      userAgent: 'Mozilla/5.0 Test',
    });
    vi.stubGlobal('document', { referrer: 'https://google.com' });
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-1234' });
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('sessionStorage', {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => { storage[key] = value; },
    });
  });

  it('uses sendBeacon when available', () => {
    mockBeacon.mockReturnValue(true);
    trackPageview('/products/qw-g34');

    expect(mockBeacon).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockBeacon.mock.calls[0][1]);
    expect(body.path).toBe('/products/qw-g34');
    expect(body.referrer).toBe('https://google.com');
    expect(body.session_id).toBe('test-uuid-1234');
  });

  it('falls back to fetch when sendBeacon unavailable', () => {
    vi.stubGlobal('navigator', { userAgent: 'Test' });

    trackPageview('/about');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    expect(mockFetch.mock.calls[0][1].keepalive).toBe(true);
  });

  it('reuses session ID across calls', () => {
    mockBeacon.mockReturnValue(true);
    trackPageview('/page1');
    trackPageview('/page2');

    const id1 = JSON.parse(mockBeacon.mock.calls[0][1]).session_id;
    const id2 = JSON.parse(mockBeacon.mock.calls[1][1]).session_id;
    expect(id1).toBe(id2);
  });

  it('generates fallback session ID without crypto.randomUUID', () => {
    vi.stubGlobal('crypto', {});
    mockBeacon.mockReturnValue(true);

    trackPageview('/test');

    const payload = JSON.parse(mockBeacon.mock.calls[0][1]);
    expect(payload.session_id).toBeTruthy();
    expect(payload.session_id).toContain('-');
  });
});
