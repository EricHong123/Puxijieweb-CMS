import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module
const mockFrom = vi.fn();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockSingle = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
    storage: {
      from: () => ({
        download: vi.fn(),
        upload: vi.fn(),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://storage.supabase.co/test.webp' } }),
      }),
    },
  }),
}));

// Mock fs
const mockWriteFile = vi.fn();
const mockMkdir = vi.fn();

vi.mock('fs', () => ({
  writeFileSync: mockWriteFile,
  mkdirSync: mockMkdir,
}));

vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return { ...actual, join: (...args: string[]) => args.join('/') };
});

describe('codegen — data transformation (simulated)', () => {
  beforeEach(() => {
    mockWriteFile.mockClear();
    mockMkdir.mockClear();
    mockFrom.mockClear();
    mockSingle.mockClear();
  });

  it('generates products with full image objects when variants are processed', () => {
    // Simulate the image object generation logic from codegen.mjs
    const images = [{
      media_id: 'm1',
      sort_order: 0,
      is_primary: true,
      media: {
        variants: {
          processed: true,
          publicUrl: 'https://storage.supabase.co/img.webp',
          originalWidth: 1600,
          originalHeight: 1200,
          variants: {
            240: { url: 'https://storage.supabase.co/img-240w.webp', width: 240, height: 180 },
            480: { url: 'https://storage.supabase.co/img-480w.webp', width: 480, height: 360 },
            800: { url: 'https://storage.supabase.co/img-800w.webp', width: 800, height: 600 },
          },
        },
      },
    }];

    const imgObjects = images.map((img) => {
      const v = img.media?.variants || {};
      if (v.processed && v.variants) {
        const variantEntries = Object.entries(v.variants);
        const srcset = variantEntries
          .sort((a: any, b: any) => a[1].width - b[1].width)
          .map(([, d]: any) => `${d.url} ${d.width}w`)
          .join(', ');
        return {
          src: v.publicUrl,
          w: v.originalWidth || 1600,
          h: v.originalHeight || 1600,
          srcset,
        };
      }
      return v.publicUrl || '';
    }).filter((img: any) => img !== '');

    expect(imgObjects).toHaveLength(1);
    expect(imgObjects[0].src).toBe('https://storage.supabase.co/img.webp');
    expect(imgObjects[0].w).toBe(1600);
    expect(imgObjects[0].h).toBe(1200);
    expect(imgObjects[0].srcset).toContain('240w');
    expect(imgObjects[0].srcset).toContain('480w');
    expect(imgObjects[0].srcset).toContain('800w');
  });

  it('falls back to plain URL when variants are unprocessed', () => {
    const images = [{
      media_id: 'm1',
      sort_order: 0,
      is_primary: true,
      media: {
        variants: {
          // No 'processed' flag, no variants object
          publicUrl: 'https://storage.supabase.co/raw.jpg',
        },
      },
    }];

    const imgObjects = images.map((img) => {
      const v = img.media?.variants || {};
      if (v.processed && v.variants) {
        return { src: v.publicUrl, w: 800, h: 800, srcset: '' };
      }
      return v.publicUrl || '';
    }).filter((img: any) => img !== '');

    expect(imgObjects).toHaveLength(1);
    expect(typeof imgObjects[0]).toBe('string');
    expect(imgObjects[0]).toBe('https://storage.supabase.co/raw.jpg');
  });

  it('filters out empty image entries', () => {
    const images = [
      { media_id: 'm1', sort_order: 0, is_primary: true, media: { variants: {} } },
    ];

    const imgObjects = images.map((img) => {
      const v = img.media?.variants || {};
      if (v.processed && v.variants) {
        return { src: v.publicUrl };
      }
      return v.publicUrl || '';
    }).filter((img: any) => img !== '');

    // publicUrl is undefined, so result is ''
    expect(imgObjects).toHaveLength(0);
  });
});

describe('process-images — variant width logic', () => {
  const VARIANT_WIDTHS = [240, 360, 480, 560, 640, 720, 1080, 1600];

  it('generates variants only for widths <= original width', () => {
    const origW = 500;
    const applicable = VARIANT_WIDTHS.filter((w) => w <= origW);
    expect(applicable).toEqual([240, 360, 480]);

    const origW2 = 1600;
    const applicable2 = VARIANT_WIDTHS.filter((w) => w <= origW2);
    expect(applicable2).toEqual(VARIANT_WIDTHS); // all widths

    const origW3 = 200;
    const applicable3 = VARIANT_WIDTHS.filter((w) => w <= origW3);
    expect(applicable3).toEqual([]);
  });

  it('calculates proportional heights', () => {
    const origW = 1600;
    const origH = 1200;
    const ratios = VARIANT_WIDTHS.map((w) => ({
      w,
      h: Math.round(origH * (w / origW)),
    }));

    expect(ratios[0]).toEqual({ w: 240, h: 180 });
    expect(ratios[7]).toEqual({ w: 1600, h: 1200 });
    expect(ratios[3]).toEqual({ w: 560, h: 420 });
  });

  it('skips already-processed images', () => {
    const records = [
      { id: '1', variants: { processed: true } },
      { id: '2', variants: {} },
      { id: '3', variants: null },
      { id: '4', variants: { processed: false } },
    ];

    const unprocessed = records.filter((r) => !r.variants?.processed);
    expect(unprocessed).toHaveLength(3);
    expect(unprocessed.map((r) => r.id)).toEqual(['2', '3', '4']);
  });

  it('derives variant storage paths correctly', () => {
    const storagePath = 'products/qw-g34-front.webp';
    const basePath = storagePath.replace(/\.[^.]+$/, '');
    expect(basePath).toBe('products/qw-g34-front');

    const variantPath = `${basePath}-480w.webp`;
    expect(variantPath).toBe('products/qw-g34-front-480w.webp');
  });
});
