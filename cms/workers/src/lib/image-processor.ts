// Image processing utility for Cloudflare Workers
// Handles image upload, validation, and variant generation

export interface ImageVariant {
  width: number;
  height?: number;
  format: 'webp' | 'avif' | 'auto';
  quality: number;
}

export const DEFAULT_VARIANTS: ImageVariant[] = [
  { width: 240, format: 'webp', quality: 76 },
  { width: 360, format: 'webp', quality: 76 },
  { width: 480, format: 'webp', quality: 76 },
  { width: 560, format: 'webp', quality: 76 },
  { width: 640, format: 'webp', quality: 76 },
  { width: 720, format: 'webp', quality: 76 },
  { width: 1080, format: 'webp', quality: 76 },
  { width: 1600, format: 'webp', quality: 76 },
];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function validateImage(file: { type: string; size: number; name: string }): string | null {
  if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return `不支持的文件类型: ${file.type}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `文件太大 (最大 20MB): ${(file.size / 1024 / 1024).toFixed(1)}MB`;
  }
  return null;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export function generateStoragePath(category: string, filename: string): string {
  const timestamp = Date.now();
  return `${category}/${timestamp}-${filename}`;
}

// For Cloudflare Workers, image resizing is done via Cloudflare Image Resizing
// (requires Cloudflare Images subscription or Pro plan for transform via URL)
// Alternative: use `@aspect-build/aspect-image` (WASM-based Sharp) in Workers
// For MVP, we store original images and generate variants client-side or via build

export function getVariantUrls(baseUrl: string, variants: ImageVariant[] = DEFAULT_VARIANTS): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const v of variants) {
    // Cloudflare Image Resizing URL format: /cdn-cgi/image/width=240,format=webp,quality=76/<path>
    // Or use Supabase transformation if using Supabase Storage
    urls[`${v.width}w`] = `${baseUrl}?width=${v.width}&format=${v.format}&quality=${v.quality}`;
  }
  return urls;
}
