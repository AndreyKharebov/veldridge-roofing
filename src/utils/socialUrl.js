// Accept pasted domains without a scheme, but never executable or credentialed URLs.
export function normalizeSocialUrl(value) {
  if (typeof value !== 'string') throw new Error('Enter a website address');
  const text = value.trim();
  if (!text) return '';
  if (text.length > 2000 || /[\s\u0000-\u001f\u007f\\]/u.test(text)) {
    throw new Error('Invalid website address');
  }
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(text);
  if (hasScheme && !/^https?:\/\//i.test(text)) throw new Error('Use an HTTP or HTTPS website');
  const url = new URL(hasScheme ? text : `https://${text.replace(/^\/\//, '')}`);
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') ||
      url.username || url.password || url.href.length > 2000) {
    throw new Error('Enter a full website address, for example facebook.com/your-page');
  }
  return url.href;
}
