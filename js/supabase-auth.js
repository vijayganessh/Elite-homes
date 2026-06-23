// ════════════════════════════════════════════════════════════
// supabase-auth.js  —  Phase 3, Slice 1: Auth + Config Layer
//
// What this file does:
// 1. Blocks the app behind a real login screen (replaces PIN)
// 2. After login, loads company config from Supabase into
//    window.SB_CONFIG so getConfig() in app.js reads from DB
// 3. Replaces checkPin() — admin panel opens automatically
//    since the user is already authenticated
// 4. Adds logout button to the admin panel
//
// Add this BEFORE app.js in index.html:
//   <script src="js/supabase-auth.js"></script>
// ════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';

// Global session state — readable by app.js
window.SB_SESSION = null;      // { access_token, user }
window.SB_COMPANY_ID = null;   // UUID of the logged-in company
window.SB_CONFIG = null;       // config object matching DEFAULT_CONFIG shape

// ── Supabase REST helpers ────────────────────────────────────

async function sbGet(path) {
  const res = await fetch(SUPABASE_URL + path, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + window.SB_SESSION.access_token
    }
  });
  if (!res.ok) throw new Error('GET ' + path + ' failed: ' + res.status);
  return res.json();
}

async function sbPatch(table, filter, payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + window.SB_SESSION.access_token,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('PATCH ' + table + ' failed: ' + res.status);
}

async function sbUpsert(table, payload, conflictCols) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflictCols}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + window.SB_SESSION.access_token,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('UPSERT ' + table + ' failed: ' + res.status);
}

// ── Load company config from Supabase after login ────────────

async function loadCompanyConfig() {
  // Get this user's company
  const companies = await sbGet(
    '/rest/v1/companies?select=id,name,tagline,phone,wa_number,email,city,logo_url,admin_pin,setup_completed'
    + '&owner_user_id=eq.' + window.SB_SESSION.user.id
    + '&limit=1'
  );

  if (!companies || companies.length === 0) {
    throw new Error('No company found for this account.');
  }

  const co = companies[0];
  window.SB_COMPANY_ID = co.id;

  // Shape this into the same object DEFAULT_CONFIG uses
  // so all existing getConfig() calls in app.js keep working
  window.SB_CONFIG = {
    company:  co.name        || 'My Company',
    tagline:  co.tagline     || '',
    phone:    co.phone       || '',
    waNumber: co.wa_number   || '',
    email:    co.email       || '',
    city:     co.city        || '',
    logo:     co.logo_url    || '',
    pin:      co.admin_pin   || '1234',   // kept for reference but not used for auth
    setup_completed: co.setup_completed
  };

  // Load package rates too, attach to SB_CONFIG
  const packages = await sbGet(
    '/rest/v1/packages?select=tier,rate_per_sft&company_id=eq.' + co.id
  );
  const rates = {};
  packages.forEach(p => { rates[p.tier] = p.rate_per_sft; });
  window.SB_CONFIG.rates = {
    basic:    rates.basic    || 2100,
    standard: rates.standard || 2300,
    premium:  rates.premium  || 2550
  };

  return window.SB_CONFIG;
}

// ── Load specs/terms from Supabase ────────────────────────────

async function loadSpecsFromDB() {
  const rows = await sbGet(
    '/rest/v1/specs_text?select=doc_type,content&company_id=eq.' + window.SB_COMPANY_ID
  );
  rows.forEach(row => {
    // Write into localStorage so the existing getSpecsText() in app.js
    // reads from DB values without needing changes in app.js yet
    localStorage.setItem('eh_' + row.doc_type + '_text', row.content);
  });
}

// ── Save config back to Supabase ─────────────────────────────
// Called by saveSettings() replacement below

