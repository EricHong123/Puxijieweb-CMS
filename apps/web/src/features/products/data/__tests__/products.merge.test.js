import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the generated data BEFORE importing the merge module
vi.mock('../products.generated.js', () => ({
  cmsProducts: [
    {
      slug: 'qw-g34',
      name: 'QW-G34 Updated',
      category: 'waterproof_bt',
      downloads: [{ title: 'New Spec PDF', url: '/specs/updated.pdf' }],
    },
    {
      slug: 'new-product',
      name: 'New CMS Product',
      category: 'earbuds',
      image: [{ src: 'https://supabase.co/img.webp', w: 800, h: 800, srcset: 'https://supabase.co/img.webp 800w' }],
      downloads: [{ title: 'Datasheet', url: '/specs/new.pdf' }],
      features: ['Feature A', 'Feature B'],
      benefits: ['Benefit 1'],
    },
  ],
}));

// Mock the hardcoded data module
vi.mock('../products.data.js', () => {
  const mockImage = { src: '/img.webp', w: 800, h: 800, srcset: '/img.webp 240w, /img.webp 800w' };
  return {
    rawProducts: [
      {
        id: 'qw-g34',
        name: 'QW-G34 Original',
        category: 'waterproof_bt',
        image: [mockImage, mockImage],
        downloads: [{ title: 'Old Spec (PDF)', url: '/specs/old.pdf' }],
        features: ['Old Feature'],
        benefits: ['Old Benefit'],
        ipxRating: 'IPX7',
      },
    ],
    excelProductData: {
      'qw-g34': { sheetVerified: true, moqNote: 'MOQ 500' },
    },
    buildSheetSpecs: () => ({}),
    buildPackagingSpecs: () => ({}),
  };
});

import { products, getProductById, getProductsByCategory, getRelatedProducts } from '../products.js';

describe('products merge layer', () => {
  it('contains both hardcoded and CMS-only products', () => {
    expect(products).toHaveLength(2);
  });

  it('overrides hardcoded product with CMS data', () => {
    const prod = products.find((p) => p.id === 'qw-g34');
    expect(prod).toBeDefined();
    // CMS overrides should take precedence
    expect(prod.name).toBe('QW-G34 Updated');
  });

  it('preserves hardcoded fields not overridden by CMS', () => {
    const prod = products.find((p) => p.id === 'qw-g34');
    // ipxRating not in CMS override, so keep original
    expect(prod.ipxRating).toBe('IPX7');
  });

  it('overrides downloads from CMS', () => {
    const prod = products.find((p) => p.id === 'qw-g34');
    expect(prod.downloads).toHaveLength(1);
    expect(prod.downloads[0].title).toBe('New Spec PDF');
  });

  it('includes new CMS-only products', () => {
    const prod = products.find((p) => p.id === 'new-product');
    expect(prod).toBeDefined();
    expect(prod.name).toBe('New CMS Product');
    expect(prod.category).toBe('earbuds');
    expect(prod.downloads).toHaveLength(1);
  });

  it('applies transformation pipeline (sheetSpecs, packagingSpecs, procurementNotes)', () => {
    const prod = products.find((p) => p.id === 'qw-g34');
    expect(prod.sheetSpecs).toBeDefined();
    expect(prod.packagingSpecs).toBeDefined();
    expect(Array.isArray(prod.procurementNotes)).toBe(true);
    expect(prod.procurementNotes.length).toBeGreaterThanOrEqual(3);
  });

  it('merges Excel data', () => {
    const prod = products.find((p) => p.id === 'qw-g34');
    expect(prod.sheetVerified).toBe(true);
    expect(prod.moqNote).toBe('MOQ 500');
  });
});

describe('getProductById', () => {
  it('finds product by ID', () => {
    const prod = getProductById('qw-g34');
    expect(prod).toBeDefined();
    expect(prod.name).toBe('QW-G34 Updated');
  });

  it('returns undefined for unknown ID', () => {
    expect(getProductById('nonexistent')).toBeUndefined();
  });
});

describe('getProductsByCategory', () => {
  it('returns all products for null/All category', () => {
    expect(getProductsByCategory(null)).toHaveLength(2);
    expect(getProductsByCategory('All')).toHaveLength(2);
  });

  it('filters by category', () => {
    const earbuds = getProductsByCategory('earbuds');
    expect(earbuds).toHaveLength(1);
    expect(earbuds[0].id).toBe('new-product');
  });

  it('returns empty array for category with no matches', () => {
    expect(getProductsByCategory('specialty')).toHaveLength(0);
  });
});
