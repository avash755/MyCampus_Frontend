export function safeExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (!/^https?:\/\//i.test(value.trim())) return '';
    return url.toString();
  } catch {
    return '';
  }
}
