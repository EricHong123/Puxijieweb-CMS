import { describe, it, expect } from 'vitest';
import { createProductSchema, updateProductSchema, productTranslationSchema } from '../product';

describe('productTranslationSchema', () => {
  it('accepts a valid translation', () => {
    const result = productTranslationSchema.safeParse({
      locale: 'en',
      name: 'QW-G34',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid locale', () => {
    const result = productTranslationSchema.safeParse({
      locale: 'de',
      name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = productTranslationSchema.safeParse({
      locale: 'en',
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all optional fields', () => {
    const result = productTranslationSchema.safeParse({
      locale: 'vi',
      name: 'Sản phẩm',
      subtitle: 'Phụ đề',
      material: 'ABS',
      weight: '200g',
      dimensions: '10x5x3cm',
      waterproof_depth: 'IPX7',
      frequency_range: '20Hz-20kHz',
      features: ['Bluetooth 5.3', 'ANC'],
      benefits: ['Long battery life'],
      procurement_notes: ['MOQ 100'],
      description_html: '<p>Description</p>',
    });
    expect(result.success).toBe(true);
  });

  it('defaults arrays to empty', () => {
    const result = productTranslationSchema.safeParse({
      locale: 'en',
      name: 'Test',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.features).toEqual([]);
      expect(result.data.benefits).toEqual([]);
      expect(result.data.procurement_notes).toEqual([]);
    }
  });
});

describe('createProductSchema', () => {
  const validInput = {
    slug: 'qw-g34',
    category: 'waterproof_bt',
    sort_order: 0,
    translations: [{ locale: 'en', name: 'QW-G34' }],
  };

  it('accepts valid product', () => {
    const result = createProductSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug format', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      slug: 'INVALID SLUG!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      category: 'invalid_category',
    });
    expect(result.success).toBe(false);
  });

  it('requires at least one translation', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      translations: [],
    });
    expect(result.success).toBe(false);
  });

  it('allows up to 3 translations', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      translations: [
        { locale: 'en', name: 'EN' },
        { locale: 'fr', name: 'FR' },
        { locale: 'vi', name: 'VI' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional specs', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      specs: { ipx_rating: 'IPX7', battery_life: '10h' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts downloads array', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      downloads: [
        { title: 'Spec Sheet (PDF)', url: '/specs/qw-g34.pdf' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects download with empty title', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      downloads: [{ title: '', url: '/file.pdf' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects download with empty url', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      downloads: [{ title: 'File', url: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('defaults downloads to empty array', () => {
    const result = createProductSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.downloads).toEqual([]);
    }
  });
});

describe('updateProductSchema', () => {
  it('allows partial update with just slug', () => {
    const result = updateProductSchema.safeParse({ slug: 'new-slug' });
    expect(result.success).toBe(true);
  });

  it('allows empty object', () => {
    const result = updateProductSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('allows partial downloads update', () => {
    const result = updateProductSchema.safeParse({
      downloads: [{ title: 'New PDF', url: '/new.pdf' }],
    });
    expect(result.success).toBe(true);
  });
});
