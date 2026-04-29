function encodePathSegment(segment) {
  if (!segment) return segment;
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

export function toPublicFileUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '#';
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }

  const hashIndex = raw.indexOf('#');
  const queryIndex = raw.indexOf('?');
  const splitIndex =
    hashIndex === -1 ? queryIndex : queryIndex === -1 ? hashIndex : Math.min(hashIndex, queryIndex);

  const pathOnly = splitIndex === -1 ? raw : raw.slice(0, splitIndex);
  const suffix = splitIndex === -1 ? '' : raw.slice(splitIndex);

  const normalizedPath = pathOnly.replace(/^\/+/, '');
  const encodedPath = normalizedPath
    .split('/')
    .map((segment) => encodePathSegment(segment))
    .join('/');

  const baseUrl = import.meta.env.BASE_URL || '/';
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${base}${encodedPath}${suffix}`;
}
