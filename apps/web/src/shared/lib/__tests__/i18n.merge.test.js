import { describe, it, expect, vi } from 'vitest';

// CMS messages with site_name and contact_info overrides
vi.mock('../i18n.generated.js', () => ({
  cmsMessages: {
    en: { siteName: 'Puxijie CMS', contactInfo: { email: 'cms@test.com' } },
    fr: { siteName: 'Puxijie CMS FR' },
    vi: {},
  },
}));

import { t, tv, isSupportedLocale, DEFAULT_LOCALE } from '../i18n.js';

describe('i18n merge layer', () => {
  it('overrides hardcoded siteName with CMS value', () => {
    const result = t('en', 'siteName');
    expect(result).toBe('Puxijie CMS');
  });

  it('overrides FR locale with CMS value', () => {
    const result = t('fr', 'siteName');
    expect(result).toBe('Puxijie CMS FR');
  });

  it('falls back to hardcoded values when CMS has no override', () => {
    // 'vi' has empty CMS messages, so should use hardcoded values
    const result = t('vi', 'siteName');
    // Should be hardcoded value
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('deep merges nested objects like contactInfo', () => {
    const result = t('en', 'contactInfo.email');
    expect(result).toBe('cms@test.com');
  });

  it('handles missing CMS messages gracefully', () => {
    // Key that only exists in hardcoded data
    const result = t('en', 'nav.home');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('t() function', () => {
  it('returns key when lookup fails completely', () => {
    const result = t('en', 'nonexistent.deeply.nested.key');
    expect(result).toContain('nonexistent');
  });

  it('supports all 3 locales', () => {
    for (const loc of ['en', 'fr', 'vi']) {
      const result = t(loc, 'nav.home');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });
});

describe('tv() function', () => {
  it('returns value at keyPath when found', () => {
    const result = tv('en', 'nav.home');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns fallback when keyPath not found', () => {
    const fallback = { custom: 'fallback object' };
    const result = tv('en', 'nonexistent.key', fallback);
    expect(result).toBe(fallback);
  });

  it('returns null fallback by default when key not found', () => {
    const result = tv('en', 'nonexistent.key');
    expect(result).toBeNull();
  });
});

describe('isSupportedLocale', () => {
  it('recognizes en, fr, vi', () => {
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('fr')).toBe(true);
    expect(isSupportedLocale('vi')).toBe(true);
  });

  it('rejects unsupported locales', () => {
    expect(isSupportedLocale('de')).toBe(false);
    expect(isSupportedLocale('zh')).toBe(false);
  });
});

describe('DEFAULT_LOCALE', () => {
  it('is en', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });
});