async function saveConfigToDB(cfg) {
  await sbPatch('companies', 'id=eq.' + window.SB_COMPANY_ID, {
    name:      cfg.company,
    tagline:   cfg.tagline,
    phone:     cfg.phone,
    wa_number: cfg.waNumber,
    email:     cfg.email,
    city:      cfg.city
    // logo_url deferred to Phase 3 Storage work
  });

  // Save package rates
  const tiers = ['basic', 'standard', 'premium'];
  for (const tier of tiers) {
    await sbUpsert('packages', {
      company_id:   window.SB_COMPANY_ID,
      tier:         tier,
      rate_per_sft: cfg.rates ? cfg.rates[tier] : window.SB_CONFIG.rates[tier]
    }, 'company_id,tier');
  }

  // Update local cache
  window.SB_CONFIG = Object.assign(window.SB_CONFIG, cfg);
}

// ── Login screen HTML injection ────────────────────────────────

function injectLoginScreen() {
  const overlay = document.createElement('div');
  overlay.id = 'sb-login-overlay';
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'background:#0d0d0d',
    'z-index:99999', 'display:flex', 'align-items:center',
    'justify-content:center', 'padding:20px'
  ].join(';');

  overlay.innerHTML = `
    <div style="
      background:#1a1a1a; border:1px solid rgba(201,168,76,0.3);
      border-radius:20px; padding:36px 28px; max-width:400px; width:100%;
    ">
      <div style="text-align:center; margin-bottom:28px">
        <div style="font-size:2rem">🏗️</div>
        <h2 style="
          font-family:'Playfair Display',serif; color:#c9a84c;
          margin:8px 0 4px; font-size:1.5rem;
        ">Welcome back</h2>
        <p style="color:#888; font-size:0.85rem; margin:0">Sign in to your contractor account</p>
      </div>

      <div style="margin-bottom:14px">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em">Email</label>
        <input id="sb-login-email" type="email" placeholder="you@example.com"
          style="width:100%; padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:#f0f0f0; font-size:0.95rem; box-sizing:border-box"
          onkeydown="if(event.key==='Enter')document.getElementById('sb-login-password').focus()">
      </div>

      <div style="margin-bottom:20px">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em">Password</label>
        <input id="sb-login-password" type="password" placeholder="password"
          style="width:100%; padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:#f0f0f0; font-size:0.95rem; box-sizing:border-box"
          onkeydown="if(event.key==='Enter')sbDoLogin()">
      </div>

      <button onclick="sbDoLogin()" id="sb-login-btn" style="
        width:100%; padding:14px; border-radius:12px; border:none;
        background:#c9a84c; color:#000; font-size:1rem; font-weight:800;
        cursor:pointer; font-family:inherit;
      ">Sign In</button>

      <div id="sb-login-error" style="
        display:none; margin-top:12px; padding:10px 12px; border-radius:8px;
        background:rgba(239,68,68,0.1); border:1px solid #ef4444;
        color:#fca5a5; font-size:0.85rem;
      "></div>
    </div>
  `;

  document.body.appendChild(overlay);
}

// ── Login action ──────────────────────────────────────────────

