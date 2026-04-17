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
  gateAdminUI();
}

// Hide / show admin-only / guest-only elements based on auth state.
function gateAdminUI() {
  const admin = isAdmin();
  document.querySelectorAll('[data-admin-only]').forEach(el => {
    el.style.display = admin ? '' : 'none';
  });
  document.querySelectorAll('[data-guest-only]').forEach(el => {
    el.style.display = admin ? 'none' : '';
  });
}

// --- Login modal (injected on every page) ---
function injectLoginModal() {
  if (document.getElementById('ng-login-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'ng-login-modal';
  modal.innerHTML = `
    <style>
      #ng-login-modal {
        position: fixed; inset: 0; display: none;
        background: rgba(5, 8, 14, 0.7); backdrop-filter: blur(8px);
        z-index: 200; align-items: center; justify-content: center;
        padding: 1rem;
      }
      #ng-login-modal.show { display: flex; }
      #ng-login-modal .modal-card {
        background: var(--bg-card);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius);
        padding: 2rem;
        width: 100%; max-width: 400px;
        box-shadow: var(--shadow);
        animation: ng-slide-up 0.2s ease-out;
      }
      @keyframes ng-slide-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      #ng-login-modal .modal-head {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 1.25rem;
      }
      #ng-login-modal h3 {
        font-size: 1.15rem; font-weight: 700; letter-spacing: -0.01em;
        display: flex; align-items: center; gap: 0.5rem;
      }
      #ng-login-modal .close-btn {
        color: var(--text-muted); font-size: 1.5rem; line-height: 1;
        padding: 0.25rem 0.5rem; border-radius: 6px; transition: all 0.15s;
      }
      #ng-login-modal .close-btn:hover { color: var(--text); background: var(--bg-elev); }
      #ng-login-modal input {
        width: 100%; padding: 0.7rem 1rem;
        background: var(--bg-elev); border: 1px solid var(--border-strong);
        border-radius: var(--radius-sm); color: var(--text); font-size: 0.95rem;
        outline: none; transition: all 0.15s; font-family: inherit;
      }
      #ng-login-modal input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-glow);
      }
      #ng-login-modal .error {
        color: var(--red); font-size: 0.85rem; min-height: 1.2rem; margin: 0.5rem 0;
      }
      #ng-login-modal label {
        display: block; font-size: 0.85rem; color: var(--text-muted);
        margin-bottom: 0.4rem; font-weight: 500;
      }
    </style>
    <div class="modal-card">
      <div class="modal-head">
        <h3>🔒 Connexion admin</h3>
        <button type="button" class="close-btn" id="ng-modal-close" aria-label="Fermer">×</button>
      </div>
      <form id="ng-modal-form">
        <label for="ng-modal-password">Mot de passe</label>
        <input type="password" id="ng-modal-password" autocomplete="current-password" required />
        <div class="error" id="ng-modal-error"></div>
        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Se connecter</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.classList.remove('show');
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.getElementById('ng-modal-close').onclick = close;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) close();
  });

  document.getElementById('ng-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('ng-modal-password').value;
    const err = document.getElementById('ng-modal-error');
    err.textContent = '';
    const ok = await tryLogin(pw);
    if (ok) {
      close();
      document.getElementById('ng-modal-password').value = '';
      gateAdminUI();
      // If a local callback is defined (e.g. admin page), call it.
      if (typeof window.onAdminLogin === 'function') window.onAdminLogin();
    } else {
      err.textContent = 'Mot de passe incorrect.';
      document.getElementById('ng-modal-password').value = '';
    }
  });
}

function openLoginModal() {
  injectLoginModal();
  const modal = document.getElementById('ng-login-modal');
  modal.classList.add('show');
  setTimeout(() => document.getElementById('ng-modal-password')?.focus(), 50);
}

function initAuthUI() {
  injectLoginModal();
  gateAdminUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}
