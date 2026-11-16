// A form preview only: never sends requests or writes to browser storage.
function printable(value, key = '') {
  if (/password|secret|token/i.test(key)) return value ? '[redacted]' : '';
  if (typeof File !== 'undefined' && value instanceof File) {
    return { name: value.name, type: value.type, size: value.size };
  }
  if (Array.isArray(value)) return value.map((item) => printable(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, printable(item, name)]));
  }
  return typeof value === 'string' && value.startsWith('blob:') ? '[local preview]' : value;
}

export function logForm(name, values) {
  console.log(`[Veldridge form] ${name}`, printable(values));
}
