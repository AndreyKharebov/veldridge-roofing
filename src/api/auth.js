// DEMONSTRATION ONLY. These public credentials and a browser flag are not security.
// Replace this adapter with server authentication + authorization before deployment.
const SESSION_KEY = 'veldridge-demo-admin-session';
const EVENT = 'veldridge-demo-session';
export const demoCredentials = { username: 'admin', password: 'demo-admin' };
export const auth = {
  isSignedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === 'demo-admin'; } catch { return false; }
  },
  subscribe(listener) {
    window.addEventListener(EVENT,listener);
    return () => window.removeEventListener(EVENT,listener);
  },
  async signIn(username,password) {
    await new Promise((resolve) => setTimeout(resolve,200));
    if (username.trim() !== demoCredentials.username || password !== demoCredentials.password) throw new Error('Incorrect demo username or password.');
    sessionStorage.setItem(SESSION_KEY,'demo-admin');
    window.dispatchEvent(new Event(EVENT));
  },
  signOut() { sessionStorage.removeItem(SESSION_KEY); window.dispatchEvent(new Event(EVENT)); },
};
export function requireAdmin() {
  if (!auth.isSignedIn()) throw new Error('Your demo session has ended. Sign in again to save changes.');
}
