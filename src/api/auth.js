// The real Express session is the only authentication source.
// Public content still uses the local workspace until content API endpoints exist.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const EVENT = 'veldridge-auth-change';
let status = 'checking';
let admin = null;
let pending = null;
const notify = () => window.dispatchEvent(new Event(EVENT));
const update = (next, user = null) => { status = next; admin = user; notify(); };
const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/auth/${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the Veldridge API. Check that Express is running and VITE_API_URL is correct.');
  }
  let data;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const error = new Error(data?.message || `Authentication request failed (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
};
export const auth = {
  getSnapshot: () => status,
  subscribe(listener) {
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
  },
  getAdmin: () => admin,
  bootstrap() {
    if (pending) return pending;
    update('checking');
    pending = request('me').then((data) => update('authenticated', data.admin))
      .catch((error) => update(error.status === 401 ? 'anonymous' : 'unavailable'))
      .finally(() => { pending = null; });
    return pending;
  },
  async signIn(username, password) {
    const data = await request('login', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim(), password }),
    });
    update('authenticated', data.admin);
    return data.admin;
  },
  async signOut() {
    try { await request('logout', { method: 'POST' }); }
    finally { update('anonymous'); }
  },
  isSignedIn: () => status === 'authenticated',
};
export function requireAdmin() {
  if (!auth.isSignedIn()) throw new Error('Your administrator session is not active. Please sign in again.');
}
