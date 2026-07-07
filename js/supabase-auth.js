// ════════════════════════════════════════════════════════════
// supabase-auth.js — Phase 3 Auth + Landing Page
// ════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';

window.SB_SESSION    = null;
window.SB_COMPANY_ID = null;
window.SB_CONFIG     = null;

// ── REST helpers ─────────────────────────────────────────────

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

// ── Load company config ───────────────────────────────────────

async function loadCompanyConfig() {
  const companies = await sbGet(
    '/rest/v1/companies?select=id,name,tagline,phone,wa_number,email,city,logo_url,admin_pin,setup_completed'
    + '&owner_user_id=eq.' + window.SB_SESSION.user.id + '&limit=1'
  );
  if (!companies || companies.length === 0) throw new Error('No company found for this account.');
  const co = companies[0];
  window.SB_COMPANY_ID = co.id;
  window.SB_CONFIG = {
    company:  co.name        || 'My Company',
    tagline:  co.tagline     || '',
    phone:    co.phone       || '',
    waNumber: co.wa_number   || '',
    email:    co.email       || '',
    city:     co.city        || '',
    logo:     co.logo_url    || '',
    pin:      co.admin_pin   || '1234',
    setup_completed: co.setup_completed
  };
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

async function loadSpecsFromDB() {
  const rows = await sbGet(
    '/rest/v1/specs_text?select=doc_type,content&company_id=eq.' + window.SB_COMPANY_ID
  );
  rows.forEach(row => {
    localStorage.setItem('eh_' + row.doc_type + '_text', row.content);
  });
}

async function saveConfigToDB(cfg) {
  await sbPatch('companies', 'id=eq.' + window.SB_COMPANY_ID, {
    name:      cfg.company,
    tagline:   cfg.tagline,
    phone:     cfg.phone,
    wa_number: cfg.waNumber,
    email:     cfg.email,
    city:      cfg.city
  });
  const tiers = ['basic', 'standard', 'premium'];
  for (const tier of tiers) {
    await sbUpsert('packages', {
      company_id:   window.SB_COMPANY_ID,
      tier:         tier,
      rate_per_sft: cfg.rates ? cfg.rates[tier] : window.SB_CONFIG.rates[tier]
    }, 'company_id,tier');
  }
  window.SB_CONFIG = Object.assign(window.SB_CONFIG, cfg);
}

// ── Show / hide the app ───────────────────────────────────────

function showApp() {
  const landing = document.getElementById('sb-landing');
  const loginModal = document.getElementById('sb-login-modal');
  if (landing) landing.style.display = 'none';
  if (loginModal) loginModal.style.display = 'none';

  // Reveal nav and app
  const nav = document.querySelector('nav');
  const trigger = document.querySelector('.admin-trigger');
  if (nav) nav.style.visibility = 'visible';
  if (trigger) trigger.style.display = 'flex';

  // Go to quote page
  if (typeof showPage === 'function') {
    showPage('quote', document.getElementById('nav-quote'));
  }

  // Apply company config
  if (typeof applyConfig === 'function') applyConfig();

  // Setup wizard if needed
  if (window.SB_CONFIG && !window.SB_CONFIG.setup_completed) {
    const wiz = document.getElementById('setupWizard');
    if (wiz) wiz.style.display = 'flex';
  }
}

function showLandingPage() {
  // Hide all app pages and nav
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const nav = document.querySelector('nav');
  const trigger = document.querySelector('.admin-trigger');
  if (nav) nav.style.visibility = 'hidden';
  if (trigger) trigger.style.display = 'none';

  // Show landing
  const landing = document.getElementById('sb-landing');
  if (landing) landing.style.display = 'flex';
}

// ── Landing page ──────────────────────────────────────────────

function injectLandingPage() {
  const el = document.createElement('div');
  el.id = 'sb-landing';
  el.style.cssText = 'position:fixed;inset:0;background:#0d0d0d;z-index:9990;display:flex;flex-direction:column;overflow-y:auto';

  el.innerHTML = `
    <style>
      #sb-landing { font-family:'DM Sans',-apple-system,sans-serif; color:#f0f0f0; }
      .lp-nav { display:flex; justify-content:space-between; align-items:center; padding:18px 32px; border-bottom:1px solid rgba(201,168,76,0.15); position:sticky; top:0; background:#0d0d0d; z-index:10; }
      .lp-logo { display:flex; align-items:center; gap:10px; font-family:'Playfair Display',serif; font-size:1.2rem; }
      .lp-logo span { color:#c9a84c; }
      .lp-signin-btn { padding:10px 22px; border-radius:10px; background:#c9a84c; color:#000; border:none; font-weight:800; font-size:0.9rem; cursor:pointer; font-family:inherit; }
      .lp-hero { text-align:center; padding:80px 24px 60px; max-width:700px; margin:0 auto; }
      .lp-hero h1 { font-family:'Playfair Display',serif; font-size:clamp(2rem,5vw,3.2rem); line-height:1.2; margin-bottom:20px; }
      .lp-hero h1 em { color:#c9a84c; font-style:normal; }
      .lp-hero p { font-size:1.05rem; color:#999; line-height:1.7; margin-bottom:36px; }
      .lp-cta-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
      .lp-cta-primary { padding:16px 36px; border-radius:12px; background:#c9a84c; color:#000; border:none; font-weight:800; font-size:1rem; cursor:pointer; font-family:inherit; }
      .lp-cta-secondary { padding:16px 36px; border-radius:12px; background:transparent; color:#c9a84c; border:1px solid rgba(201,168,76,0.4); font-weight:700; font-size:1rem; cursor:pointer; font-family:inherit; }
      .lp-features { padding:60px 24px; max-width:960px; margin:0 auto; width:100%; }
      .lp-features-title { text-align:center; font-family:'Playfair Display',serif; font-size:1.8rem; margin-bottom:8px; }
      .lp-features-sub { text-align:center; color:#888; margin-bottom:40px; font-size:0.95rem; }
      .lp-features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px; }
      .lp-feature-card { background:#1a1a1a; border:1px solid rgba(201,168,76,0.15); border-radius:16px; padding:24px; }
      .lp-feature-icon { font-size:1.8rem; margin-bottom:12px; }
      .lp-feature-title { font-weight:700; font-size:1rem; margin-bottom:8px; color:#f0f0f0; }
      .lp-feature-desc { font-size:0.85rem; color:#888; line-height:1.6; }
      .lp-pricing { padding:60px 24px; max-width:860px; margin:0 auto; width:100%; }
      .lp-pricing-title { text-align:center; font-family:'Playfair Display',serif; font-size:1.8rem; margin-bottom:8px; }
      .lp-pricing-sub { text-align:center; color:#888; margin-bottom:40px; font-size:0.95rem; }
      .lp-pricing-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px; }
      .lp-plan { background:#1a1a1a; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:28px 24px; }
      .lp-plan.featured { border-color:rgba(201,168,76,0.5); background:#1c1a14; }
      .lp-plan-badge { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#c9a84c; margin-bottom:10px; }
      .lp-plan-name { font-size:1.1rem; font-weight:800; margin-bottom:6px; }
      .lp-plan-price { font-size:2rem; font-weight:900; color:#c9a84c; margin-bottom:4px; }
      .lp-plan-price span { font-size:0.9rem; font-weight:400; color:#888; }
      .lp-plan-desc { font-size:0.82rem; color:#777; margin-bottom:20px; line-height:1.5; }
      .lp-plan-features { list-style:none; padding:0; margin:0 0 24px; }
      .lp-plan-features li { font-size:0.83rem; color:#aaa; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; gap:8px; }
      .lp-plan-features li::before { content:'✓'; color:#c9a84c; font-weight:700; }
      .lp-plan-btn { width:100%; padding:12px; border-radius:10px; background:#c9a84c; color:#000; border:none; font-weight:800; cursor:pointer; font-family:inherit; font-size:0.9rem; }
      .lp-plan.featured .lp-plan-btn { background:#c9a84c; }
      .lp-plan:not(.featured) .lp-plan-btn { background:transparent; border:1px solid rgba(201,168,76,0.4); color:#c9a84c; }
      .lp-footer { padding:32px 24px; text-align:center; border-top:1px solid rgba(255,255,255,0.06); color:#555; font-size:0.82rem; margin-top:auto; }
      @media(max-width:600px) { .lp-nav { padding:14px 18px; } .lp-hero { padding:50px 18px 40px; } }
    </style>

    <!-- NAV -->
    <div class="lp-nav">
      <div class="lp-logo">
        🏗️ <span>Quote</span>Builder
      </div>
      <button class="lp-signin-btn" onclick="showLoginModal()">Sign In</button>
    </div>

    <!-- HERO -->
    <div class="lp-hero">
      <h1>Professional Quotes<br/>for <em>Construction Contractors</em></h1>
      <p>Stop sending unformatted WhatsApp messages. Generate beautiful, branded construction quotes, false ceiling quotes, and work orders — in seconds.</p>
      <div class="lp-cta-row">
        <button class="lp-cta-primary" onclick="showLoginModal()">Get Started →</button>
        <button class="lp-cta-secondary" onclick="showLoginModal()">Sign In</button>
      </div>
    </div>

    <!-- FEATURES -->
    <div class="lp-features">
      <div class="lp-features-title">Everything you need to <em style="color:#c9a84c">quote professionally</em></div>
      <div class="lp-features-sub">Built specifically for construction contractors in India</div>
      <div class="lp-features-grid">
        <div class="lp-feature-card">
          <div class="lp-feature-icon">🏗️</div>
          <div class="lp-feature-title">Construction Quotes</div>
          <div class="lp-feature-desc">Floor-wise area calculations, Basic/Standard/Premium packages, add-ons like septic tank and UG sump — all in one shareable link.</div>
        </div>
        <div class="lp-feature-card">
          <div class="lp-feature-icon">🪟</div>
          <div class="lp-feature-title">False Ceiling Quotes</div>
          <div class="lp-feature-desc">Room-wise false ceiling builder with gypsum, PVC and cove options, CNC design, putty and primer add-ons.</div>
        </div>
        <div class="lp-feature-card">
          <div class="lp-feature-icon">📋</div>
          <div class="lp-feature-title">Work Orders</div>
          <div class="lp-feature-desc">Auto-numbered work orders generated from finalized quotes. Downloadable as PDF-ready HTML.</div>
        </div>
        <div class="lp-feature-card">
          <div class="lp-feature-icon">🔒</div>
          <div class="lp-feature-title">Secure Client Links</div>
          <div class="lp-feature-desc">Share quotes via a short link. Clients enter their phone number to view — keeping your data private.</div>
        </div>
        <div class="lp-feature-card">
          <div class="lp-feature-icon">🎨</div>
          <div class="lp-feature-title">Your Brand</div>
          <div class="lp-feature-desc">Upload your logo, set your company name, tagline, and contact details. Every quote carries your brand.</div>
        </div>
        <div class="lp-feature-card">
          <div class="lp-feature-icon">📁</div>
          <div class="lp-feature-title">Portfolio</div>
          <div class="lp-feature-desc">Showcase completed projects with photos, area, package tier and tags. Impress clients before the quote even starts.</div>
        </div>
      </div>
    </div>

    <!-- PRICING -->
    <div class="lp-pricing">
      <div class="lp-pricing-title">Simple, transparent <em style="color:#c9a84c">pricing</em></div>
      <div class="lp-pricing-sub">Start free — pay only when you grow</div>
      <div class="lp-pricing-grid">
        <div class="lp-plan">
          <div class="lp-plan-badge">Starter</div>
          <div class="lp-plan-name">Free</div>
          <div class="lp-plan-price">₹0 <span>forever</span></div>
          <div class="lp-plan-desc">Perfect to get started and see if this works for your business.</div>
          <ul class="lp-plan-features">
            <li>2 quote generations</li>
            <li>3 quote finalizations</li>
            <li>Work orders included</li>
            <li>False ceiling quotes</li>
            <li>Company branding</li>
          </ul>
          <button class="lp-plan-btn" onclick="showLoginModal()">Get Started Free</button>
        </div>
        <div class="lp-plan featured">
          <div class="lp-plan-badge">⭐ Most Popular</div>
          <div class="lp-plan-name">Pay as you go</div>
          <div class="lp-plan-price">₹100 <span>= 100 tokens</span></div>
          <div class="lp-plan-desc">Buy tokens when you need them. No monthly commitment.</div>
          <ul class="lp-plan-features">
            <li>50 tokens per quote</li>
            <li>50 tokens per finalization</li>
            <li>Tokens never expire</li>
            <li>All features included</li>
            <li>Priority support</li>
          </ul>
          <button class="lp-plan-btn" onclick="showLoginModal()">Start Now</button>
        </div>
        <div class="lp-plan">
          <div class="lp-plan-badge">Unlimited</div>
          <div class="lp-plan-name">Subscription</div>
          <div class="lp-plan-price">₹499 <span>/ month</span></div>
          <div class="lp-plan-desc">Unlimited quotes and finalizations. Best for busy contractors.</div>
          <ul class="lp-plan-features">
            <li>Unlimited quotes</li>
            <li>Unlimited finalizations</li>
            <li>Annual plan available</li>
            <li>All features included</li>
            <li>Priority support</li>
          </ul>
          <button class="lp-plan-btn" onclick="showLoginModal()">Subscribe</button>
        </div>
      </div>
    </div>

    <div class="lp-footer">
      © 2026 QuoteBuilder · Built for Indian construction contractors · <a href="#" onclick="showLoginModal()" style="color:#c9a84c">Sign In</a>
    </div>
  `;

  document.body.insertBefore(el, document.body.firstChild);
}

// ── Login modal ───────────────────────────────────────────────

function showLoginModal() {
  let modal = document.getElementById('sb-login-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sb-login-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `
      <div style="background:#1a1a1a;border:1px solid rgba(201,168,76,0.3);border-radius:20px;padding:36px 28px;max-width:400px;width:100%;position:relative">
        <button onclick="document.getElementById('sb-login-modal').style.display='none'" style="position:absolute;top:14px;right:16px;background:transparent;border:none;color:#666;font-size:1.2rem;cursor:pointer">✕</button>
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:2rem">🏗️</div>
          <h2 style="font-family:'Playfair Display',serif;color:#c9a84c;margin:8px 0 4px;font-size:1.5rem">Welcome back</h2>
          <p style="color:#888;font-size:0.85rem;margin:0">Sign in to your contractor account</p>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">Email</label>
          <input id="sb-login-email" type="email" placeholder="you@example.com"
            style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f0f0f0;font-size:0.95rem;box-sizing:border-box"
            onkeydown="if(event.key==='Enter')document.getElementById('sb-login-password').focus()">
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:0.75rem;font-weight:700;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">Password</label>
          <input id="sb-login-password" type="password" placeholder="password"
            style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f0f0f0;font-size:0.95rem;box-sizing:border-box"
            onkeydown="if(event.key==='Enter')sbDoLogin()">
        </div>
        <button onclick="sbDoLogin()" id="sb-login-btn" style="width:100%;padding:14px;border-radius:12px;border:none;background:#c9a84c;color:#000;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit">Sign In</button>
        <div id="sb-login-error" style="display:none;margin-top:12px;padding:10px 12px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#fca5a5;font-size:0.85rem"></div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
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
    if (!res.ok || !data.access_token) throw new Error(data.error_description || data.msg || 'Login failed');

    window.SB_SESSION = { access_token: data.access_token, user: data.user };
    localStorage.setItem('sb_session', JSON.stringify(window.SB_SESSION));

    btn.textContent = 'Loading your company…';

    await loadCompanyConfig();
    await loadSpecsFromDB();

    showApp();

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
    if (window.SB_SESSION) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + window.SB_SESSION.access_token }
      });
    }
  } catch (e) {}
  window.SB_SESSION = null;
  window.SB_COMPANY_ID = null;
  window.SB_CONFIG = null;
  localStorage.removeItem('sb_session');
  localStorage.removeItem('eh_specs_text');
  localStorage.removeItem('eh_terms_text');
  showLandingPage();
}

// ── Check quote URL param (for client-facing quote links) ─────

function checkQuoteParam() {
  const params = new URLSearchParams(window.location.search);
  const quoteCode = params.get('quote');
  if (quoteCode) {
    // Hide landing, show app in client quote mode
    const landing = document.getElementById('sb-landing');
    if (landing) landing.style.display = 'none';
    const nav = document.querySelector('nav');
    if (nav) nav.style.visibility = 'visible';
    // showPhoneGate is defined in app.js
    if (typeof showPage === 'function') showPage('quote', document.getElementById('nav-quote'));
    if (typeof showPhoneGate === 'function') showPhoneGate(quoteCode);
    return true;
  }
  return false;
}

// ── Startup ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function() {
  // Always inject landing page first
  injectLandingPage();

  // Check if this is a client quote link — skip auth if so
  if (checkQuoteParam()) return;

  // Try to restore persisted session
  const saved = localStorage.getItem('sb_session');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      window.SB_SESSION = parsed;
      await loadCompanyConfig();
      await loadSpecsFromDB();
      showApp();
      return;
    } catch (e) {
      localStorage.removeItem('sb_session');
      window.SB_SESSION = null;
    }
  }

  // No session — show landing page (already injected above)
  // User taps Sign In to get the login modal
});
