import samplePhoto from '@/features/products/assets/sample-photo.svg';

function normalizeImageUrl(url) {
  if (typeof url !== 'string' || !url) return samplePhoto;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/')
  ) {
    return url;
  }
  return `/${url.replace(/^\.?\//, '')}`;
}

function normalizeImageSrcSet(srcset) {
  if (typeof srcset !== 'string' || !srcset.trim()) return undefined;
  return srcset
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/, 2);
      const normalizedUrl = normalizeImageUrl(url);
      return descriptor ? `${normalizedUrl} ${descriptor}` : normalizedUrl;
    })
    .join(', ');
}

/**
 * vite-imagetools `as=img` exports `{ src, w, h, srcset }`. Plain imports stay strings.
 */
export function getImageSrc(img) {
  if (img && typeof img === 'object' && 'src' in img && img.src) return normalizeImageUrl(img.src);
  return normalizeImageUrl(img);
}

export function getImageSrcSet(img) {
  if (img && typeof img === 'object' && img.srcset) return normalizeImageSrcSet(img.srcset);
  return undefined;
}

export function getImageWidth(img, fallback = 900) {
  if (img && typeof img === 'object' && img.w) return img.w;
  return fallback;
}

export function getImageHeight(img, fallback = 900) {
  if (img && typeof img === 'object' && img.h) return img.h;
  return fallback;
}

export function getImageFallbackSrc() {
  return samplePhoto;
}
