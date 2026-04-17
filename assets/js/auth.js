// Client-side password gate. NOT real security — dissuasive only.
// Hash is SHA-256 of the admin password.
const ADMIN_HASH = '04b110f5a956bd4e9840c96e0d1ddac44939b2b2b75e39b50faf0e00c97e3a2c';
const AUTH_KEY = 'ng_admin_auth';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function isAdmin() {
  return sessionStorage.getItem(AUTH_KEY) === ADMIN_HASH;
}

async function tryLogin(password) {
  const hash = await sha256(password);
  if (hash === ADMIN_HASH) {
    sessionStorage.setItem(AUTH_KEY, ADMIN_HASH);
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
}

// Hide admin-only elements (nav links, buttons) unless authenticated.
function gateAdminUI() {
  const show = isAdmin();
  document.querySelectorAll('[data-admin-only]').forEach(el => {
    el.style.display = show ? '' : 'none';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', gateAdminUI);
} else {
  gateAdminUI();
}
