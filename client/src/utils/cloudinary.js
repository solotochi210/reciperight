/**
 * Insert Cloudinary delivery transforms (f_auto,q_auto) into an image URL so we
 * always serve optimized, auto-format images. Falls back to the original URL
 * for non-Cloudinary sources.
 */
export function cldUrl(url, extra = '') {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/upload/')) return url;
  const base = 'f_auto,q_auto';
  const transform = extra ? `${base},${extra}` : base;
  // Avoid doubling transforms if already present.
  if (url.includes('/upload/f_auto')) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}

export function coverUrl(url) {
  return cldUrl(url, 'w_800,h_600,c_fill');
}

export function thumbUrl(url) {
  return cldUrl(url, 'w_400,h_300,c_fill');
}