async function sbDoLogin() {
  const email    = (document.getElementById('sb-login-email')    || {}).value || '';
  const password = (document.getElementById('sb-login-password') || {}).value || '';
  const errEl    = document.getElementById('sb-login-error');
  const btn      = document.getElementById('sb-login-btn');

  if (!email || !password) {
    errEl.textContent = 'Please enter your email and password.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Signing in…';
  errEl.style.display = 'none';

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.access_token) {
      throw new Error(data.error_description || data.msg || 'Login failed');
    }

    window.SB_SESSION = { access_token: data.access_token, user: data.user };
    // Persist session so page refresh doesn't require re-login
    localStorage.setItem('sb_session', JSON.stringify({ access_token: data.access_token, user: data.user }));

    btn.textContent = 'Loading your company…';

    await loadCompanyConfig();
    await loadSpecsFromDB();

    // Remove login overlay and boot the app
    const overlay = document.getElementById('sb-login-overlay');
    if (overlay) overlay.remove();

    // Trigger app startup (applyConfig + checkFirstLaunch equivalents)
    //if (typeof applyConfig === 'function') applyConfig();
    //if (typeof checkSetupStatus === 'function') checkSetupStatus();

        // Re-run applyConfig now that SB_CONFIG is populated
    if (typeof applyConfig === 'function') applyConfig();
    
    // Show setup wizard if this contractor hasn't completed setup yet
    if (window.SB_CONFIG && !window.SB_CONFIG.setup_completed) {
      const wiz = document.getElementById('setupWizard');
      if (wiz) wiz.style.display = 'flex';
    }


  } catch (err) {
    errEl.textContent = '❌ ' + err.message;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// ── Logout ────────────────────────────────────────────────────

async function sbLogout() {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + window.SB_SESSION.access_token }
    });
  } catch (e) { /* ignore network errors on logout */ }

  window.SB_SESSION = null;
  window.SB_COMPANY_ID = null;
  window.SB_CONFIG = null;
    localStorage.removeItem('sb_session');


  // Clear specs from localStorage so they reload fresh next login
  ['specs', 'terms'].forEach(t => localStorage.removeItem('eh_' + t + '_text'));

  // Reload the page to show login screen again
  window.location.reload();
}

// ── Override app.js functions to use Supabase ─────────────────
// These run AFTER app.js loads (via window.onload or DOMContentLoaded)
// and silently replace the localStorage versions

function patchAppFunctions() {
  // getConfig() now reads from SB_CONFIG (populated at login)
  // instead of localStorage
  if (typeof window.getConfig === 'undefined') {
    // getConfig is defined inside the IIFE in app.js — we patch it
    // by overriding what applyConfig/saveSettings read
    // Since getConfig is scoped inside the IIFE, we expose SB_CONFIG
    // as a fallback via DEFAULT_CONFIG shape — app.js merges them correctly
    console.log('[SB] getConfig will read from SB_CONFIG via DEFAULT_CONFIG override');
  }

  // checkPin() replaced — admin panel opens automatically since user is authenticated
  window.checkPin = function() {
    if (window.SB_SESSION) {
      if (typeof showAdminPanel === 'function') showAdminPanel();
    }
  };

  // Inject logout button into admin panel
  const adminPanel = document.getElementById('adminPanel');
  if (adminPanel && !document.getElementById('sb-logout-btn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'sb-logout-btn';
    logoutBtn.textContent = 'Sign Out';
    logoutBtn.onclick = sbLogout;
    logoutBtn.style.cssText = [
      'position:absolute', 'top:16px', 'right:60px',
      'background:transparent', 'border:1px solid rgba(255,255,255,0.2)',
      'color:#999', 'padding:6px 14px', 'border-radius:8px',
      'font-size:0.8rem', 'cursor:pointer'
    ].join(';');
    adminPanel.appendChild(logoutBtn);
  }
}

// ── Startup ───────────────────────────────────────────────────
// Show login screen immediately before app renders,
// then patch functions once DOM is ready

document.addEventListener('DOMContentLoaded', async function() {
  // Try to restore session from localStorage first
  const saved = localStorage.getItem('sb_session');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Verify token is still valid by fetching company
      window.SB_SESSION = parsed;
      await loadCompanyConfig();
      await loadSpecsFromDB();
      if (typeof applyConfig === 'function') applyConfig();
      if (window.SB_CONFIG && !window.SB_CONFIG.setup_completed) {
        const wiz = document.getElementById('setupWizard');
        if (wiz) wiz.style.display = 'flex';
      }
      document.addEventListener('appReady', patchAppFunctions);
      setTimeout(patchAppFunctions, 1500);
      return; // skip login screen
    } catch (e) {
      // Token expired or invalid — clear it and show login
      localStorage.removeItem('sb_session');
      window.SB_SESSION = null;
    }
  }
  injectLoginScreen();
  document.addEventListener('appReady', patchAppFunctions);
  setTimeout(patchAppFunctions, 1500);
});

});
