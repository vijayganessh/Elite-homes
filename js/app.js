
  // ── DATA ─────────────────────────────────────────────
  const rates     = { basic:2100, standard:2300, premium:2550 };
  const pillClass = { basic:'pill-basic', standard:'pill-standard', premium:'pill-premium' };
  const pkgLabel  = { basic:'Basic', standard:'Standard', premium:'Premium' };
  function getFloorName(i) {
    if (i===0) return 'Ground Floor';
    if (i===1) return '1st Floor';
    if (i===2) return '2nd Floor';
    if (i===3) return '3rd Floor';
    return i+'th Floor';
  }
  function getFloorLabel(n) {
    n = parseInt(n)||1;
    if (n===1) return 'Ground Floor Only';
    return 'G+' + (n-1);
  }
  const ADDON_RATES = { septic:25, sump:30, rcc:32 };
  const ADDON_LABELS = { septic:'Septic Tank', sump:'UG Sump', rcc:'RCC Overhead Tank' };

  const pkgSpecs = {
    basic:    {
      cement:'Priya / Penna', steel:'Suryadev / Thirumala', sand:'M-Sand / P-Sand',
      bricks:'Fly Ash', windows:'UPVC',
      door:'Vengai wood frame with Flush door',
      innerDoor:'Vengai wood frame with Flushdoor',
      exteriorDoor:'Vengai Wood Frame with Vengai Shutter',
      hardware:'Powder coated', handrails:'MS', mainGate:'MS',
      tiles:'₹40/sft', staircase:'Vitrified Tiles',
      switches:'GM', cables:'Kundan / V-Guard', pipes:'Star',
      sanitary:'Parryware', closets:'Parryware',
      interiorPaint:'Asian Tractor', exteriorPaint:'Asian Ace', joineryPaint:'Asian Enamel',
      basement:'2 ft above GL'
    },
    standard: {
      cement:'Ramco / Dalmia', steel:'Agni', sand:'M-Sand / P-Sand',
      bricks:'Red Brick', windows:'UPVC',
      door:'Vengai wood frame with Vengai wood shutter',
      innerDoor:'Vengai wood frame with Flushdoor',
      exteriorDoor:'Vengai Wood Frame with Vengai Shutter',
      hardware:'Powder coated', handrails:'Stainless Steel', mainGate:'MS',
      tiles:'₹50/sft', staircase:'Vitrified Tiles',
      switches:'Anchor Roma', cables:'Finolex', pipes:'Finolex',
      sanitary:'Jaquar', closets:'Parryware',
      interiorPaint:'Asian Tractor', exteriorPaint:'Asian Ace', joineryPaint:'Asian Enamel',
      basement:'3 ft above GL'
    },
    premium:  {
      cement:'Ultratech', steel:'TATA TMT', sand:'M-Sand / P-Sand',
      bricks:'Wire-cut Red Brick', windows:'Vengai Wood',
      door:'African Teak wood frame with African Teak wood shutter',
      innerDoor:'Vengai wood frame with Flushdoor (ISI make)',
      exteriorDoor:'Vengai Wood Frame with Vengai Shutter',
      hardware:'Stainless Steel', handrails:'Stainless Steel', mainGate:'SS',
      tiles:'₹60/sft', staircase:'Granite',
      switches:'Legrand', cables:'Hawells', pipes:'Astral / Ashirwad',
      sanitary:'Roca', closets:'Jaquar',
      interiorPaint:'Asian Premium', exteriorPaint:'Asian Apex', joineryPaint:'Asian Enamel',
      basement:'3 ft above GL'
    }
  };

  const addons = {
    basic:    { 'Anti Termite Treatment':false,'Basement Plastering':false,'Sill Slab':false,'Waterproofing for Sunken Portions':false },
    standard: { 'Anti Termite Treatment':false,'Basement Plastering':false,'Sill Slab':true, 'Waterproofing for Sunken Portions':false },
    premium:  { 'Anti Termite Treatment':true, 'Basement Plastering':true, 'Sill Slab':true, 'Waterproofing for Sunken Portions':false }
  };

  const emojiMap = { basic:'🏡', standard:'🏗️', premium:'🏛️' };

  // ── FLOOR DIMENSION INPUTS ────────────────────────────
  function buildFloorInputs() {
    const raw = parseInt(document.getElementById('numFloors').value)||1;
    const n = Math.max(1, Math.min(raw, 20));
    const container = document.getElementById('floorDimsContainer');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      container.innerHTML += `
        <div style="margin-bottom:12px">
          <label class="form-label" style="margin-bottom:6px">${getFloorName(i)} — Length × Breadth (ft)</label>
          <div style="display:grid;grid-template-columns:1fr auto 1fr auto;gap:8px;align-items:center">
            <input class="form-input" type="number" id="fl-l-${i}" placeholder="Length" oninput="calcTotalSft()" style="text-align:center"/>
            <span style="color:var(--muted);font-size:1.1rem">×</span>
            <input class="form-input" type="number" id="fl-b-${i}" placeholder="Breadth" oninput="calcTotalSft()" style="text-align:center"/>
            <span style="color:var(--muted);font-size:0.82rem" id="fl-sft-${i}">— sft</span>
          </div>
        </div>`;
    }
    if (document.getElementById('packageType')) calcTotalSft();
  }

  function calcTotalSft() {
    const n = parseInt(document.getElementById('numFloors').value);
    let total = 0;
    for (let i = 0; i < n; i++) {
      const l = parseFloat(document.getElementById('fl-l-'+i)?.value) || 0;
      const b = parseFloat(document.getElementById('fl-b-'+i)?.value) || 0;
      const sft = l * b;
      const el = document.getElementById('fl-sft-'+i);
      if (el) el.textContent = sft > 0 ? sft.toLocaleString('en-IN') + ' sft' : '— sft';
      total += sft;
    }
    const baEl = document.getElementById('builtArea');
    const tsEl = document.getElementById('totalSftDisplay');
    if (baEl) baEl.value = total;
    if (tsEl) tsEl.textContent = total.toLocaleString('en-IN') + ' sft';
    if (document.getElementById('packageType')) updatePreview();
  }

  function getFloorDims() {
    const n = parseInt(document.getElementById('numFloors').value);
    const dims = [];
    for (let i = 0; i < n; i++) {
      const l = parseFloat(document.getElementById('fl-l-'+i)?.value) || 0;
      const b = parseFloat(document.getElementById('fl-b-'+i)?.value) || 0;
      dims.push({ name: getFloorName(i), l, b, sft: l*b });
    }
    return dims;
  }

  // ── ADD-ONS ───────────────────────────────────────────
  function toggleAddon(key) {
    const chk = document.getElementById('chk-'+key).checked;
    const div = document.getElementById('addon-'+key);
    div.style.display = chk ? 'block' : 'none';
    updatePreview();
  }

  function getAddonData() {
    const result = [];
    ['septic','sump','rcc'].forEach(key => {
      const chkEl = document.getElementById('chk-'+key);
      const chk = chkEl ? chkEl.checked : false;
      if (chk) {
        const litres = parseInt(document.getElementById('val-'+key)?.value || 0);
        const cost = litres * ADDON_RATES[key];
        result.push({ key, label: ADDON_LABELS[key], litres, rate: ADDON_RATES[key], cost });
      }
    });
    return result;
  }

  // ── PAGE NAV ──────────────────────────────────────────
  function showPage(name, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const pg = document.getElementById('page-' + name);
    if (pg) pg.classList.add('active');
    if (btn) btn.classList.add('active');
    window.scrollTo(0, 0);
    if (name === 'projects') renderProjectsPage();
    if (name === 'settings') loadSettingsPage();
  }

  function loadSettingsPage() {
    const cfg = getConfig();
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('cfg-company', cfg.company);
    setVal('cfg-tagline', cfg.tagline);
    setVal('cfg-phone', cfg.phone);
    setVal('cfg-email', cfg.email);
    setVal('cfg-city', cfg.city);
    if (cfg.logo) {
      const img = document.getElementById('settingsLogoImg');
      const ph  = document.getElementById('settingsLogoPlaceholder');
      if (img) { img.src = cfg.logo; img.style.display = 'block'; }
      if (ph)  ph.style.display = 'none';
    }
    const specsTA = document.getElementById('specsed-textarea-specs');
    const termsTA = document.getElementById('specsed-textarea-terms');
    if (specsTA) specsTA.value = getSpecsText('specs');
    if (termsTA) termsTA.value = getSpecsText('terms');
    if (typeof renderAdminList === 'function') renderAdminList();
  }

  // ── LIVE PREVIEW ──────────────────────────────────────
  function updatePreview() {
    const name   = document.getElementById('clientName').value || '—';
    const phone  = document.getElementById('clientPhone').value || '—';
    const loc    = document.getElementById('clientLocation').value || '—';
    const pkg    = document.getElementById('packageType')?.value || 'standard';
    const area   = parseInt(document.getElementById('builtArea').value) || 0;
    const floors = document.getElementById('numFloors').value;
    const type   = document.getElementById('projectType').value;
    const valid  = document.getElementById('validUntil').value;

    document.getElementById('prev-name').textContent = name;
    document.getElementById('prev-phone').textContent = phone;
    document.getElementById('prev-location').textContent = loc;
    document.getElementById('prev-package').innerHTML = `<span class="package-pill ${pillClass[pkg]}">${pkgLabel[pkg]}</span>`;
    document.getElementById('prev-rate').textContent = '₹' + rates[pkg].toLocaleString('en-IN') + ' / sft';
    document.getElementById('prev-area').textContent = area.toLocaleString('en-IN') + ' sft';
    document.getElementById('prev-floors').textContent = getFloorLabel(floors);
    document.getElementById('prev-type').textContent = type;
    document.getElementById('prev-valid').textContent = valid ? new Date(valid).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : '—';

    // Floor breakdown in preview
    const dims = getFloorDims();
    const floorDetailsEl = document.getElementById('prev-floor-details');
    if (floorDetailsEl) {
      floorDetailsEl.innerHTML = dims.filter(d=>d.sft>0).map(d=>
        `<div class="preview-row" style="padding-left:12px">
          <span class="preview-label" style="font-size:0.78rem">↳ ${d.name}</span>
          <span class="preview-val" style="font-size:0.82rem">${d.l}×${d.b} = ${d.sft.toLocaleString('en-IN')} sft</span>
        </div>`).join('');
    }

    // Addons
    const addonData = getAddonData();
    const addonRows = document.getElementById('prev-addons-rows');
    if (addonRows) {
      addonRows.innerHTML = addonData.map(a=>
        `<div class="preview-row">
          <span class="preview-label">${a.label} (${a.litres.toLocaleString('en-IN')}L)</span>
          <span class="preview-val">₹${a.cost.toLocaleString('en-IN')}</span>
        </div>`).join('');
    }

    const constructionCost = area * rates[pkg];
    const addonTotal = addonData.reduce((s,a)=>s+a.cost, 0);
    const grandTotal = constructionCost + addonTotal;

    document.getElementById('prev-total').textContent = '₹' + grandTotal.toLocaleString('en-IN');
    document.getElementById('prev-breakdown').textContent = `${area.toLocaleString('en-IN')} sft × ₹${rates[pkg].toLocaleString('en-IN')}/sft = ₹${constructionCost.toLocaleString('en-IN')}`;
    const addonTotalEl = document.getElementById('prev-addons-total');
    if (addonTotalEl) addonTotalEl.textContent = addonTotal > 0 ? `+ Additional works ₹${addonTotal.toLocaleString('en-IN')}` : '';

    document.getElementById('shareBox').classList.remove('visible');
  }

  // ── GENERATE LINK ─────────────────────────────────────
  async function generateShareLink() {
    const name  = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const loc   = document.getElementById('clientLocation').value.trim();
    const pkg   = document.getElementById('packageType').value;
    const area  = document.getElementById('builtArea').value;
    const floors= document.getElementById('numFloors').value;
    const type  = document.getElementById('projectType').value;
    const valid = document.getElementById('validUntil').value;
    const notes = document.getElementById('notes').value.trim();
    const dims  = getFloorDims();
    const addonData = getAddonData();

    if (!name) { alert('Please enter client name.'); return; }
    if (!phone) { alert('Please enter client phone number (needed for secure quote access).'); return; }
    if (!area || area <= 0) { alert('Please enter floor dimensions.'); return; }

    const data = { n:name, p:phone, l:loc, pkg, a:area, f:floors, t:type, v:valid, nt:notes, dims, addons:addonData };

    const btn = event ? event.target : null;
    if (btn) { btn.disabled = true; btn.textContent = 'Saving quote...'; }

    if (!window.SB_SESSION || !window.SB_COMPANY_ID) {
      alert('You must be signed in to generate a shareable quote link.');
      if (btn) { btn.disabled = false; btn.textContent = 'Generate Share Link'; }
      return;
    }

    try {
      const url = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
      const key = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';
      const totalAmount = (parseFloat(area)||0) * (rates[pkg]||0) + addonData.reduce((s,a)=>s+(a.cost||0),0);

      const res = await fetch(`${url}/rest/v1/quotes`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + window.SB_SESSION.access_token,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          company_id: window.SB_COMPANY_ID,
          client_name: name,
          client_phone: phone,
          client_location: loc,
          quote_type: 'construction',
          quote_data: data,
          status: 'sent',
          total_amount: totalAmount
        })
      });

      if (!res.ok) throw new Error('Failed to save quote (status ' + res.status + ')');
      const rows = await res.json();
      const shortCode = rows[0].short_code;

      const link = window.location.href.split('?')[0] + '?quote=' + shortCode;
      document.getElementById('shareLinkInput').value = link;
      document.getElementById('shareBox').classList.add('visible');

    } catch (err) {
      alert('❌ Could not generate share link: ' + err.message);
    }

    if (btn) { btn.disabled = false; btn.textContent = 'Generate Share Link'; }
  }

  function copyLink() {
    const inp = document.getElementById('shareLinkInput');
    inp.select(); document.execCommand('copy');
    const btn = event.target;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  }

  function shareWhatsApp() {
    const link = document.getElementById('shareLinkInput').value;
    const name = document.getElementById('clientName').value || 'you';
    const msg = `Hello! Please find your construction quote from Elite Homes below:\n\n${link}\n\nFeel free to contact us for any queries.`;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  }

  // ── CLIENT VIEW ───────────────────────────────────────
  function loadClientView(data) {
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('client-view').style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach(b => { if (b.textContent.includes('Quote')) b.style.display='none'; });
    document.querySelector('.nav-cta').style.display = 'none';
    document.querySelector('.admin-trigger').style.display = 'none';

    const pkg   = data.pkg || 'standard';
    const area  = parseInt(data.a) || 0;
    const today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const validDate = data.v ? new Date(data.v).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : '30 days from issue';
    const addonData = data.addons || [];
    const constructionCost = area * rates[pkg];
    const addonTotal = addonData.reduce((s,a)=>s+(a.cost||0),0);
    const grandTotal = constructionCost + addonTotal;

    document.getElementById('c-name').textContent     = data.n||'Valued Client';
    document.getElementById('c-namedet').textContent  = data.n||'—';
    document.getElementById('c-phone').textContent    = data.p||'—';
    document.getElementById('c-loc').textContent      = data.l||'—';
    document.getElementById('c-type').textContent     = data.t||'—';
    document.getElementById('c-area').textContent     = area.toLocaleString('en-IN')+' sft';
    document.getElementById('c-floors').textContent   = getFloorLabel(data.f)||'—';
    document.getElementById('c-quotedate').textContent= today;
    document.getElementById('c-valid').textContent    = validDate;
    document.getElementById('c-total').textContent    = '₹'+grandTotal.toLocaleString('en-IN');
    document.getElementById('c-break').textContent    = `Construction: ₹${constructionCost.toLocaleString('en-IN')}${addonTotal>0?' + Additional: ₹'+addonTotal.toLocaleString('en-IN'):''}`;
    document.getElementById('c-pkgpill').className    = 'package-pill '+pillClass[pkg];
    document.getElementById('c-pkgpill').textContent  = pkgLabel[pkg]+' Package';
    document.getElementById('c-pkgrate').textContent  = '₹'+rates[pkg].toLocaleString('en-IN')+' / sft';
    document.getElementById('c-notes').textContent    = data.nt ? '📝 Note: '+data.nt : '⚠️ Indicative estimate. Final cost subject to site inspection and structural design.';

    // Floor breakdown in client view
    const floorDet = document.getElementById('c-floors');
    if (data.dims && data.dims.length) {
      const parent = floorDet.closest('.client-detail-item');
      let html = `<div class="client-detail-label">Floor Breakdown</div>`;
      data.dims.forEach(d => {
        if (d.sft>0) html += `<div class="client-detail-val" style="font-size:0.82rem;font-weight:500">${d.name}: ${d.l}×${d.b} = ${Number(d.sft).toLocaleString('en-IN')} sft</div>`;
      });
      parent.innerHTML = html;
    }

    // Add-ons card
    if (addonData.length > 0) {
      const addonsCard = document.createElement('div');
      addonsCard.className = 'client-card';
      addonsCard.innerHTML = `<h3>Additional Works</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid var(--border)">
            <th style="text-align:left;padding:8px 0;font-size:0.78rem;color:var(--muted);font-weight:600">Item</th>
            <th style="text-align:right;padding:8px 0;font-size:0.78rem;color:var(--muted);font-weight:600">Capacity</th>
            <th style="text-align:right;padding:8px 0;font-size:0.78rem;color:var(--muted);font-weight:600">Rate</th>
            <th style="text-align:right;padding:8px 0;font-size:0.78rem;color:var(--muted);font-weight:600">Amount</th>
          </tr>
          ${addonData.map(a=>`
          <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
            <td style="padding:10px 0;font-size:0.88rem">${a.label}</td>
            <td style="padding:10px 0;font-size:0.88rem;text-align:right">${Number(a.litres).toLocaleString('en-IN')} L</td>
            <td style="padding:10px 0;font-size:0.88rem;text-align:right">₹${a.rate}/L</td>
            <td style="padding:10px 0;font-size:0.88rem;font-weight:700;text-align:right">₹${Number(a.cost).toLocaleString('en-IN')}</td>
          </tr>`).join('')}
          <tr>
            <td colspan="3" style="padding:10px 0;font-size:0.85rem;font-weight:700;color:var(--gold)">Total Additional Works</td>
            <td style="padding:10px 0;font-size:0.9rem;font-weight:800;color:var(--gold);text-align:right">₹${addonTotal.toLocaleString('en-IN')}</td>
          </tr>
        </table>`;
      const disclaimer = document.querySelector('#client-view .note-box, #client-view [style*="Disclaimer"]') || document.getElementById('c-notes').closest('.client-card').nextElementSibling;
      const actionsDiv = document.querySelector('.client-actions');
      actionsDiv.before(addonsCard);
    }

    // Highlight comparison
    ['basic','standard','premium'].forEach(p => {
      const th = document.getElementById('cmp-th-'+p);
      if (th && p===pkg) { th.style.outline='2px solid var(--gold)'; th.style.background='rgba(201,168,76,0.18)'; th.textContent=pkgLabel[p]+' ✦ Your Pick'; }
      const rc = document.getElementById('cmp-rate-'+p);
      if (rc && p===pkg) { rc.style.fontWeight='800'; rc.style.color='var(--gold)'; }
    });

    // Specs
    const specs = pkgSpecs[pkg];
    const specItems=[['Cement',specs.cement],['TMT Steel',specs.steel],['Sand',specs.sand],['Bricks',specs.bricks],['Main Door',specs.door],['Inner Doors',specs.innerDoor],['Exterior Doors',specs.exteriorDoor],['Windows',specs.windows],['Hardwares',specs.hardware],['Handrails',specs.handrails],['Main Gate',specs.mainGate],['Tiles',specs.tiles],['Staircase Floor',specs.staircase],['Switches',specs.switches],['Electric Cables',specs.cables],['Water Pipes',specs.pipes],['Sanitary Fittings',specs.sanitary],['Water Closets',specs.closets],['Interior Painting',specs.interiorPaint],['Exterior Painting',specs.exteriorPaint],['Joinery Painting',specs.joineryPaint],['Basement Height',specs.basement]];
    document.getElementById('c-specs-grid').innerHTML = specItems.map(([l,v])=>
      `<div class="client-spec-item"><div class="client-spec-label">${l}</div><div class="client-spec-val">${v}</div></div>`).join('');

    const addonPkg = addons[pkg];
    document.getElementById('c-addons').innerHTML = Object.entries(addonPkg).map(([k,v])=>
      `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:1.1rem">${v?'✅':'❌'}</span>
        <span style="font-size:0.87rem;${v?'':'color:var(--muted)'}">${k}</span>
      </div>`).join('');
  }

  // ── DOWNLOAD QUOTE HTML ───────────────────────────────
  function downloadQuoteHTML() {
    const cfg    = getConfig();
    const name   = document.getElementById('clientName').value.trim();
    const phone  = document.getElementById('clientPhone').value.trim();
    const loc    = document.getElementById('clientLocation').value.trim();
    const pkg    = document.getElementById('packageType').value;
    const area   = parseInt(document.getElementById('builtArea').value)||0;
    const floors = document.getElementById('numFloors').value;
    const type   = document.getElementById('projectType').value;
    const valid  = document.getElementById('validUntil').value;
    const notes  = document.getElementById('notes').value.trim();
    const dims   = getFloorDims();
    const addonData = getAddonData();

    if (!name) { alert('Please enter client name.'); return; }
    if (!area)  { alert('Please enter floor dimensions.'); return; }

    const constructionCost = area * rates[pkg];
    const addonTotal = addonData.reduce((s,a)=>s+a.cost,0);
    const grandTotal = constructionCost + addonTotal;
    const today     = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const validDate = valid ? new Date(valid).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : '30 days from issue';
    const specs     = pkgSpecs[pkg];
    const addonPkg  = addons[pkg];

    const logoEl = document.querySelector('.nav-logo img');
    const logoSrc = logoEl ? logoEl.src : '';

    const floorRowsHTML = dims.filter(d=>d.sft>0).map(d=>
      `<tr><td style="padding-left:20px;color:#888">↳ ${d.name}</td><td><strong>${d.l} × ${d.b} ft = ${Number(d.sft).toLocaleString('en-IN')} sft</strong></td></tr>`).join('');

    const addonRowsHTML = addonData.length ? `
      <tr style="background:#f5f0e8"><td colspan="2" style="padding:10px 12px;font-weight:700;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#888">Additional Works</td></tr>
      ${addonData.map(a=>`<tr><td>${a.label} (${Number(a.litres).toLocaleString('en-IN')} litres × ₹${a.rate}/litre)</td><td><strong>₹${Number(a.cost).toLocaleString('en-IN')}</strong></td></tr>`).join('')}` : '';

    const specRowsHTML = [['Cement',specs.cement],['TMT Steel',specs.steel],['Sand',specs.sand],['Bricks',specs.bricks],['Main Door',specs.door],['Inner Doors',specs.innerDoor],['Exterior Doors',specs.exteriorDoor],['Windows',specs.windows],['Hardwares',specs.hardware],['Handrails',specs.handrails],['Main Gate',specs.mainGate],['Tiles',specs.tiles],['Staircase Floor',specs.staircase],['Switches',specs.switches],['Electric Cables',specs.cables],['Water Pipes',specs.pipes],['Sanitary Fittings',specs.sanitary],['Water Closets',specs.closets],['Interior Painting',specs.interiorPaint],['Exterior Painting',specs.exteriorPaint],['Joinery Painting',specs.joineryPaint],['Basement Height',specs.basement]]
      .map(([l,v])=>`<tr><td>${l}</td><td><strong>${v}</strong></td></tr>`).join('');

    const addonIncHTML = Object.entries(addonPkg).map(([k,v])=>
      `<div class="addon-item"><span>${v?'✅':'❌'}</span><span style="${v?'':'color:#bbb'}">${k}</span></div>`).join('');

    const cmpHL = (p) => p===pkg ? 'background:#fffbef;font-weight:800;color:#8B5E2A;border:2px solid #C9A84C;' : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Quote for ${name} — ${cfg.company}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#f5f5f5;color:#222}
  .page{max-width:800px;margin:0 auto;padding:32px 20px}
  .header{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:3px solid #C9A84C;margin-bottom:28px}
  .logo{display:flex;align-items:center;gap:10px}
  .logo img{height:48px;width:48px;object-fit:contain;border-radius:8px}
  .logo-text{font-family:Georgia,serif;font-size:1.4rem;font-weight:900;color:#8B5E2A}
  .logo-sub{font-size:0.75rem;color:#999;margin-top:2px}
  .header-right{text-align:right;font-size:0.82rem;color:#666}
  .header-right strong{color:#222;display:block;margin-bottom:2px}
  .banner{background:linear-gradient(135deg,#fffbef,#fff8e0);border:1px solid #C9A84C;border-radius:12px;padding:20px 24px;margin-bottom:22px;display:flex;align-items:center;gap:14px}
  .banner h2{font-family:Georgia,serif;font-size:1.3rem;color:#5a3e10}
  .banner p{font-size:0.84rem;color:#888;margin-top:3px}
  .total-box{background:linear-gradient(135deg,#fffbef,#fff5d0);border:2px solid #C9A84C;border-radius:14px;padding:26px;text-align:center;margin-bottom:22px}
  .total-label{font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#999}
  .total-amount{font-family:Georgia,serif;font-size:2.8rem;font-weight:900;color:#8B5E2A;margin:8px 0 4px}
  .total-break{font-size:0.82rem;color:#999}
  .card{background:#fff;border:1px solid #e8e0d0;border-radius:12px;padding:22px;margin-bottom:18px}
  .card h3{font-size:0.7rem;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f0e8d8}
  .detail-grid{display:grid;grid-template-columns:1fr 1fr}
  .detail-item{padding:9px 0;border-bottom:1px solid #f5f0e8}
  .detail-item:nth-last-child(-n+2){border:none}
  .detail-label{font-size:0.73rem;color:#999;margin-bottom:2px}
  .detail-val{font-size:0.88rem;font-weight:700}
  .pkg-badge{display:inline-block;padding:5px 16px;border-radius:20px;font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px}
  .badge-basic{background:#e8f5f0;color:#3a7a62;border:1px solid #a8d5c5}
  .badge-standard{background:#fff8e0;color:#8B5E2A;border:1px solid #C9A84C}
  .badge-premium{background:#fff0e8;color:#8B3a1A;border:1px solid #d4845a}
  table{width:100%;border-collapse:collapse}
  th{background:#faf5ec;padding:9px 12px;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;color:#888;font-weight:700;border-bottom:2px solid #e8dfc8;text-align:left}
  td{padding:9px 12px;border-bottom:1px solid #f5f0e8;font-size:0.86rem}
  tr:last-child td{border:none}
  .cmp-td{text-align:center}
  .addon-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .addon-item{display:flex;align-items:center;gap:8px;padding:9px 12px;background:#fafaf8;border-radius:8px;border:1px solid #eee;font-size:0.85rem}
  .spec-section{margin-bottom:16px}
  .spec-section h4{font-size:0.82rem;font-weight:700;color:#8B5E2A;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #f0e8d8}
  .spec-section p,.spec-section li{font-size:0.8rem;color:#555;line-height:1.75;margin-bottom:3px}
  .spec-section ul{padding-left:16px}
  .note-box{background:#fafaf8;border:1px solid #e8e0d0;border-radius:10px;padding:12px 16px;font-size:0.78rem;color:#888;line-height:1.7;margin-bottom:18px}
  .footer{margin-top:32px;padding-top:18px;border-top:2px solid #C9A84C;display:flex;justify-content:space-between;align-items:center}
  .footer-logo{display:flex;align-items:center;gap:8px}
  .footer-logo img{height:36px;width:36px;object-fit:contain;border-radius:6px}
  .footer-name{font-family:Georgia,serif;font-size:0.95rem;font-weight:700;color:#8B5E2A}
  .footer-contact{font-size:0.78rem;color:#888;text-align:right}
  .footer-contact strong{display:block;color:#333}
  .wa-btn{display:inline-block;margin-top:6px;padding:7px 16px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-size:0.8rem;font-weight:700}
  .cost-summary tr td:last-child{text-align:right;font-weight:700}
  .grand-total-row td{font-size:1rem;font-weight:900;color:#8B5E2A;border-top:2px solid #C9A84C;padding-top:12px}
  @media print{body{background:#fff}.wa-btn{display:none}.page{padding:16px}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      ${logoSrc ? `<img src="${logoSrc}" alt="${cfg.company}"/>` : ''}
      <div><div class="logo-text">${cfg.company}</div><div class="logo-sub">${cfg.tagline} · ${cfg.city}</div></div>
    </div>
    <div class="header-right"><strong>${today}</strong>Valid until: ${validDate}</div>
  </div>

  <div class="banner">
    <div style="font-size:2rem">🏗️</div>
    <div><h2>Dear ${name},</h2><p>Thank you for considering ${cfg.company}. Here is your personalised construction quote.</p></div>
  </div>

  <div class="card">
    <h3>Project Cost — Floor Wise</h3>
    <table>
      <tr><th>Floor</th><th style="text-align:right">Area (sft)</th><th style="text-align:right">Rate (₹/sft)</th><th style="text-align:right">Amount</th></tr>
      ${floorLines.map(f=>`<tr>
        <td><strong>${f.name}</strong></td>
        <td style="text-align:right">${f.sft.toLocaleString('en-IN')}</td>
        <td style="text-align:right">₹${f.rate.toLocaleString('en-IN')}/sft</td>
        <td style="text-align:right"><strong>₹${f.amt.toLocaleString('en-IN')}</strong></td>
      </tr>`).join('')}
      ${addonData.map(a=>`<tr>
        <td>${a.label}</td>
        <td style="text-align:right">${Number(a.litres).toLocaleString('en-IN')} litres</td>
        <td style="text-align:right">₹${a.rate}/litre</td>
        <td style="text-align:right"><strong>₹${Number(a.cost).toLocaleString('en-IN')}</strong></td>
      </tr>`).join('')}
      ${extraRows.length ? extraRows.map(r=>`<tr>
        <td>${r.desc}</td>
        <td style="text-align:right">${r.qty} ${r.unit}</td>
        <td style="text-align:right">₹${r.price.toLocaleString('en-IN')}</td>
        <td style="text-align:right"><strong>₹${r.total.toLocaleString('en-IN')}</strong></td>
      </tr>`).join('') : ''}
      <tr style="background:#faf5ec;border-top:2px solid #C9A84C">
        <td colspan="3"><strong>Total Project Cost</strong></td>
        <td style="text-align:right;font-size:1.1rem;font-weight:900;color:#8B5E2A">₹${grandTotal.toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>

  <div class="card">
    <h3>Project Information</h3>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Client Name</div><div class="detail-val">${name}</div></div>
      <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-val">${phone||'—'}</div></div>
      <div class="detail-item"><div class="detail-label">Project Location</div><div class="detail-val">${loc||'—'}</div></div>
      <div class="detail-item"><div class="detail-label">Project Type</div><div class="detail-val">${type}</div></div>
      <div class="detail-item"><div class="detail-label">Total Built-up Area</div><div class="detail-val">${area.toLocaleString('en-IN')} sft</div></div>
      <div class="detail-item"><div class="detail-label">Number of Floors</div><div class="detail-val">${getFloorLabel(floors)}</div></div>
    </div>
  </div>



  <div class="card">
    <h3>Package — ${pkgLabel[pkg]} Specifications</h3>
    <span class="pkg-badge badge-${pkg}">${pkgLabel[pkg]} — ₹${rates[pkg].toLocaleString('en-IN')}/sft</span>
    <table>${specRowsHTML}</table>
  </div>

  <div class="card">
    <h3>Package Inclusions</h3>
    <div class="addon-grid">${addonIncHTML}</div>
  </div>

  <div class="card">
    <h3>General Specifications</h3>
    <div class="spec-section"><h4>Foundation & Structure</h4><ul>
      <li>Foundation: 5 ft below GL with column footing, RCC 1:2:4</li>
      <li>Basement: 3 ft above RL, columns in RCC 1:1.5:3, brickwork in CM 1:6</li>
      <li>Super structure: 9" thick brick wall in CM 1:6, 10 ft height</li>
      <li>RCC framed structure — Columns: RCC 1:1.5:3 | Other: RCC 1:2:4</li>
      <li>Roof slab: RCC 4.5" thick, mix 1:2:4 | Centring: Steel sheet</li>
    </ul></div>
    <div class="spec-section"><h4>Joineries</h4><ul>
      <li>Main door: Sudan Teak frame & shutter</li>
      <li>Exterior doors: Vengai wood frame & shutters</li>
      <li>Toilet doors: WPC door with WPC frame</li>
      <li>Other doors: Vengai wood frame with ISI make flush doors</li>
                </ul></div>
    <div class="spec-section"><h4>Flooring</h4><ul>
      <li>Floor: Vitrified tiles over CC 1:5:10 bed — rate as per package specification</li>
      <li>Portico: Vitrified tiles — rate as per package specification</li>
      <li>Staircase: Tiles — rate as per package specification</li>
    </ul></div>
    <div class="spec-section"><h4>Finishing & Painting</h4><ul>
      <li>Ceiling plaster: CM 1:3, 0.5" thick</li>
      <li>Wall plaster: CM 1:5, 0.5" thick</li>
      <li>Interior: Basic plastic emulsion (as per selected brand) — 2 coats over 2 coats wall putty</li>
      <li>Exterior: Exterior emulsion — 2 coats over 1 coat primer</li>
      <li>Main door: Varnishing | Other joineries: Enamel — 2 coats over primer</li>
    </ul></div>
    <div class="spec-section"><h4>Tiling</h4><ul>
      <li>Kitchen: 2 ft dado with ceramic tiles — ₹30/sft</li>
      <li>Toilet walls: Glazed tiles to 7 ft height — ₹40/sft</li>
      <li>Toilet floor: Ceramic tiles — ₹30/sft</li>
    </ul></div>
    <div class="spec-section"><h4>Electrical & Plumbing</h4><ul>
      <li>Main switch: Three phase provision — one each per floor</li>
      <li>AC provision: For all bedrooms</li>
      <li>TV socket: Hall and Master bedroom</li>
      <li>Other basic electrical provisions will be provided</li>
      <li>Cables: As per package specification (Basic: Kundan/V-Guard | Standard: Finolex | Premium: Hawells)</li>
      <li>Switches: As per package specification (Basic: GM | Standard: Anchor Roma | Premium: Legrand) — modular switches with metal box</li>
      <li>Plumbing: ISI make CPVC pipe lines from OHT to outlet tap with ISI make SS fittings</li>
      <li>Water pipes: Ashirvad CPVC pipes</li>
      <li>Sanitary pipes: Finolex</li>
    </ul></div>
    <div class="spec-section"><h4>Other Works</h4><ul>
      <li>Waterproofing: As per specifications — applied to OHT and all sunken portions</li>
      <li>Weathering course: Screed concrete 1:3:6 with waterproofing compound, topped with cool tiles</li>
      <li>Kitchen: Granite table top with stainless steel sink</li>
      <li>Water closet: Parryware or equivalent — EWC (European Water Closet), basic model</li>
      <li>Sanitary fittings: Jaquar or equivalent — basic model</li>
                </ul></div>
  </div>

  ${notes ? `<div class="note-box">📝 <strong>Note:</strong> ${notes}</div>` : ''}
  <div class="note-box">⚠️ <strong>Disclaimer:</strong> This is an indicative estimate. Final cost confirmed after site inspection, soil test, and structural design. Rates subject to revision based on material prices at time of procurement.</div>

  <div class="card">
    <h3>Package Comparison — Your Selection Highlighted</h3>
    <div style="overflow-x:auto"><table>
      <thead><tr>
        <th>Specification</th>
        <th style="text-align:center;${cmpHL('basic')}">Basic<br/><small>₹2,100/sft</small>${pkg==='basic'?'<br/><small>✦ Your Pick</small>':''}</th>
        <th style="text-align:center;${cmpHL('standard')}">Standard<br/><small>₹2,300/sft</small>${pkg==='standard'?'<br/><small>✦ Your Pick</small>':''}</th>
        <th style="text-align:center;${cmpHL('premium')}">Premium<br/><small>₹2,550/sft</small>${pkg==='premium'?'<br/><small>✦ Your Pick</small>':''}</th>
      </tr></thead>
      <tbody>
        <tr><td>Cement</td><td class="cmp-td" style="${cmpHL('basic')}">Priya / Penna</td><td class="cmp-td" style="${cmpHL('standard')}">Ramco / Dalmia</td><td class="cmp-td" style="${cmpHL('premium')}">Ultratech</td></tr>
        <tr><td>TMT Steel</td><td class="cmp-td" style="${cmpHL('basic')}">Suryadev / Thirumala</td><td class="cmp-td" style="${cmpHL('standard')}">Agni</td><td class="cmp-td" style="${cmpHL('premium')}">TATA TMT</td></tr>
        <tr><td>Sand</td><td class="cmp-td" style="${cmpHL('basic')}">M-Sand / P-Sand</td><td class="cmp-td" style="${cmpHL('standard')}">M-Sand / P-Sand</td><td class="cmp-td" style="${cmpHL('premium')}">M-Sand / P-Sand</td></tr>
        <tr><td>Bricks</td><td class="cmp-td" style="${cmpHL('basic')}">Fly Ash</td><td class="cmp-td" style="${cmpHL('standard')}">Red Brick</td><td class="cmp-td" style="${cmpHL('premium')}">Wire-cut Red Brick</td></tr>
        <tr><td>Main Door</td><td class="cmp-td" style="${cmpHL('basic')}">Vengai wood frame with Flush door</td><td class="cmp-td" style="${cmpHL('standard')}">Vengai wood frame with Vengai wood shutter</td><td class="cmp-td" style="${cmpHL('premium')}">African Teak wood frame with African Teak wood shutter</td></tr>
        <tr><td>Inner Doors</td><td class="cmp-td" style="${cmpHL('basic')}">Vengai wood frame with Flushdoor</td><td class="cmp-td" style="${cmpHL('standard')}">Vengai wood frame with Flushdoor</td><td class="cmp-td" style="${cmpHL('premium')}">Vengai wood frame with Flushdoor (ISI make)</td></tr>
        <tr><td>Exterior Doors</td><td class="cmp-td" style="${cmpHL('basic')}">Vengai Wood Frame with Vengai Shutter</td><td class="cmp-td" style="${cmpHL('standard')}">Vengai Wood Frame with Vengai Shutter</td><td class="cmp-td" style="${cmpHL('premium')}">Vengai Wood Frame with Vengai Shutter</td></tr>
        <tr><td>Windows</td><td class="cmp-td" style="${cmpHL('basic')}">UPVC</td><td class="cmp-td" style="${cmpHL('standard')}">UPVC</td><td class="cmp-td" style="${cmpHL('premium')}">Vengai Wood</td></tr>
        <tr><td>Hardwares</td><td class="cmp-td" style="${cmpHL('basic')}">Powder coated</td><td class="cmp-td" style="${cmpHL('standard')}">Powder coated</td><td class="cmp-td" style="${cmpHL('premium')}">Stainless Steel</td></tr>
        <tr><td>Handrails</td><td class="cmp-td" style="${cmpHL('basic')}">MS</td><td class="cmp-td" style="${cmpHL('standard')}">Stainless Steel</td><td class="cmp-td" style="${cmpHL('premium')}">Stainless Steel</td></tr>
        <tr><td>Main Gate</td><td class="cmp-td" style="${cmpHL('basic')}">MS</td><td class="cmp-td" style="${cmpHL('standard')}">MS</td><td class="cmp-td" style="${cmpHL('premium')}">SS</td></tr>
        <tr><td>Tiles</td><td class="cmp-td" style="${cmpHL('basic')}">₹40/sft</td><td class="cmp-td" style="${cmpHL('standard')}">₹50/sft</td><td class="cmp-td" style="${cmpHL('premium')}">₹60/sft</td></tr>
        <tr><td>Staircase Floor</td><td class="cmp-td" style="${cmpHL('basic')}">Vitrified Tiles</td><td class="cmp-td" style="${cmpHL('standard')}">Vitrified Tiles</td><td class="cmp-td" style="${cmpHL('premium')}">Granite</td></tr>
        <tr><td>Switches</td><td class="cmp-td" style="${cmpHL('basic')}">GM</td><td class="cmp-td" style="${cmpHL('standard')}">Anchor Roma</td><td class="cmp-td" style="${cmpHL('premium')}">Legrand</td></tr>
        <tr><td>Electric Cables</td><td class="cmp-td" style="${cmpHL('basic')}">Kundan / V-Guard</td><td class="cmp-td" style="${cmpHL('standard')}">Finolex</td><td class="cmp-td" style="${cmpHL('premium')}">Hawells</td></tr>
        <tr><td>Water Pipes</td><td class="cmp-td" style="${cmpHL('basic')}">Star</td><td class="cmp-td" style="${cmpHL('standard')}">Finolex</td><td class="cmp-td" style="${cmpHL('premium')}">Astral / Ashirwad</td></tr>
        <tr><td>Sanitary Fittings</td><td class="cmp-td" style="${cmpHL('basic')}">Parryware</td><td class="cmp-td" style="${cmpHL('standard')}">Jaquar</td><td class="cmp-td" style="${cmpHL('premium')}">Roca</td></tr>
        <tr><td>Water Closets</td><td class="cmp-td" style="${cmpHL('basic')}">Parryware</td><td class="cmp-td" style="${cmpHL('standard')}">Parryware</td><td class="cmp-td" style="${cmpHL('premium')}">Jaquar</td></tr>
        <tr><td>Interior Painting</td><td class="cmp-td" style="${cmpHL('basic')}">Asian Tractor</td><td class="cmp-td" style="${cmpHL('standard')}">Asian Tractor</td><td class="cmp-td" style="${cmpHL('premium')}">Asian Premium</td></tr>
        <tr><td>Exterior Painting</td><td class="cmp-td" style="${cmpHL('basic')}">Asian Ace</td><td class="cmp-td" style="${cmpHL('standard')}">Asian Ace</td><td class="cmp-td" style="${cmpHL('premium')}">Asian Apex</td></tr>
        <tr><td>Joinery Painting</td><td class="cmp-td" style="${cmpHL('basic')}">Asian Enamel</td><td class="cmp-td" style="${cmpHL('standard')}">Asian Enamel</td><td class="cmp-td" style="${cmpHL('premium')}">Asian Enamel</td></tr>
        <tr><td>Anti Termite Treatment</td><td class="cmp-td" style="${cmpHL('basic')}">❌</td><td class="cmp-td" style="${cmpHL('standard')}">❌</td><td class="cmp-td" style="${cmpHL('premium')}">✅</td></tr>
        <tr><td>Basement Plastering</td><td class="cmp-td" style="${cmpHL('basic')}">❌</td><td class="cmp-td" style="${cmpHL('standard')}">❌</td><td class="cmp-td" style="${cmpHL('premium')}">✅</td></tr>
        <tr><td>Sill Slab</td><td class="cmp-td" style="${cmpHL('basic')}">❌</td><td class="cmp-td" style="${cmpHL('standard')}">✅</td><td class="cmp-td" style="${cmpHL('premium')}">✅</td></tr>
      </tbody>
    </table></div>
  </div>

  <div class="card">
    <h3>Terms &amp; Conditions</h3>
    <div class="spec-section"><h4>1. Payment Schedule</h4><ul>
      <li>Advance: 15%</li>
      <li>Basement Level: 10%</li>
      <li>Ground Floor Roof Level: 15%</li>
      <li>First Floor Roof Level: 20%</li>
      <li>Second Floor Roof Level: 20%</li>
      <li>After Flooring: 15%</li>
      <li>Balance after completion</li>
      <li>Extra work payments: To be made as and when completed</li>
    </ul></div>
    <div class="spec-section"><h4>2. Scope Inclusions (No Extra Charge)</h4><ul>
      <li>Anti termite treatment, Sunshade, Loft (one per room), Staircase (if inside building), Cupboard (one per room)</li>
    </ul></div>
    <div class="spec-section"><h4>3. Extra Charges (Owner's Scope or Chargeable)</h4><ul>
      <li>Safety gate, Modular kitchen, Compound wall, Culvert, Municipal drainage, Platform, Front elevation (if super skilled), Structural glazing</li>
      <li>Septic tank: ₹25/litre | UG Sump: ₹30/litre | Overhead tank: ₹32/litre</li>
      <li>EB connection, Bath fittings, Electrical fittings, Municipal water tap — Owner's scope</li>
    </ul></div>
    <div class="spec-section"><h4>4. Project Timeline</h4><ul>
      <li>Commencement: Within 10 days of work order</li>
      <li>Completion: Within 240 days from work order date</li>
      <li>Deadline extended in case of natural calamities</li>
      <li>Liquidated damages: ₹300/day on either side</li>
    </ul></div>
    <div class="spec-section"><h4>5. Materials & Rates</h4><ul>
      <li>Rates are firm until completion. Escalation beyond 5% on steel, cement, and timber costs will be permitted accordingly</li>
      <li>Electric power and water supply: Owner's responsibility at free of cost</li>
      <li>Borewell: Owner's responsibility</li>
      <li>GST: To be borne by the owner if applicable</li>
      <li>Workman insurance/compensation: Contractor's responsibility</li>
    </ul></div>
    <div class="spec-section"><h4>6. General</h4><ul>
      <li style="font-size:1rem;font-weight:800;color:#8B5E2A;list-style:none;padding:10px 0">📋 Bills will be prepared as per actual executed work after completion</li>
      <li>Additions/alterations to agreed plan will be chargeable</li>
      <li>Building handed over after final settlement of payment</li>
      <li>Jurisdiction: Courts of Tiruvannamalai, Tamil Nadu</li>
    </ul></div>
  </div>

  <div class="footer">
    <div class="footer-logo">
      ${logoSrc ? `<img src="${logoSrc}" alt="${cfg.company}"/>` : ''}
      <div><div class="footer-name">${cfg.company}</div><div style="font-size:0.72rem;color:#999">Property Promotors · Tiruvannamalai</div></div>
    </div>
    <div class="footer-contact">
      <strong>${cfg.phone}</strong>
      ${cfg.email}
      <a class="wa-btn" href="https://wa.me/${cfg.waNumber}">💬 WhatsApp Us</a>
    </div>
  </div>
  <div style="text-align:center;font-size:0.7rem;color:#bbb;margin-top:20px;padding-top:14px;border-top:1px solid #eee">
    This quote was prepared exclusively for ${name} by ${cfg.company} — ${cfg.tagline}, ${cfg.city}.
  </div>
</div>
<!-- QUOTE_DATA:${JSON.stringify({
  name, phone, loc, pkg, area, floors, type, valid, notes, dims, addonData: addonData,
  logoSrc: document.querySelector('.nav-logo img') ? document.querySelector('.nav-logo img').src : ''
})} -->
</body>
</html>`;

    const blob = new Blob([html],{type:'text/html'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'Quote_' + name.replace(/\s+/g,'_') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── MULTI IMAGE UPLOAD ────────────────────────────────────────
  let currentPhotos = [];

  function renderPhotoGrid() {
    const grid = document.getElementById('photoUploadGrid');
    if (!grid) return;
    grid.innerHTML = '';
    currentPhotos.forEach((src, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'photo-thumb-wrap';
      wrap.innerHTML = `<img src="${src}" alt="Photo ${idx+1}"/>
        <button class="photo-thumb-del" onclick="removePhoto(${idx})" title="Remove">✕</button>`;
      grid.appendChild(wrap);
    });
    if (currentPhotos.length < 6) {
      const addBtn = document.createElement('div');
      addBtn.className = 'photo-add-btn';
      addBtn.innerHTML = '<span>📷</span><span>Add Photo</span>';
      addBtn.onclick = () => document.getElementById('ap-img-file').click();
      grid.appendChild(addBtn);
    }
    const dataEl = document.getElementById('ap-img-data');
    if (dataEl) dataEl.value = JSON.stringify(currentPhotos);
  }

  function removePhoto(idx) {
    currentPhotos.splice(idx, 1);
    renderPhotoGrid();
  }

  function handleMultiImgUpload(event) {
    const files = Array.from(event.target.files);
    const remaining = 6 - currentPhotos.length;
    const toLoad = files.slice(0, remaining);
    if (files.length > remaining) alert('Only ' + remaining + ' more photo(s) can be added (max 6).');
    if (toLoad.length === 0) return;
    let loaded = 0;
    toLoad.forEach(file => {
      if (file.size > 5*1024*1024) { alert(file.name + ' is too large. Max 5MB per photo.'); loaded++; if(loaded===toLoad.length) renderPhotoGrid(); return; }
      const reader = new FileReader();
      reader.onload = function(e) {
        currentPhotos.push(e.target.result);
        loaded++;
        if (loaded === toLoad.length) renderPhotoGrid();
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  function handleImgUpload(event) { handleMultiImgUpload(event); }


  // ── PROJECTS ──────────────────────────────────────────
  const projColors = ['proj-1','proj-2','proj-3','proj-4','proj-5','proj-6','proj-1','proj-2'];
  const defaultProjects = [
    { name:'Sivasubramaniyam Residence, Tiruvannamalai', desc:'5BHK luxury residence with premium wire-cut bricks, TATA TMT steel, full teak doors and Jaquar fittings.', area:0, value:'—', year:2025, type:'Residential', pkg:'premium', tags:['5BHK','G+2','TATA TMT'] }
  ];

  function getProjects() {
    try { const s=localStorage.getItem('bc_projects'); return s?JSON.parse(s):defaultProjects; } catch(e){return defaultProjects;}
  }
  function saveProjects(arr) {
    try{localStorage.setItem('bc_projects',JSON.stringify(arr));}catch(e){}
  }

  function renderProjectsPage() {
    const projects = getProjects();
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    if (!projects.length) { grid.innerHTML='<div class="empty-state">No projects yet. Use the admin panel to add your completed projects.</div>'; return; }
    grid.innerHTML = projects.map((p,i)=>{
      const badgeCls = p.pkg==='premium'?'badge-premium':p.pkg==='standard'?'badge-standard':'badge-basic';
      const tagsHtml = (p.tags||[]).map(t=>`<span class="project-tag">${t}</span>`).join('');
      return `<div class="project-card">
        ${(()=>{
          const imgs = p.imgs && p.imgs.length ? p.imgs : (p.img ? [p.img] : []);
          if(imgs.length===0) return `<div class="project-img-bg ${projColors[i%projColors.length]}" style="position:relative">
            <span>${emojiMap[p.pkg]||'🏠'}</span>
            <span class="project-badge ${badgeCls}">${pkgLabel[p.pkg]||p.pkg}</span>
          </div>`;
          if(imgs.length===1) return `<div class="project-img-bg" style="position:relative;background:none">
            <img src="${imgs[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" alt="${p.name}"/>
            <span class="project-badge ${badgeCls}">${pkgLabel[p.pkg]||p.pkg}</span>
          </div>`;
          // Multiple photos — carousel
          const cid='carousel-'+i;
          return `<div class="proj-carousel" id="${cid}">
            <div class="proj-carousel-track" id="${cid}-track">
              ${imgs.map(src=>`<div class="proj-carousel-slide"><img src="${src}" alt="${p.name}"/></div>`).join('')}
            </div>
            <button class="proj-carousel-btn proj-carousel-prev" onclick="carouselMove('${cid}',-1)">‹</button>
            <button class="proj-carousel-btn proj-carousel-next" onclick="carouselMove('${cid}',1)">›</button>
            <div class="proj-carousel-dots">
              ${imgs.map((_,di)=>`<div class="proj-carousel-dot${di===0?' active':''}" id="${cid}-dot-${di}" onclick="carouselGo('${cid}',${di},${imgs.length})"></div>`).join('')}
            </div>
            <span class="project-badge ${badgeCls}" style="position:absolute;top:12px;left:12px;z-index:3">${pkgLabel[p.pkg]||p.pkg}</span>
          </div>`;
        })()}
        <div class="project-info">
          <h3>${p.name}</h3>
          <p style="font-size:0.85rem;color:var(--muted)">${p.desc}</p>
          <div class="project-meta">
            <div class="project-meta-item"><strong>${p.area?Number(p.area).toLocaleString('en-IN')+' sft':'—'}</strong>Built Area</div>
            <div class="project-meta-item"><strong>${p.year}</strong>Completed</div>
            <div class="project-meta-item"><strong>${p.value||'—'}</strong>Value</div>
          </div>
          <div class="project-tags"><span class="project-tag">${p.type}</span>${tagsHtml}</div>
        </div>
      </div>`;
    }).join('');
  }

  // ── ADMIN PANEL ───────────────────────────────────────
  let adminUnlocked = true;
  function openAdmin(){document.getElementById('adminOverlay').classList.add('open');if(adminUnlocked){showAdminPanel();}else{document.getElementById('adminLock').style.display='block';document.getElementById('adminPanel').style.display='none';document.getElementById('adminPin').value='';document.getElementById('pinError').style.display='none';}}
  function closeAdmin(){document.getElementById('adminOverlay').classList.remove('open');}
    function showAdminPanel(){document.getElementById('adminLock').style.display='none';document.getElementById('adminPanel').style.display='block';renderAdminList();currentPhotos=[];renderPhotoGrid();const nf=document.getElementById('nav-fc-finalize');if(nf)nf.style.display='block';}
  function renderAdminList(){
    const projects=getProjects();const el=document.getElementById('adminProjectsList');
    if(!projects.length){el.innerHTML='<div class="empty-state">No projects yet.</div>';return;}
    el.innerHTML=projects.map((p,i)=>{
      const badgeCls=p.pkg==='premium'?'badge-premium':p.pkg==='standard'?'badge-standard':'badge-basic';
      return`<div class="admin-proj-row"><div class="admin-proj-info"><strong>${p.name}</strong><span>${p.area?Number(p.area).toLocaleString('en-IN')+' sft · ':''} ${p.year}${p.value?' · '+p.value:''}</span></div><span class="admin-proj-badge ${badgeCls}" style="padding:4px 10px;border-radius:8px">${pkgLabel[p.pkg]}</span><button class="admin-edit-btn" onclick="editProject(${i})">Edit</button><button class="admin-del-btn" onclick="deleteProject(${i})">✕</button></div>`;
    }).join('');
  }
  function saveProject(){
    const idx=parseInt(document.getElementById('editingIndex').value);
    const name=document.getElementById('ap-name').value.trim();
    const desc=document.getElementById('ap-desc').value.trim();
    const area=parseInt(document.getElementById('ap-area').value)||0;
    const value=document.getElementById('ap-value').value.trim();
    const year=parseInt(document.getElementById('ap-year').value)||new Date().getFullYear();
    const type=document.getElementById('ap-type').value;
    const pkg=document.getElementById('ap-pkg').value;
    const tags=document.getElementById('ap-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
    let imgs=[];
    try{ const raw=document.getElementById('ap-img-data').value||'[]'; imgs=JSON.parse(raw); if(!Array.isArray(imgs)) imgs=imgs?[imgs]:[]; }catch(e){imgs=[];}
    if(!name){alert('Project name is required.');return;}
    const project={name,desc,area,value,year,type,pkg,tags,imgs};
    const projects=getProjects();
    if(idx>=0){projects[idx]=project;}else{projects.push(project);}
    saveProjects(projects);renderAdminList();renderProjectsPage();cancelEdit();
    ['ap-name','ap-desc','ap-area','ap-value','ap-year','ap-tags'].forEach(id=>document.getElementById(id).value='');
  }
  function editProject(i){
    const p=getProjects()[i];
    document.getElementById('editingIndex').value=i;
    document.getElementById('ap-name').value=p.name;
    document.getElementById('ap-desc').value=p.desc;
    document.getElementById('ap-area').value=p.area;
    document.getElementById('ap-value').value=p.value;
    document.getElementById('ap-year').value=p.year;
    document.getElementById('ap-type').value=p.type;
    document.getElementById('ap-pkg').value=p.pkg;
    document.getElementById('ap-tags').value=(p.tags||[]).join(', ');
    // Load photos array (support both old single img and new imgs array)
    if(p.imgs && p.imgs.length) { currentPhotos=[...p.imgs]; }
    else if(p.img) { currentPhotos=[p.img]; }
    else { currentPhotos=[]; }
    document.getElementById('ap-img-data').value=JSON.stringify(currentPhotos);
    renderPhotoGrid();
    document.getElementById('addFormTitle').textContent='Edit Project';
    document.getElementById('cancelEditBtn').style.display='block';
    document.querySelector('.admin-add-form').scrollIntoView({behavior:'smooth'});
  }
  function cancelEdit(){
    document.getElementById('editingIndex').value=-1;
    document.getElementById('addFormTitle').textContent='Add New Project';
    document.getElementById('cancelEditBtn').style.display='none';
    currentPhotos=[];
    document.getElementById('ap-img-data').value='[]';
    document.getElementById('ap-img-file').value='';
    renderPhotoGrid();
  }
  function deleteProject(i){if(!confirm('Delete this project?'))return;const projects=getProjects();projects.splice(i,1);saveProjects(projects);renderAdminList();renderProjectsPage();}
  function goToFinalize() {
    // Collect all data directly from the quote form
    const name   = document.getElementById('clientName').value.trim() || '—';
    const phone  = document.getElementById('clientPhone').value.trim() || '—';
    const loc    = document.getElementById('clientLocation').value.trim() || '—';
    const pkg    = document.getElementById('packageType').value;
    const floors = document.getElementById('numFloors').value;
    const type   = document.getElementById('projectType').value;
    const valid  = document.getElementById('validUntil').value;
    const notes  = document.getElementById('notes').value.trim();
    const dims   = getFloorDims();
    const area   = parseInt(document.getElementById('builtArea').value) || 0;

    // Collect add-ons
    const addonData = getAddonData();

    // Get logo
    const logoEl = document.querySelector('.nav-logo img');
    const logoSrc = logoEl ? logoEl.src : '';

    fqData = { name, phone, loc, pkg, floors, type, valid, notes, dims, area, addonData, logoSrc };

    showPage('finalize', document.getElementById('nav-finalize'));
    buildFQFloorRows();
    buildFQSpecRows();
    // Clear and add one empty extra row
    document.getElementById('fqExtraBody').innerHTML = '';
    extraRowCount = 0;
    addExtraRow();
    document.getElementById('fq-main').style.display = 'block';
    // Set active tier button
    const activeTierPkg = document.getElementById('packageType').value;
    ['basic','standard','premium'].forEach(p => {
      const btn = document.getElementById('fq-tier-'+p);
      if (btn) btn.className = 'fq-tier-btn' + (p === activeTierPkg ? ' active-'+p : '');
    });

    // Update upload zone to show loaded state
    document.getElementById('fqUploadZone').style.display = 'none';
    document.getElementById('fq-step-upload').innerHTML = `
      <div class="fq-section-title">✅ Quote Loaded</div>
      <div style="display:flex;align-items:center;gap:16px;margin-top:8px;padding:14px;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.2);border-radius:10px;">
        <div>
          <div style="font-weight:700;font-size:0.95rem">${name}</div>
          <div style="font-size:0.82rem;color:var(--muted);margin-top:3px">${pkgLabel[pkg]} Package · ${area.toLocaleString('en-IN')} sft · ${loc}</div>
          ${addonData.length ? '<div style="font-size:0.78rem;color:var(--gold);margin-top:3px">+ ' + addonData.map(a=>a.label+' ('+Number(a.litres).toLocaleString('en-IN')+'L)').join(', ') + '</div>' : ''}
        </div>
      </div>`;
  }

  function selectPackageAndQuote(pkg){document.getElementById('packageType').value=pkg;updatePreview();showPage('quote',document.querySelectorAll('.nav-btn')[1]);}

  // ── INIT ─────────────────────────────────────────────
  (function init(){
    const d=new Date();d.setDate(d.getDate()+30);
    const vi=document.getElementById('validUntil');
    if(vi) vi.value=d.toISOString().split('T')[0];
    buildFloorInputs();
    updatePreview();
    renderProjectsPage();
    // URL param handling moved to supabase-auth.js checkQuoteParam()
    const params=new URLSearchParams(window.location.search);
    if(!params.get('quote') && !params.get('specs') && !params.get('fcspecs')) {
      const navFin=document.getElementById('nav-finalize'); if(navFin) navFin.style.display='block';
    }
  })();

  // ── PHONE-GATED CLIENT QUOTE ACCESS ───────────────────
  function showPhoneGate(shortCode) {
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('client-view').style.display = 'none';
    document.querySelectorAll('.nav-btn').forEach(b => b.style.display='none');
    const cta = document.querySelector('.nav-cta'); if (cta) cta.style.display='none';
    const adminBtn = document.querySelector('.admin-trigger'); if (adminBtn) adminBtn.style.display='none';

    const gate = document.createElement('div');
    gate.id = 'phoneGateOverlay';
    gate.style.cssText = 'max-width:420px;margin:80px auto;padding:32px 28px;background:var(--dark2,#1a1a1a);border:1px solid rgba(201,168,76,0.3);border-radius:16px;text-align:center';
    gate.innerHTML = `
      <div style="font-size:2rem;margin-bottom:12px">🔒</div>
      <h2 style="font-family:'Playfair Display',serif;color:var(--gold);margin:0 0 8px;font-size:1.3rem">Verify Your Phone</h2>
      <p style="color:var(--muted);font-size:0.85rem;margin:0 0 20px">Enter the phone number this quote was sent to, to view it.</p>
      <input id="phoneGateInput" type="tel" placeholder="Your phone number" style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:var(--text);font-size:0.95rem;box-sizing:border-box;margin-bottom:14px" onkeydown="if(event.key==='Enter')verifyPhoneGate('${shortCode}')"/>
      <button onclick="verifyPhoneGate('${shortCode}')" style="width:100%;padding:13px;border-radius:10px;border:none;background:var(--gold);color:#000;font-weight:800;cursor:pointer;font-family:inherit">View Quote</button>
      <div id="phoneGateError" style="display:none;margin-top:12px;padding:10px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#fca5a5;font-size:0.82rem"></div>
    `;
    const page = document.getElementById('page-quote');
    page.insertBefore(gate, page.firstChild);
  }

  async function verifyPhoneGate(shortCode) {
    const phone = document.getElementById('phoneGateInput').value.trim();
    const errEl = document.getElementById('phoneGateError');
    if (!phone) { errEl.textContent='Please enter your phone number.'; errEl.style.display='block'; return; }

    try {
      const url = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
      const key = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';
      const res = await fetch(`${url}/rest/v1/rpc/get_quote_for_client`, {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_short_code: shortCode, p_phone: phone })
      });
      if (!res.ok) throw new Error('Lookup failed: ' + res.status);
      const result = await res.json();

      // RPC returns null if no match
      if (!result) {
        errEl.textContent = '❌ No matching quote found. Check the phone number and try again.';
        errEl.style.display = 'block';
        return;
      }

      // result is the full quote row as JSON (from to_jsonb(q.*))
      // quote_data is the nested field containing n, p, pkg, a, dims etc.
      const quoteData = result.quote_data || result;

      if (!quoteData || !quoteData.pkg) {
        errEl.textContent = '❌ Quote data is missing or corrupted. Please ask the contractor to resend the link.';
        errEl.style.display = 'block';
        return;
      }

      const gate = document.getElementById('phoneGateOverlay');
      if (gate) gate.remove();
      loadClientView(quoteData);

    } catch (err) {
      errEl.textContent = '❌ ' + err.message;
      errEl.style.display = 'block';
    }
  }

  // ══════════════════════════════════════════════════
  // FINALIZE QUOTE
  // ══════════════════════════════════════════════════
  let fqData = null; // parsed quote data
  let extraRowCount = 0;

  const specItems = [
    { key:'cement',        label:'Cement' },
    { key:'steel',         label:'TMT Steel' },
    { key:'sand',          label:'Sand' },
    { key:'bricks',        label:'Bricks' },
    { key:'windows',       label:'Windows' },
    { key:'door',          label:'Main Door' },
    { key:'innerDoor',     label:'Inner Doors' },
    { key:'exteriorDoor',  label:'Exterior Doors' },
    { key:'hardware',      label:'Hardwares' },
    { key:'handrails',     label:'Handrails' },
    { key:'mainGate',      label:'Main Gate' },
    { key:'tiles',         label:'Tiles' },
    { key:'staircase',     label:'Staircase Floor' },
    { key:'switches',      label:'Switches' },
    { key:'cables',        label:'Cables' },
    { key:'pipes',         label:'Pipes' },
    { key:'sanitary',      label:'Sanitary Fittings' },
    { key:'closets',       label:'Closets' },
    { key:'interiorPaint', label:'Interior Painting' },
    { key:'exteriorPaint', label:'Exterior Painting' },
    { key:'joineryPaint',  label:'Joinery Painting' },
    { key:'basement',      label:'Basement Height' }
  ];

  // ── FILE UPLOAD ───────────────────────────────────
  function handleFQDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) parseFQFile(file);
  }

  function loadFQFile(event) {
    const file = event.target.files[0];
    if (file) parseFQFile(file);
  }

  function parseFQFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const html = e.target.result;

      // ── Primary: read embedded JSON data ──
      const jsonMatch = html.match(/<!-- QUOTE_DATA:([\s\S]+?) -->/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1].trim());
          fqData = {
            name:      data.name      || '—',
            phone:     data.phone     || '—',
            loc:       data.loc       || '—',
            pkg:       data.pkg       || 'standard',
            area:      data.area      || 0,
            floors:    data.floors    || '1',
            type:      data.type      || 'Residential',
            valid:     data.valid     || '',
            notes:     data.notes     || '',
            dims:      data.dims      || [],
            addonData: data.addonData || [],
            logoSrc:   data.logoSrc   || ''
          };
          loadFQSuccess();
          return;
        } catch(err) {
          console.warn('JSON parse failed, falling back to HTML parsing', err);
        }
      }

      // ── Fallback: parse HTML manually ──
      const nameMatch = html.match(/Dear ([^,<]+),/);
      const pkgMatch  = html.match(/badge-(basic|standard|premium)/g);
      // Get the last match as it's more specific
      const pkgVal    = pkgMatch ? pkgMatch[pkgMatch.length-1].replace('badge-','') : 'standard';

      // Floor dimensions: "Ground Floor: 30×40 ft = 1,200 sft"
      const dimMatches = [...html.matchAll(/(Ground Floor|First Floor|Second Floor|Third Floor)[^<]{0,60}?([\d.]+)[×x]([\d.]+)\s*ft\s*=\s*([\d,]+)\s*sft/gi)];
      const dims = dimMatches.map(m => ({
        name: m[1].trim(),
        l: parseFloat(m[2]),
        b: parseFloat(m[3]),
        sft: parseInt(m[4].replace(/,/g,''))
      }));

      // Total area fallback
      const areaMatch = html.match(/([\d,]+)\s*sft/);
      const area = dims.length
        ? dims.reduce((s,d)=>s+d.sft, 0)
        : (areaMatch ? parseInt(areaMatch[1].replace(/,/g,'')) : 0);

      const finalDims = dims.length ? dims : (area ? [{ name:'Ground Floor', l:0, b:0, sft:area }] : []);

      // Addons: "Septic Tank (2,000 litres)"
      const addonData = [];
      const addonPatterns = [
        { key:'septic', label:'Septic Tank',        rate:25 },
        { key:'sump',   label:'UG Sump',            rate:30 },
        { key:'rcc',    label:'RCC Overhead Tank',  rate:32 }
      ];
      addonPatterns.forEach(ap => {
        const rx = new RegExp(ap.label + '[^\d]*(\d[\d,]*)\s*(?:litres|L)', 'i');
        const m  = html.match(rx);
        if (m) {
          const litres = parseInt(m[1].replace(/,/g,''));
          addonData.push({ key:ap.key, label:ap.label, litres, rate:ap.rate, cost: litres*ap.rate });
        }
      });

      const logoMatch = html.match(/<img src="(data:image[^"]+)" alt="Elite Homes"/);

      fqData = {
        name:      nameMatch ? nameMatch[1].trim() : 'Client',
        phone:     '—', loc: '—', type: 'Residential',
        pkg:       pkgVal,
        area,
        floors:    String(finalDims.length),
        valid:     '', notes: '',
        dims:      finalDims,
        addonData,
        logoSrc:   logoMatch ? logoMatch[1] : ''
      };
      loadFQSuccess();
    };
    reader.readAsText(file);
  }

  function switchFQTier(newPkg) {
    if (!fqData) return;
    fqData.pkg = newPkg;
    // Update tier button styles
    ['basic','standard','premium'].forEach(p => {
      const btn = document.getElementById('fq-tier-'+p);
      if (btn) {
        btn.className = 'fq-tier-btn' + (p === newPkg ? ' active-'+p : '');
      }
    });
    // Update floor rates to new tier rate
    const dims = fqData.dims || [];
    dims.forEach((d, i) => {
      const rateEl = document.getElementById('fq-fl-rate-'+i);
      if (rateEl) rateEl.value = rates[newPkg];
    });
    // Rebuild spec rows with new tier
    buildFQSpecRows();
    recalcFQ();
  }

  function loadFQSuccess() {
    const { name, pkg, area, addonData } = fqData;
    document.getElementById('fqUploadZone').innerHTML =
      `<div class="icon">✅</div>
       <strong>Quote loaded for: ${name}</strong>
       <p>Package: ${pkgLabel[pkg]} &nbsp;|&nbsp; Area: ${area.toLocaleString('en-IN')} sft
       ${addonData.length ? '<br/>' + addonData.map(a=>a.label+' ('+Number(a.litres).toLocaleString('en-IN')+'L)').join(', ') : ''}</p>`;
    buildFQFloorRows();
    buildFQSpecRows();
    document.getElementById('fqExtraBody').innerHTML = '';
    extraRowCount = 0;
    addExtraRow();
    document.getElementById('fq-main').style.display = 'block';
    document.getElementById('fq-main').scrollIntoView({ behavior:'smooth' });
    // Set active tier button
    const activePkg = fqData.pkg || 'standard';
    ['basic','standard','premium'].forEach(p => {
      const btn = document.getElementById('fq-tier-'+p);
      if (btn) btn.className = 'fq-tier-btn' + (p === activePkg ? ' active-'+p : '');
    });
  }

  // ── FLOOR ROWS ────────────────────────────────────
  function buildFQFloorRows() {
    if (!fqData) return;
    const pkg  = fqData.pkg;
    const dims = fqData.dims || [];
    const addonData = fqData.addonData || [];
    const container = document.getElementById('fqFloorRows');

    let html = dims.map((d, i) => `
      <div class="fq-floor-row">
        <div>
          <div class="fq-floor-label">${d.name}</div>
          <div class="fq-floor-sft">${d.sft > 0 ? Number(d.sft).toLocaleString('en-IN') + ' sft' : 'Area not specified'}</div>
        </div>
        <input class="fq-diff-input" type="number" id="fq-fl-sft-${i}"
          value="${d.sft}" placeholder="sft" oninput="recalcFQ()" style="text-align:center"/>
        <input class="fq-diff-input" type="number" id="fq-fl-rate-${i}"
          value="${rates[pkg]}" placeholder="₹/sft" oninput="recalcFQ()" style="text-align:center"/>
        <div class="fq-floor-total" id="fq-fl-total-${i}">₹0</div>
      </div>`).join('');

    // Add addon rows — editable litres and rate
    if (addonData.length) {
      html += `<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">
        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:10px">Septic / Sump / Tank Works</div>`;
      addonData.forEach((a, ai) => {
        html += `<div class="fq-floor-row">
          <div><div class="fq-floor-label">${a.label}</div><div class="fq-floor-sft">₹${a.rate}/litre</div></div>
          <input class="fq-diff-input" type="number" id="fq-addon-litres-${ai}"
            value="${a.litres}" placeholder="Litres" oninput="recalcFQ()" style="text-align:center"/>
          <input class="fq-diff-input" type="number" id="fq-addon-rate-${ai}"
            value="${a.rate}" placeholder="₹/L" oninput="recalcFQ()" style="text-align:center"/>
          <div class="fq-floor-total" id="fq-addon-total-${ai}">₹${Number(a.cost).toLocaleString('en-IN')}</div>
        </div>`;
      });
      html += `</div>`;
    }

    container.innerHTML = html;
    recalcFQ();
  }

  // ── SPEC ROWS ─────────────────────────────────────
  function buildFQSpecRows() {
    if (!fqData) return;
    const pkg = fqData.pkg;
    const container = document.getElementById('fqSpecRows');
    const pkgOrder = ['basic','standard','premium'];

    container.innerHTML = specItems.map((item, si) => {
      const opts = pkgOrder.map(p => {
        const val = pkgSpecs[p][item.key];
        const checked = p === pkg ? 'checked' : '';
        const tagCls  = p === 'basic' ? 'pill-basic' : p === 'standard' ? 'pill-standard' : 'pill-premium';
        const isDefault = p === pkg;
        return `<div class="fq-spec-opt ${isDefault?'selected':''}" onclick="selectSpec(${si},'${p}')">
          <input type="radio" name="spec-${si}" id="spec-${si}-${p}" value="${p}" ${checked}/>
          <label for="spec-${si}-${p}">${val}</label>
          <span class="package-pill ${tagCls} pkg-tag">${pkgLabel[p]}${isDefault?' ✦':''}</span>
        </div>`;
      }).join('');

      const otherOpt = `<div class="fq-spec-opt" onclick="selectSpec(${si},'other')">
          <input type="radio" name="spec-${si}" id="spec-${si}-other" value="other"/>
          <label for="spec-${si}-other" style="flex:1">Other</label>
          <span style="font-size:0.7rem;padding:2px 8px;border-radius:8px;background:rgba(255,255,255,0.06);color:var(--muted)">Custom</span>
        </div>
        <div id="spec-other-input-${si}" style="display:none;margin-top:6px">
          <input class="fq-diff-input" type="text" id="spec-other-val-${si}"
            placeholder="Enter brand / specification" style="width:100%"/>
        </div>`;

      return `<div class="fq-spec-row">
        <div class="fq-spec-label">${item.label}</div>
        <div class="fq-spec-options" id="spec-opts-${si}">${opts}${otherOpt}</div>
      </div>`;
    }).join('');
  }

  function selectSpec(si, selectedPkg) {
    document.querySelectorAll(`#spec-opts-${si} .fq-spec-opt`).forEach(el => el.classList.remove('selected'));
    const radio = document.getElementById(`spec-${si}-${selectedPkg}`);
    if (radio) { radio.checked = true; radio.closest('.fq-spec-opt').classList.add('selected'); }
    const otherInput = document.getElementById(`spec-other-input-${si}`);
    if (otherInput) otherInput.style.display = selectedPkg === 'other' ? 'block' : 'none';
    if (selectedPkg === 'other') { const inp = document.getElementById(`spec-other-val-${si}`); if (inp) inp.focus(); }
    recalcFQ();
  }

  // ── EXTRA ROWS ────────────────────────────────────
  function addExtraRow() {
    const tbody = document.getElementById('fqExtraBody');
    const idx = extraRowCount++;
    const sno = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.id = `extra-row-${idx}`;
    row.innerHTML = `
      <td style="text-align:center;color:var(--muted);font-size:0.82rem;padding-top:12px">${sno}</td>
      <td><input class="fq-extra-input" type="text" id="ex-desc-${idx}" placeholder="Description"/></td>
      <td><input class="fq-extra-input" type="number" id="ex-qty-${idx}" placeholder="Qty" oninput="calcExtraRow(${idx})" style="text-align:center"/></td>
      <td><input class="fq-extra-input" type="text" id="ex-unit-${idx}" placeholder="Nos/sft/rft"/></td>
      <td><input class="fq-extra-input" type="number" id="ex-price-${idx}" placeholder="₹" oninput="calcExtraRow(${idx})" style="text-align:right"/></td>
      <td class="fq-extra-total" id="ex-total-${idx}">₹0</td>
      <td><button class="fq-del-btn" onclick="delExtraRow('extra-row-${idx}')">✕</button></td>`;
    tbody.appendChild(row);
  }

  function calcExtraRow(idx) {
    const qty   = parseFloat(document.getElementById('ex-qty-'+idx)?.value) || 0;
    const price = parseFloat(document.getElementById('ex-price-'+idx)?.value) || 0;
    const total = qty * price;
    const el = document.getElementById('ex-total-'+idx);
    if (el) el.textContent = '₹' + total.toLocaleString('en-IN');
    recalcFQ();
  }

  function delExtraRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) row.remove();
    recalcFQ();
  }

  function getExtraRows() {
    const rows = [];
    document.querySelectorAll('#fqExtraBody tr').forEach(row => {
      const id = row.id.replace('extra-row-','');
      const desc  = document.getElementById('ex-desc-'+id)?.value.trim() || '';
      const qty   = parseFloat(document.getElementById('ex-qty-'+id)?.value) || 0;
      const unit  = document.getElementById('ex-unit-'+id)?.value.trim() || '';
      const price = parseFloat(document.getElementById('ex-price-'+id)?.value) || 0;
      const total = qty * price;
      const sno   = rows.length + 1;
      if (desc || qty || price) rows.push({ sno, desc, qty, unit, price, total });
    });
    return rows;
  }

  // ── RECALC ────────────────────────────────────────
  function recalcFQ() {
    if (!fqData) return;
    const dims = fqData.dims || [];
    const addonData = fqData.addonData || [];
    let constructionTotal = 0;

    dims.forEach((d, i) => {
      const sft  = parseFloat(document.getElementById('fq-fl-sft-'+i)?.value) || 0;
      const rate = parseFloat(document.getElementById('fq-fl-rate-'+i)?.value) || 0;
      const amt  = sft * rate;
      constructionTotal += amt;
      const el = document.getElementById('fq-fl-total-'+i);
      if (el) el.textContent = '₹' + amt.toLocaleString('en-IN');
    });

    // Recalc editable addon rows
    let addonTotal = 0;
    addonData.forEach((a, ai) => {
      const litres = parseFloat(document.getElementById('fq-addon-litres-'+ai)?.value) || 0;
      const rate   = parseFloat(document.getElementById('fq-addon-rate-'+ai)?.value) || 0;
      const amt    = litres * rate;
      addonTotal  += amt;
      const el = document.getElementById('fq-addon-total-'+ai);
      if (el) el.textContent = '₹' + amt.toLocaleString('en-IN');
    });
    if (!addonData.length) addonTotal = 0;
    const specAdj = 0; // Spec changes recorded only — cost updated manually

    let extraTotal = 0;
    document.querySelectorAll('#fqExtraBody tr').forEach(row => {
      const id = row.id.replace('extra-row-','');
      const qty   = parseFloat(document.getElementById('ex-qty-'+id)?.value) || 0;
      const price = parseFloat(document.getElementById('ex-price-'+id)?.value) || 0;
      extraTotal += qty * price;
    });

    const grandTotal = constructionTotal + addonTotal + extraTotal;

    document.getElementById('fqConstructionTotal').textContent = '₹' + constructionTotal.toLocaleString('en-IN');
    document.getElementById('fqSpecAdjTotal').textContent      = 'Recorded only';
    document.getElementById('fqExtraTotal').textContent        = '₹' + extraTotal.toLocaleString('en-IN');

    document.getElementById('fqGrandRows').innerHTML = `
      <div class="fq-grand-row"><span class="fq-grand-label">Construction Cost</span><span class="fq-grand-val">₹${constructionTotal.toLocaleString('en-IN')}</span></div>
      ${addonTotal > 0 ? `<div class="fq-grand-row"><span class="fq-grand-label">Septic/Sump/Tank Works</span><span class="fq-grand-val">₹${addonTotal.toLocaleString('en-IN')}</span></div>` : ''}
      ${extraTotal > 0 ? `<div class="fq-grand-row"><span class="fq-grand-label">Additional Works</span><span class="fq-grand-val">₹${extraTotal.toLocaleString('en-IN')}</span></div>` : ''}
    `;
    document.getElementById('fqGrandTotal').textContent = '₹' + grandTotal.toLocaleString('en-IN');
  }

  // ── GENERATE FINAL QUOTE ──────────────────────────
  function generateFinalQuote() {
    if (!fqData) return;
    const cfg       = getConfig();
    const pkg       = fqData.pkg;
    const name      = fqData.name || '—';
    const phone     = fqData.phone || '—';
    const loc       = fqData.loc || '—';
    const type      = fqData.type || '—';
    const valid     = fqData.valid;
    const notes     = fqData.notes || '';
    const floors    = fqData.floors || '1';
    const addonData = fqData.addonData || [];
    const today     = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const validDate = valid ? new Date(valid).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : '30 days from issue';
    const dims      = fqData.dims || [];
    const extraRows = getExtraRows();

    let constructionTotal = 0;
    const floorLines = dims.map((d, i) => {
      const sft  = parseFloat(document.getElementById('fq-fl-sft-'+i)?.value) || 0;
      const rate = parseFloat(document.getElementById('fq-fl-rate-'+i)?.value) || 0;
      const amt  = sft * rate;
      constructionTotal += amt;
      return { name: d.name, sft, rate, amt };
    });

    // Confirmed specs
    const confirmedSpecs = specItems.map((item, si) => {
      const selected = document.querySelector(`input[name="spec-${si}"]:checked`)?.value || pkg;
      let specValue;
      if (selected === 'other') {
        specValue = document.getElementById(`spec-other-val-${si}`)?.value?.trim() || 'Special Category';
      } else {
        specValue = pkgSpecs[selected]?.[item.key] || pkgSpecs[pkg][item.key];
      }
      return { label: item.label, value: specValue, pkg: selected === 'other' ? 'other' : selected, diff: 0 };
    });
    const specAdj = 0;
    let addonTotal2 = 0;
    addonData.forEach((a, ai) => {
      const litres = parseFloat(document.getElementById('fq-addon-litres-'+ai)?.value) || 0;
      const arate  = parseFloat(document.getElementById('fq-addon-rate-'+ai)?.value) || 0;
      addonTotal2 += litres * arate;
    });
    const extraTotal = extraRows.reduce((s, r) => s + r.total, 0);
    const grandTotal = constructionTotal + addonTotal2 + extraTotal;

    const logoSrc = fqData.logoSrc || (document.querySelector('.nav-logo img')?.src || '');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Final Quote — ${name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#f5f5f5;color:#222}
  .page{max-width:800px;margin:0 auto;padding:32px 20px}
  .header{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:3px solid #C9A84C;margin-bottom:28px}
  .logo{display:flex;align-items:center;gap:10px}
  .logo img{height:48px;width:48px;object-fit:contain;border-radius:8px}
  .logo-text{font-family:Georgia,serif;font-size:1.4rem;font-weight:900;color:#8B5E2A}
  .logo-sub{font-size:0.75rem;color:#999;margin-top:2px}
  .header-right{text-align:right;font-size:0.82rem;color:#666}
  .banner{background:linear-gradient(135deg,#fffbef,#fff8e0);border:1px solid #C9A84C;border-radius:12px;padding:20px 24px;margin-bottom:22px;display:flex;align-items:center;gap:14px}
  .banner h2{font-family:Georgia,serif;font-size:1.3rem;color:#5a3e10}
  .total-box{background:linear-gradient(135deg,#fffbef,#fff5d0);border:2px solid #C9A84C;border-radius:14px;padding:26px;text-align:center;margin-bottom:22px}
  .total-label{font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#999}
  .total-amount{font-family:Georgia,serif;font-size:2.8rem;font-weight:900;color:#8B5E2A;margin:8px 0 4px}
  .total-break{font-size:0.82rem;color:#999}
  .card{background:#fff;border:1px solid #e8e0d0;border-radius:12px;padding:22px;margin-bottom:18px}
  .card h3{font-size:0.7rem;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f0e8d8}
  table{width:100%;border-collapse:collapse}
  th{background:#faf5ec;padding:9px 12px;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;color:#888;font-weight:700;border-bottom:2px solid #e8dfc8;text-align:left}
  td{padding:9px 12px;border-bottom:1px solid #f5f0e8;font-size:0.86rem}
  tr:last-child td{border-bottom:none}
  .text-right{text-align:right}
  .grand-row td{font-size:1rem;font-weight:900;color:#8B5E2A;border-top:2px solid #C9A84C;padding-top:12px}
  .pkg-tag{display:inline-block;padding:2px 8px;border-radius:8px;font-size:0.7rem;font-weight:700;text-transform:uppercase;margin-left:6px}
  .tag-basic{background:#e8f5f0;color:#3a7a62}.tag-standard{background:#fff8e0;color:#8B5E2A}.tag-premium{background:#fff0e8;color:#8B3a1A}
  .footer{margin-top:32px;padding-top:18px;border-top:2px solid #C9A84C;display:flex;justify-content:space-between;align-items:center}
  .footer-name{font-family:Georgia,serif;font-size:0.95rem;font-weight:700;color:#8B5E2A}
  .footer-contact{font-size:0.78rem;color:#888;text-align:right}
  .footer-contact strong{display:block;color:#333}
  .wa-btn{display:inline-block;margin-top:6px;padding:7px 16px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-size:0.8rem;font-weight:700}
  .billing-note{background:#fff8e0;border:1px solid #C9A84C;border-radius:8px;padding:14px 18px;font-size:0.95rem;font-weight:800;color:#8B5E2A;margin-bottom:18px;text-align:center}
  .spec-section{margin-bottom:16px}
  .spec-section h4{font-size:0.82rem;font-weight:700;color:#8B5E2A;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #f0e8d8}
  .spec-section li{font-size:0.8rem;color:#555;line-height:1.75;margin-bottom:3px}
  .spec-section ul{padding-left:16px}
  @media print{body{background:#fff}.wa-btn{display:none}.page{padding:16px}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      ${logoSrc ? `<img src="${logoSrc}" alt="Elite Homes"/>` : ''}
      <div><div class="logo-text">Elite Homes</div><div class="logo-sub">Property Promotors · Tiruvannamalai</div></div>
    </div>
    <div class="header-right"><strong>${today}</strong><br/>Final Quotation</div>
  </div>

  <div class="banner">
    <div style="font-size:2rem">🏗️</div>
    <div><h2>Dear ${name},</h2><p>Please find below your finalized construction quotation from Elite Homes.</p></div>
  </div>

  <div class="card">
    <h3>Project Cost Summary</h3>
    <table>
      <tr><th>Description</th><th style="text-align:right">Area / Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr>
      ${floorLines.map(f=>`<tr>
        <td><strong>${f.name}</strong></td>
        <td style="text-align:right">${f.sft.toLocaleString('en-IN')} sft</td>
        <td style="text-align:right">₹${f.rate.toLocaleString('en-IN')}/sft</td>
        <td style="text-align:right"><strong>₹${f.amt.toLocaleString('en-IN')}</strong></td>
      </tr>`).join('')}
      ${addonData.map(a=>`<tr>
        <td>${a.label}</td>
        <td style="text-align:right">${Number(a.litres).toLocaleString('en-IN')} litres</td>
        <td style="text-align:right">₹${a.rate}/litre</td>
        <td style="text-align:right"><strong>₹${Number(a.cost).toLocaleString('en-IN')}</strong></td>
      </tr>`).join('')}
      ${extraRows.length ? extraRows.map(r=>`<tr>
        <td>${r.desc}</td>
        <td style="text-align:right">${r.qty} ${r.unit}</td>
        <td style="text-align:right">₹${r.price.toLocaleString('en-IN')}</td>
        <td style="text-align:right"><strong>₹${r.total.toLocaleString('en-IN')}</strong></td>
      </tr>`).join('') : ''}
      <tr style="background:#faf5ec;border-top:2px solid #C9A84C">
        <td colspan="3"><strong>Total Project Cost</strong></td>
        <td style="text-align:right;font-size:1.1rem;font-weight:900;color:#8B5E2A">₹${grandTotal.toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>

  <div class="card">
    <h3>Cost Breakdown — Floor wise</h3>
    <table>
      <tr><th>Floor</th><th class="text-right">Area (sft)</th><th class="text-right">Rate (₹/sft)</th><th class="text-right">Amount</th></tr>
      ${floorLines.map(f=>`<tr><td>${f.name}</td><td class="text-right">${f.sft.toLocaleString('en-IN')}</td><td class="text-right">₹${f.rate.toLocaleString('en-IN')}</td><td class="text-right"><strong>₹${f.amt.toLocaleString('en-IN')}</strong></td></tr>`).join('')}
      <tr style="background:#faf5ec"><td colspan="3"><strong>Total Construction Cost</strong></td><td class="text-right"><strong>₹${constructionTotal.toLocaleString('en-IN')}</strong></td></tr>
    </table>
  </div>

  <div class="card">
    <h3>Confirmed Specifications — ${pkgLabel[pkg]} Package</h3>
    <table>
      <tr><th>Item</th><th>Specification</th><th>Package</th></tr>
      ${confirmedSpecs.map(s=>`<tr>
        <td>${s.label}</td>
        <td><strong>${s.value}</strong></td>
        <td><span class="pkg-tag tag-${s.pkg}">${pkgLabel[s.pkg]}${s.pkg===fqData?.pkg?' ✦':''}</span></td>
      </tr>`).join('')}
    </table>
  </div>

  ${addonData.length ? `<div class="card">
    <h3>Additional Works — Septic / Sump / Tank</h3>
    <table>
      <tr><th>Item</th><th class="text-right">Capacity</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>
      ${addonData.map(a=>`<tr><td>${a.label}</td><td class="text-right">${Number(a.litres).toLocaleString('en-IN')} litres</td><td class="text-right">₹${a.rate}/litre</td><td class="text-right"><strong>₹${Number(a.cost).toLocaleString('en-IN')}</strong></td></tr>`).join('')}
      <tr style="background:#faf5ec"><td colspan="3"><strong>Total</strong></td><td class="text-right"><strong>₹${addonTotal2.toLocaleString('en-IN')}</strong></td></tr>
    </table>
  </div>` : ''}



  <di

  <div class="card">
    <h3>Confirmed Specifications</h3>
    <table>
      <tr><th>Item</th><th>Specification</th><th>Package</th></tr>
      ${confirmedSpecs.map(s=>`<tr><td>${s.label}</td><td><strong>${s.value}</strong></td><td><span style="font-size:0.75rem;padding:2px 8px;border-radius:6px;font-weight:700" class="pkg-tag tag-${s.pkg}">${pkgLabel[s.pkg]}${s.pkg===fqData?.pkg?' ✦':''}</span></td></tr>`).join('')}
    </table>
  </div>

  <div class="card">
    <h3>Package Inclusions</h3>
    <div class="addon-grid">
      ${Object.entries(addons[pkg]).map(([k,v])=>`<div class="addon-item"><span>${v?'✅':'❌'}</span><span style="${v?'':'color:#bbb'}">${k}</span></div>`).join('')}
    </div>
  </div>

  <div class="card">
    <h3>General Specifications</h3>
    ${specsTextToHtml(getSpecsText('specs'))}
  </div>

  <div class="card">
    <h3>Terms & Conditions</h3>
    ${specsTextToHtml(getSpecsText('terms'))}
  </div>

  <div class="billing-note">📋 Bills will be prepared as per actual executed work after completion</div>

  <div class="footer">
    <div>
      <div class="footer-name">Elite Homes</div>
      <div style="font-size:0.72rem;color:#999">${cfg.tagline} · ${cfg.city}</div>
    </div>
    <div class="footer-contact">
      <strong>${cfg.phone}</strong>
      ${cfg.email}
      <a class="wa-btn" href="https://wa.me/${cfg.waNumber}">💬 WhatsApp Us</a>
    </div>
  </div>
  <div style="text-align:center;font-size:0.7rem;color:#bbb;margin-top:20px;padding-top:14px;border-top:1px solid #eee">
    This is a finalized quotation prepared exclusively for ${name} by ${cfg.company} — ${cfg.tagline}, ${cfg.city}.
  </div>
</div>
</body>
</html>`;

    // Download
    const blob = new Blob([html],{type:'text/html'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'FinalQuote_' + name.replace(/\s+/g,'_') + '.html';
    a.click();
    URL.revokeObjectURL(url);

    // Show confirmation
    document.querySelector('.fq-finalize-btn').textContent = '✅ Final Quote Downloaded!';
    setTimeout(() => document.querySelector('.fq-finalize-btn').textContent = '🖨️ Generate & Download Final Quote', 3000);
  }
  // ══════════════════════════════════════════════════

  // ══════════════════════════════════════════════════
  // SETTINGS & COMPANY CONFIG
  // ══════════════════════════════════════════════════
  const DEFAULT_CONFIG = {
    company:'Elite Homes', tagline:'Property Promotors',
    phone:'+91 88848 38995', waNumber:'918884838995',
    email:'eliteconstructionstvm@gmail.com',
    city:'Tiruvannamalai, Tamil Nadu', logo:'', pin:'1234'
  };

  function getConfig() {
    // Phase 3: read from Supabase session config if available,
    // fall back to localStorage for backward compat / first load
    if (window.SB_CONFIG) return Object.assign({}, DEFAULT_CONFIG, window.SB_CONFIG);
    try { const s=localStorage.getItem('eh_config'); return s?Object.assign({},DEFAULT_CONFIG,JSON.parse(s)):Object.assign({},DEFAULT_CONFIG); }
    catch(e){ return Object.assign({},DEFAULT_CONFIG); }
  }
  function saveConfig(cfg){
    // Phase 3: write to Supabase if session exists, else localStorage
    if (window.SB_SESSION && typeof saveConfigToDB === 'function') {
      saveConfigToDB(cfg).catch(e => console.warn('[SB] saveConfig failed:', e));
    } else {
      localStorage.setItem('eh_config', JSON.stringify(cfg));
    }
    // Always keep SB_CONFIG in sync
    if (window.SB_CONFIG) window.SB_CONFIG = Object.assign(window.SB_CONFIG, cfg);
  }

  function applyConfig() {
    const cfg=getConfig();
    const navLogo=document.querySelector('.nav-logo');
    if(navLogo){
      const parts=cfg.company.split(' '); const first=parts[0]; const rest=parts.slice(1).join(' ');
      navLogo.innerHTML=(cfg.logo?`<img src="${cfg.logo}" style="height:38px;width:38px;object-fit:contain;border-radius:6px"/>`:'')
        +`<span style="color:var(--gold)">${first} <span style="color:var(--text)">${rest}</span></span>`;
    }
    document.querySelectorAll('.footer-contact').forEach(el=>{
      el.innerHTML=`<strong>${cfg.phone}</strong> &nbsp;|&nbsp; ${cfg.email}`;
    });
    document.querySelectorAll('.footer-logo span, .footer-company-name').forEach(el=>{ el.textContent=cfg.company; });

    document.title=cfg.company+' — '+cfg.tagline;
    document.querySelectorAll('a[href*="wa.me"]').forEach(a=>{ a.href=`https://wa.me/${cfg.waNumber}`; });
  }

  function checkFirstLaunch() {
    // Phase 3: wizard is triggered by setup_completed flag from Supabase,
    // not by absence of localStorage key.
    // supabase-auth.js calls checkSetupStatus() after login which handles this.
    // This function is kept as a no-op for compatibility.
  }

  function handleSetupLogo(event) {
    const file=event.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=function(e){
      const prev=document.getElementById('setupLogoPreview'); const ph=document.getElementById('setupLogoPlaceholder');
      if(prev){prev.src=e.target.result;prev.style.display='block';} if(ph) ph.style.display='none';
    }; reader.readAsDataURL(file);
  }

  function saveSetup() {
    const get=id=>(document.getElementById(id)||{}).value||'';
    const company=get('setup-company').trim(); if(!company){alert('Please enter your company name.');return;}
    const prev=document.getElementById('setupLogoPreview');
    const logo=(prev&&prev.src&&prev.src.startsWith('data:'))?prev.src:'';
    const phone=get('setup-phone').trim();
    const cfg=Object.assign({},DEFAULT_CONFIG,{
      company, tagline:get('setup-tagline').trim()||DEFAULT_CONFIG.tagline,
      phone:phone||DEFAULT_CONFIG.phone, email:get('setup-email').trim()||DEFAULT_CONFIG.email,
      city:get('setup-city').trim()||DEFAULT_CONFIG.city,
      logo, waNumber:phone.replace(/\D/g,'')||DEFAULT_CONFIG.waNumber
    });
    saveConfig(cfg); applyConfig();
    const wiz=document.getElementById('setupWizard'); if(wiz) wiz.style.display='none';
  }

  function skipSetup() {
    saveConfig(DEFAULT_CONFIG);
    const wiz=document.getElementById('setupWizard'); if(wiz) wiz.style.display='none';
  }

  function switchAdminTab(tab,btn) {
    document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    const el=document.getElementById('admintab-'+tab); if(el) el.classList.add('active');
    if(tab==='settings') loadSettingsForm();
  }

  function loadSettingsForm() {
    const cfg=getConfig();
    [['cfg-company',cfg.company],['cfg-tagline',cfg.tagline],['cfg-phone',cfg.phone],
     ['cfg-email',cfg.email],['cfg-city',cfg.city]].forEach(([id,val])=>{
      const el=document.getElementById(id); if(el) el.value=val;
    });
    const img=document.getElementById('settingsLogoImg'); const ph=document.getElementById('settingsLogoPlaceholder');
    if(img&&ph){ if(cfg.logo){img.src=cfg.logo;img.style.display='block';ph.style.display='none';}
      else{img.style.display='none';ph.style.display='block';} }
    // Load specs textarea (active tab = specs by default)
    const ta=document.getElementById('specsed-textarea-specs');
    if(ta) ta.value=getSpecsText('specs');
    const tt=document.getElementById('specsed-textarea-terms');
    if(tt) tt.value=getSpecsText('terms');
  }

  function handleSettingsLogo(event) {
    const file=event.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=function(e){
      const img=document.getElementById('settingsLogoImg'); const ph=document.getElementById('settingsLogoPlaceholder');
      if(img){img.src=e.target.result;img.style.display='block';} if(ph) ph.style.display='none';
    }; reader.readAsDataURL(file);
  }

  function saveSettings() {
    const cfg=getConfig(); const get=id=>(document.getElementById(id)||{}).value||'';
    const phone=get('cfg-phone').trim(); const waNumber=phone.replace(/\D/g,'')||cfg.waNumber;
    const logoImg=document.getElementById('settingsLogoImg');
    const logo=(logoImg&&logoImg.src&&logoImg.src.startsWith('data:'))?logoImg.src:cfg.logo;
    const updated=Object.assign({},cfg,{
      company:get('cfg-company').trim()||cfg.company, tagline:get('cfg-tagline').trim()||cfg.tagline,
      phone, email:get('cfg-email').trim(), city:get('cfg-city').trim(), logo, waNumber
    });
    saveConfig(updated); applyConfig();
    const msg=document.getElementById('settingsSavedMsg');
    if(msg){msg.style.display='block';setTimeout(()=>msg.style.display='none',3000);}
  }

  function checkPin() {
    // Phase 3: PIN auth replaced by Supabase Auth.
    // User is already authenticated at this point — just open the panel.
    adminUnlocked = true;
    showAdminPanel();
  }

  // Apply config on load (supabase-auth.js will call it again after login with real data)
  applyConfig();
  checkFirstLaunch();
  // Note: nav and page visibility is controlled by supabase-auth.js
  // The landing page overlay covers the app until login is confirmed


  // ══════════════════════════════════════════════════
  // SPECS & TERMS EDITOR
  // ══════════════════════════════════════════════════

  const DEFAULT_SPECS_TEXT = `FOUNDATION & STRUCTURE
- Foundation: 5 ft below GL with column footing, RCC 1:2:4
- Basement: 3 ft above RL, columns in RCC 1:1.5:3, brickwork in CM 1:6
- Super structure: 9" thick brick wall in CM 1:6, 10 ft height
- RCC framed structure — Columns: RCC 1:1.5:3 | Other: RCC 1:2:4
- Roof slab: RCC 4.5" thick, mix 1:2:4 | Centring: Steel sheet

JOINERIES
- Main door: Sudan Teak frame & shutter
- Exterior doors: Vengai wood frame & shutters
- Toilet doors: WPC door with WPC frame
- Other doors: Vengai wood frame with ISI make flush doors

FLOORING
- Floor: Vitrified tiles over CC 1:5:10 bed — rate as per package specification
- Portico: Vitrified tiles — rate as per package specification
- Staircase: Tiles — rate as per package specification

FINISHING & PAINTING
- Ceiling plaster: CM 1:3, 0.5" thick
- Wall plaster: CM 1:5, 0.5" thick
- Interior: Basic plastic emulsion (as per selected brand) — 2 coats over 2 coats wall putty
- Exterior: Exterior emulsion — 2 coats over 1 coat primer
- Main door: Varnishing | Other joineries: Enamel — 2 coats over primer

TILING
- Kitchen: 2 ft dado with ceramic tiles — Rs.30/sft
- Toilet walls: Glazed tiles to 7 ft height — Rs.40/sft
- Toilet floor: Ceramic tiles — Rs.30/sft

ELECTRICAL & PLUMBING
- Main switch: Three phase provision — one each per floor
- AC provision: For all bedrooms
- TV socket: Hall and Master bedroom
- Cables: As per package specification (Basic: Kundan/V-Guard | Standard: Finolex | Premium: Hawells)
- Switches: As per package specification (Basic: GM | Standard: Anchor Roma | Premium: Legrand) — modular switches with metal box
- Plumbing: ISI make CPVC pipe lines from OHT to outlet tap with ISI make SS fittings
- Water pipes: Ashirvad CPVC pipes | Sanitary pipes: Finolex

OTHER WORKS
- Waterproofing: As per specifications — applied to OHT and all sunken portions
- Weathering course: Screed concrete 1:3:6 with waterproofing compound, topped with cool tiles
- Kitchen: Granite table top with stainless steel sink
- Water closet: Parryware or equivalent — EWC, basic model
- Sanitary fittings: Jaquar or equivalent — basic model`;

  const DEFAULT_TERMS_TEXT = `1. PAYMENT SCHEDULE
- Advance: 15%
- Basement Level: 10%
- Ground Floor Roof Level: 15%
- First Floor Roof Level: 20%
- Second Floor Roof Level: 20%
- After Flooring: 15%
- Balance after completion
- Extra work payments: To be made as and when completed

2. SCOPE INCLUSIONS (NO EXTRA CHARGE)
- Anti termite treatment, Sunshade, Loft (one per room), Staircase (if inside building), Cupboard (one per room)

3. EXTRA CHARGES
- Safety gate, Modular kitchen, Compound wall, Culvert, Municipal drainage, Platform, Front elevation (if super skilled), Structural glazing
- Septic tank: Rs.25/litre | UG Sump: Rs.30/litre | Overhead tank: Rs.32/litre
- EB connection, Bath fittings, Electrical fittings, Municipal water tap — Owner's scope

4. PROJECT TIMELINE
- Commencement: Within 10 days of work order
- Completion: Within 240 days from work order date
- Deadline extended in case of natural calamities
- Liquidated damages: Rs.300/day on either side

5. MATERIALS & RATES
- Rates firm until completion. Escalation beyond 5% on steel, cement and timber permitted accordingly
- Electric power and water supply: Owner's responsibility at free of cost
- GST: To be borne by the owner if applicable
- Workman insurance/compensation: Contractor's responsibility

6. GENERAL
- Bills will be prepared as per actual executed work after completion
- Additions/alterations to agreed plan will be chargeable
- Building handed over after final settlement of payment
- Jurisdiction: Courts of Tiruvannamalai, Tamil Nadu`;

    function getSpecsText(type) {
    // Phase 3: read from localStorage (populated from Supabase at login via supabase-auth.js)
    // Falls back to DEFAULT text if nothing loaded yet
    return localStorage.getItem('eh_' + type + '_text') || (type === 'specs' ? DEFAULT_SPECS_TEXT : DEFAULT_TERMS_TEXT);
  }


    function saveSpecsText(type) {
    const ta = document.getElementById('specsed-textarea-' + type);
    if (!ta) return;
    const content = ta.value;
    // Always keep localStorage in sync for reads during this session
    localStorage.setItem('eh_' + type + '_text', content);
    // Phase 3: also save to Supabase if session exists
    if (window.SB_SESSION && window.SB_COMPANY_ID) {
      const url = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
      const key = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';
      fetch(`${url}/rest/v1/specs_text?on_conflict=company_id,doc_type`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + window.SB_SESSION.access_token,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          company_id: window.SB_COMPANY_ID,
          doc_type: type,
          content: content
        })
      }).catch(e => console.warn('[SB] saveSpecsText failed:', e));
    }
    const msg = document.getElementById(type + '-saved-msg');
    if (msg) { msg.style.display = 'inline'; setTimeout(() => msg.style.display = 'none', 2000); }
  }

  function resetSpecs(type) {
    if (!confirm('Reset to default? Your edits will be lost.')) return;
    localStorage.removeItem('eh_' + type + '_text');
    const ta = document.getElementById('specsed-textarea-' + type);
    if (ta) ta.value = type === 'specs' ? DEFAULT_SPECS_TEXT : DEFAULT_TERMS_TEXT;
  }
  function downloadSpecsText(type) {
    const text = getSpecsText(type);
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = (type === 'specs' ? 'General_Specifications' : 'Terms_Conditions') + '.txt';
    a.click(); URL.revokeObjectURL(url);
  }
  function uploadSpecsText(event, type) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const ta = document.getElementById('specsed-textarea-' + type);
      if (ta) ta.value = e.target.result;
            localStorage.setItem('eh_' + type + '_text', e.target.result);
      // Phase 3: sync uploaded text to Supabase too
      if (window.SB_SESSION && window.SB_COMPANY_ID) {
        const url = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
        const key = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';
        fetch(`${url}/rest/v1/specs_text?on_conflict=company_id,doc_type`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + window.SB_SESSION.access_token,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify({ company_id: window.SB_COMPANY_ID, doc_type: type, content: e.target.result })
        }).catch(err => console.warn('[SB] uploadSpecsText sync failed:', err));
      } 
      const msg = document.getElementById(type + '-saved-msg');
      if (msg) { msg.style.display = 'inline'; setTimeout(() => msg.style.display = 'none', 2500); }
    };
    reader.readAsText(file);
  }
  function switchSpecsTab(tab, btn) {
    document.querySelectorAll('.specs-editor-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.specs-editor-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const el = document.getElementById('specsed-' + tab); if (el) el.classList.add('active');
    // Load textarea content
    const ta = document.getElementById('specsed-textarea-' + tab);
    if (ta) ta.value = getSpecsText(tab);
  }

  // Convert plain text specs to HTML sections for quotes
  function specsTextToHtml(text) {
    if (!text) return '';
    let html = '';
    const lines = text.split('\n');
    let inSection = false;
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      if (!line.startsWith('-') && !line.startsWith('•')) {
        if (inSection) html += '</ul></div>';
        html += `<div class="spec-section"><h4>${line}</h4><ul>`;
        inSection = true;
      } else {
        const content = line.replace(/^[-•]\s*/, '');
        html += `<li>${content}</li>`;
      }
    });
    if (inSection) html += '</ul></div>';
    return html;
  }

  // ── SHAREABLE SPECS LINK (General Specs & Terms) ─────────────────
  function copySpecsShareLink(type) {
    const link = window.location.href.split('?')[0] + '?specs=1';
    navigator.clipboard.writeText(link).then(() => {
      const msg = document.getElementById(type + '-share-msg');
      if (msg) { msg.style.display = 'inline'; setTimeout(() => msg.style.display = 'none', 2500); }
    }).catch(() => {
      prompt('Copy this link:', link);
    });
  }

  function renderSpecsSharePage() {
    const cfg = getConfig();
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const navEl = document.querySelector('nav');
    if (navEl) navEl.style.display = 'none';
    const adminBtn = document.querySelector('.admin-trigger');
    if (adminBtn) adminBtn.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.id = 'specsShareView';
    wrap.style.cssText = 'max-width:800px;margin:0 auto;padding:40px 20px;';
    wrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid var(--gold);padding-bottom:20px;margin-bottom:28px">
        ${cfg.logo ? `<img src="${cfg.logo}" style="height:50px;width:50px;object-fit:contain;border-radius:8px"/>` : ''}
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;color:var(--gold)">${cfg.company}</div>
          <div style="font-size:0.85rem;color:var(--muted)">${cfg.tagline} · ${cfg.city}</div>
        </div>
      </div>
      <h1 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:24px">General Specifications &amp; Terms</h1>
      <div class="card" style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:20px">
        <h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)">General Specifications</h3>
        ${specsTextToHtml(getSpecsText('specs'))}
      </div>
      <div class="card" style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:20px">
        <h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)">Terms &amp; Conditions</h3>
        ${specsTextToHtml(getSpecsText('terms'))}
      </div>
      <div style="text-align:center;padding:20px 0;font-size:0.82rem;color:var(--muted)">
        <strong style="color:var(--text)">${cfg.company}</strong> &nbsp;|&nbsp; ${cfg.phone} &nbsp;|&nbsp; ${cfg.email}
      </div>`;
    document.body.appendChild(wrap);
  }

  // ── SHAREABLE FALSE CEILING SPECS LINK ───────────────────────────
  function copyFcSpecsShareLink() {
    const link = window.location.href.split('?')[0] + '?fcspecs=1';
    navigator.clipboard.writeText(link).then(() => {
      const msg = document.getElementById('fc-share-msg');
      if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 3000); }
    }).catch(() => {
      prompt('Copy this link:', link);
    });
  }

  function renderFcSpecsSharePage() {
    const cfg = getConfig();
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const navEl = document.querySelector('nav');
    if (navEl) navEl.style.display = 'none';
    const adminBtn = document.querySelector('.admin-trigger');
    if (adminBtn) adminBtn.style.display = 'none';

    const tierRows = Object.entries(FC_TIERS).map(([key, t]) => `
      <div class="fc-room-card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div class="fc-room-title">${t.label}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--gold)">₹${t.rate}/sft</div>
        </div>
        <div style="font-size:0.85rem;color:var(--muted)">Channel: <strong style="color:var(--text)">${t.channel}</strong></div>
        <div style="font-size:0.85rem;color:var(--muted)">Covering Board: <strong style="color:var(--text)">${t.board}</strong></div>
      </div>`).join('');

    const addonRows = Object.entries(FC_ADDONS).map(([key, a]) => `
      <div class="fc-room-card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div class="fc-room-title">${a.label}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--gold)">${a.rate ? '₹'+a.rate+'/'+a.unit : a.note}</div>
        </div>
        ${a.channel ? `<div style="font-size:0.85rem;color:var(--muted)">Channel: <strong style="color:var(--text)">${a.channel}</strong></div>` : ''}
        ${a.board ? `<div style="font-size:0.85rem;color:var(--muted)">Covering: <strong style="color:var(--text)">${a.board}</strong></div>` : ''}
      </div>`).join('');

    const globalRows = Object.entries(FC_GLOBALS).map(([key, g]) => `
      <div class="fc-room-card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="fc-room-title">${g.label}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--gold)">₹${g.rate}/${g.unit}</div>
        </div>
      </div>`).join('');

    const wrap = document.createElement('div');
    wrap.id = 'fcSpecsShareView';
    wrap.style.cssText = 'max-width:800px;margin:0 auto;padding:40px 20px;';
    wrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid var(--gold);padding-bottom:20px;margin-bottom:28px">
        ${cfg.logo ? `<img src="${cfg.logo}" style="height:50px;width:50px;object-fit:contain;border-radius:8px"/>` : ''}
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;color:var(--gold)">${cfg.company}</div>
          <div style="font-size:0.85rem;color:var(--muted)">${cfg.tagline} · ${cfg.city}</div>
        </div>
      </div>
      <h1 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:8px">False Ceiling Specifications</h1>
      <p style="color:var(--muted);font-size:0.9rem;margin-bottom:24px">Materials and rates for each tier, available add-ons, and global charges.</p>

      <h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:24px 0 12px">Material Tiers</h3>
      ${tierRows}

      <h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:24px 0 12px">Add-ons (per room)</h3>
      ${addonRows}

      <h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:24px 0 12px">Global Charges</h3>
      ${globalRows}

      <div style="text-align:center;padding:20px 0;margin-top:20px;font-size:0.82rem;color:var(--muted)">
        <strong style="color:var(--text)">${cfg.company}</strong> &nbsp;|&nbsp; ${cfg.phone} &nbsp;|&nbsp; ${cfg.email}
      </div>`;
    document.body.appendChild(wrap);
  }
  // ══════════════════════════════════════════════════

  // ── CAROUSEL ──────────────────────────────────────
  const carouselState = {};
  function carouselMove(cid, dir) {
    const track = document.getElementById(cid+'-track');
    if (!track) return;
    const total = track.children.length;
    if (!carouselState[cid]) carouselState[cid] = 0;
    carouselState[cid] = (carouselState[cid] + dir + total) % total;
    carouselGo(cid, carouselState[cid], total);
  }
  function carouselGo(cid, idx, total) {
    carouselState[cid] = idx;
    const track = document.getElementById(cid+'-track');
    if (track) track.style.transform = `translateX(-${idx*100}%)`;
    for (let d=0; d<total; d++) {
      const dot = document.getElementById(`${cid}-dot-${d}`);
      if (dot) dot.className = 'proj-carousel-dot' + (d===idx?' active':'');
    }
  }


  // ══════════════════════════════════════════════════
  // FALSE CEILING QUOTE
  // ══════════════════════════════════════════════════
  const FC_TIERS = {
    basic:    { label:'Basic',    rate:65,  channel:'Local Channel',                    board:'Local Board' },
    standard: { label:'Standard', rate:75,  channel:'Saint Gobain — Magnite or equivalent', board:'Gypboard' },
    premium:  { label:'Premium',  rate:85,  channel:'Saint Gobain — Xpert or equivalent',  board:'Gypboard' }
  };
  const FC_ADDONS = {
    pvc:  { label:'PVC Panels',  rate:220, unit:'Sft', channel:'Saint Gobain — Xpert or equivalent', board:'PVC Panel' },
    cove: { label:'Coves',       rate:null, unit:'Sft', note:'Same rate as selected tier' }
  };
  const FC_GLOBALS = {
    cnc:   { label:'CNC Design with Light Board Sheet', rate:750, unit:'Rft' },
    putty: { label:'Putty — 2 coats (Birla Putty)',    rate:20,  unit:'Sft' },
    primer:{ label:'Primer — 1 coat (Asian Paints)',   rate:15,  unit:'Sft' }
  };

  let fcRooms = [];
  let fcRoomCounter = 0;

  function fcAddRoom(name='') {
    const id = fcRoomCounter++;
    fcRooms.push({ id, name: name||'Room '+(fcRooms.length+1), l:'', b:'', tier:'standard', addons:[] });
    fcRenderRooms();
    // Focus on the new room name
    setTimeout(() => {
      const el = document.getElementById('fc-room-name-'+id);
      if (el) el.focus();
    }, 100);
  }

  function fcDeleteRoom(id) {
    fcRooms = fcRooms.filter(r => r.id !== id);
    fcRenderRooms();
    fcRecalc();
  }

  function fcRenderRooms() {
    const container = document.getElementById('fc-rooms-container');
    if (!container) return;
    container.innerHTML = fcRooms.map(room => {
      const sft = (parseFloat(room.l)||0) * (parseFloat(room.b)||0);
      const tierRate = FC_TIERS[room.tier]?.rate || 75;
      let roomTotal = sft * tierRate;
      const hasPVC  = room.addons.includes('pvc');
      const hasCove = room.addons.includes('cove');
      if (hasPVC)  roomTotal += sft * FC_ADDONS.pvc.rate;
      if (hasCove) roomTotal += sft * tierRate; // cove = same rate as tier

      return `<div class="fc-room-card" id="fc-room-card-${room.id}">
        <button class="fc-del-room" onclick="fcDeleteRoom(${room.id})" title="Remove room">✕</button>
        <div class="fc-room-header">
          <input class="form-input fc-room-title" type="text" id="fc-room-name-${room.id}"
            value="${room.name}" placeholder="Room name (e.g. Hall)"
            oninput="fcUpdateRoom(${room.id},'name',this.value)"
            style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--gold);background:transparent;border:none;border-bottom:1px solid rgba(201,168,76,0.3);border-radius:0;padding:4px 0;max-width:200px"/>
        </div>
        <div class="fc-room-dims">
          <input class="fq-diff-input" type="number" id="fc-l-${room.id}" value="${room.l}"
            placeholder="Length (ft)" oninput="fcUpdateRoom(${room.id},'l',this.value)" style="text-align:center"/>
          <span>×</span>
          <input class="fq-diff-input" type="number" id="fc-b-${room.id}" value="${room.b}"
            placeholder="Breadth (ft)" oninput="fcUpdateRoom(${room.id},'b',this.value)" style="text-align:center"/>
          <span>=</span>
          <div style="text-align:center;font-size:0.85rem;font-weight:700;color:var(--gold)">${sft>0?sft.toLocaleString('en-IN')+' sft':'— sft'}</div>
        </div>

        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:8px">Material Tier</div>
        <div class="fc-tier-row">
          ${Object.entries(FC_TIERS).map(([key,t]) =>
            `<button class="fc-tier-btn ${room.tier===key?'sel-'+key:''}" onclick="fcUpdateRoom(${room.id},'tier','${key}')">
              ${t.label} — ₹${t.rate}/sft
            </button>`
          ).join('')}
        </div>

        <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:8px">Add-ons for this room</div>
        <div class="fc-addon-row">
          <div class="fc-addon-chip ${room.addons.includes('pvc')?'active':''}" onclick="fcToggleAddon(${room.id},'pvc')">
            PVC Panels — ₹220/sft
          </div>
          <div class="fc-addon-chip ${room.addons.includes('cove')?'active':''}" onclick="fcToggleAddon(${room.id},'cove')">
            Coves — same rate as tier
          </div>
        </div>

        <div class="fc-room-total">
          ${sft>0 ? `${sft.toLocaleString('en-IN')} sft × ₹${tierRate}/sft${hasPVC?' + PVC ₹220/sft':''}${hasCove?' + Cove ₹'+tierRate+'/sft':''} = <strong>₹${roomTotal.toLocaleString('en-IN')}</strong>` : '—'}
        </div>
      </div>`;
    }).join('');
    fcRecalc();
  }

  function fcUpdateRoom(id, field, value) {
    const room = fcRooms.find(r => r.id === id);
    if (!room) return;
    room[field] = value;
    // Re-render just the sft display and total without full re-render (preserve focus)
    const l = parseFloat(room.l)||0;
    const b = parseFloat(room.b)||0;
    const sft = l * b;
    const tierRate = FC_TIERS[room.tier]?.rate || 75;
    const hasPVC  = room.addons.includes('pvc');
    const hasCove = room.addons.includes('cove');
    let roomTotal = sft * tierRate;
    if (hasPVC)  roomTotal += sft * FC_ADDONS.pvc.rate;
    if (hasCove) roomTotal += sft * tierRate;
    // Update sft display
    const card = document.getElementById('fc-room-card-'+id);
    if (card && (field==='l'||field==='b')) {
      const sftEl = card.querySelector('.fc-room-dims div');
      if (sftEl) sftEl.textContent = sft>0?sft.toLocaleString('en-IN')+' sft':'— sft';
      const totalEl = card.querySelector('.fc-room-total');
      if (totalEl) totalEl.innerHTML = sft>0?`${sft.toLocaleString('en-IN')} sft × ₹${tierRate}/sft${hasPVC?' + PVC ₹220/sft':''}${hasCove?' + Cove ₹'+tierRate+'/sft':''} = <strong>₹${roomTotal.toLocaleString('en-IN')}</strong>`:'—';
    }
    if (field==='tier' || field==='name') fcRenderRooms();
    fcRecalc();
  }

  function fcToggleAddon(roomId, addonKey) {
    const room = fcRooms.find(r => r.id === roomId);
    if (!room) return;
    const idx = room.addons.indexOf(addonKey);
    if (idx >= 0) room.addons.splice(idx, 1);
    else room.addons.push(addonKey);
    fcRenderRooms();
  }

  function fcToggleGlobal(key) {
    const chk = document.getElementById('fc-'+key+'-chk')?.checked;
    const qtyEl = document.getElementById('fc-'+key+'-qty');
    if (qtyEl) qtyEl.style.display = chk ? 'block' : 'none';
    fcRecalc();
  }

  function fcGetTotalSft() {
    return fcRooms.reduce((s,r) => s + (parseFloat(r.l)||0)*(parseFloat(r.b)||0), 0);
  }

  function fcRecalc() {
    const totalSft = fcGetTotalSft();
    let grandTotal = 0;
    const summaryRows = [];

    // Room rows
    fcRooms.forEach(room => {
      const sft = (parseFloat(room.l)||0)*(parseFloat(room.b)||0);
      if (sft <= 0) return;
      const tierRate = FC_TIERS[room.tier]?.rate || 75;
      const roomBase = sft * tierRate;
      grandTotal += roomBase;
      summaryRows.push(`<div class="fc-summary-row"><span>${room.name} — ${FC_TIERS[room.tier]?.label} (${sft.toLocaleString('en-IN')} sft × ₹${tierRate})</span><span>₹${roomBase.toLocaleString('en-IN')}</span></div>`);

      if (room.addons.includes('pvc')) {
        const pvcAmt = sft * 220;
        grandTotal += pvcAmt;
        summaryRows.push(`<div class="fc-summary-row"><span style="padding-left:12px;color:var(--muted)">↳ ${room.name} — PVC Panels (${sft.toLocaleString('en-IN')} sft × ₹220)</span><span>₹${pvcAmt.toLocaleString('en-IN')}</span></div>`);
      }
      if (room.addons.includes('cove')) {
        const coveAmt = sft * tierRate;
        grandTotal += coveAmt;
        summaryRows.push(`<div class="fc-summary-row"><span style="padding-left:12px;color:var(--muted)">↳ ${room.name} — Coves (${sft.toLocaleString('en-IN')} sft × ₹${tierRate})</span><span>₹${coveAmt.toLocaleString('en-IN')}</span></div>`);
      }
    });

    // Global add-ons
    if (document.getElementById('fc-cnc-chk')?.checked) {
      const qty = parseFloat(document.getElementById('fc-cnc-qty')?.value)||0;
      const amt = qty * 750;
      grandTotal += amt;
      if (qty > 0) summaryRows.push(`<div class="fc-summary-row"><span>CNC Design (${qty.toLocaleString('en-IN')} Rft × ₹750)</span><span>₹${amt.toLocaleString('en-IN')}</span></div>`);
    }
    if (document.getElementById('fc-putty-chk')?.checked && totalSft > 0) {
      const amt = totalSft * 20;
      grandTotal += amt;
      const disp = document.getElementById('fc-putty-display');
      if (disp) disp.textContent = '₹'+amt.toLocaleString('en-IN');
      summaryRows.push(`<div class="fc-summary-row"><span>Putty 2 coats (${totalSft.toLocaleString('en-IN')} sft × ₹20)</span><span>₹${amt.toLocaleString('en-IN')}</span></div>`);
    } else { const disp=document.getElementById('fc-putty-display'); if(disp) disp.textContent='₹0'; }
    if (document.getElementById('fc-primer-chk')?.checked && totalSft > 0) {
      const amt = totalSft * 15;
      grandTotal += amt;
      const disp = document.getElementById('fc-primer-display');
      if (disp) disp.textContent = '₹'+amt.toLocaleString('en-IN');
      summaryRows.push(`<div class="fc-summary-row"><span>Primer 1 coat (${totalSft.toLocaleString('en-IN')} sft × ₹15)</span><span>₹${amt.toLocaleString('en-IN')}</span></div>`);
    } else { const disp=document.getElementById('fc-primer-display'); if(disp) disp.textContent='₹0'; }

    const sumEl = document.getElementById('fc-summary-rows');
    if (sumEl) sumEl.innerHTML = summaryRows.join('') || '<div style="color:var(--muted);font-size:0.85rem;padding:8px 0">Add rooms above to see summary</div>';
    const totEl = document.getElementById('fc-grand-total');
    if (totEl) totEl.textContent = '₹'+grandTotal.toLocaleString('en-IN');
  }

  // ── DOWNLOAD FALSE CEILING QUOTE ─────────────────────────────────────────
  function fcDownloadQuote() {
    const clientName = document.getElementById('fc-clientName')?.value.trim() || 'Client';
    const location   = document.getElementById('fc-location')?.value.trim() || '—';
    const cfg = getConfig();
    const today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const logoSrc = document.querySelector('.nav-logo img')?.src || '';

    const totalSft = fcGetTotalSft();
    let grandTotal = 0;
    let tableRows = '';
    let sno = 1;

    fcRooms.forEach(room => {
      const l = parseFloat(room.l)||0;
      const b = parseFloat(room.b)||0;
      const sft = l*b;
      if (sft <= 0) return;
      const tier = FC_TIERS[room.tier];
      const amt = sft * tier.rate;
      grandTotal += amt;
      tableRows += `<tr>
        <td>${sno++}</td>
        <td>False Ceiling — ${tier.label}<br/><small style="color:#888">${tier.channel}<br/>${tier.board}</small></td>
        <td style="text-align:center">${room.name}</td>
        <td style="text-align:center">${l}</td>
        <td style="text-align:center">${b}</td>
        <td style="text-align:center">${sft.toLocaleString('en-IN')}</td>
        <td style="text-align:center">Sft</td>
        <td style="text-align:center">₹${tier.rate}</td>
        <td style="text-align:right">₹${amt.toLocaleString('en-IN')}</td>
      </tr>`;

      if (room.addons.includes('pvc')) {
        const pvcAmt = sft * 220;
        grandTotal += pvcAmt;
        tableRows += `<tr>
          <td>${sno++}</td>
          <td>PVC Panels<br/><small style="color:#888">${FC_ADDONS.pvc.channel}<br/>${FC_ADDONS.pvc.board}</small></td>
          <td style="text-align:center">${room.name}</td>
          <td style="text-align:center">${l}</td>
          <td style="text-align:center">${b}</td>
          <td style="text-align:center">${sft.toLocaleString('en-IN')}</td>
          <td style="text-align:center">Sft</td>
          <td style="text-align:center">₹220</td>
          <td style="text-align:right">₹${pvcAmt.toLocaleString('en-IN')}</td>
        </tr>`;
      }
      if (room.addons.includes('cove')) {
        const coveAmt = sft * tier.rate;
        grandTotal += coveAmt;
        tableRows += `<tr>
          <td>${sno++}</td>
          <td>Coves<br/><small style="color:#888">${tier.channel}</small></td>
          <td style="text-align:center">${room.name}</td>
          <td style="text-align:center">${l}</td>
          <td style="text-align:center">${b}</td>
          <td style="text-align:center">${sft.toLocaleString('en-IN')}</td>
          <td style="text-align:center">Sft</td>
          <td style="text-align:center">₹${tier.rate}</td>
          <td style="text-align:right">₹${coveAmt.toLocaleString('en-IN')}</td>
        </tr>`;
      }
    });

    // Global add-ons
    if (document.getElementById('fc-cnc-chk')?.checked) {
      const qty = parseFloat(document.getElementById('fc-cnc-qty')?.value)||0;
      if (qty > 0) {
        const amt = qty*750; grandTotal += amt;
        tableRows += `<tr><td>${sno++}</td><td>CNC Design with Light Board Sheet</td><td style="text-align:center">Interior</td><td></td><td></td><td style="text-align:center">${qty}</td><td style="text-align:center">Rft</td><td style="text-align:center">₹750</td><td style="text-align:right">₹${amt.toLocaleString('en-IN')}</td></tr>`;
      }
    }
    if (document.getElementById('fc-putty-chk')?.checked && totalSft>0) {
      const amt = totalSft*20; grandTotal += amt;
      tableRows += `<tr><td>${sno++}</td><td>Putty — 2 coats<br/><small style="color:#888">Birla Putty for false ceiling</small></td><td style="text-align:center">Interior</td><td></td><td></td><td style="text-align:center">${totalSft.toLocaleString('en-IN')}</td><td style="text-align:center">Sft</td><td style="text-align:center">₹20</td><td style="text-align:right">₹${amt.toLocaleString('en-IN')}</td></tr>`;
    }
    if (document.getElementById('fc-primer-chk')?.checked && totalSft>0) {
      const amt = totalSft*15; grandTotal += amt;
      tableRows += `<tr><td>${sno++}</td><td>Primer — 1 coat<br/><small style="color:#888">Asian Paints Primer</small></td><td style="text-align:center">Interior</td><td></td><td></td><td style="text-align:center">${totalSft.toLocaleString('en-IN')}</td><td style="text-align:center">Sft</td><td style="text-align:center">₹15</td><td style="text-align:right">₹${amt.toLocaleString('en-IN')}</td></tr>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>False Ceiling Quote — ${clientName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#fff;color:#222}
  .page{max-width:850px;margin:0 auto;padding:32px 24px}
  .header{text-align:center;border-bottom:2px solid #C9A84C;padding-bottom:18px;margin-bottom:24px}
  .header-logo{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:6px}
  .header-logo img{height:48px;width:48px;object-fit:contain;border-radius:8px}
  .company-name{font-family:Georgia,serif;font-size:1.6rem;font-weight:900;color:#8B5E2A}
  .company-sub{font-size:0.9rem;color:#888;margin-top:2px}
  .quote-title{font-family:Georgia,serif;font-size:1.15rem;font-weight:700;color:#333;margin:16px 0 4px}
  .client-line{font-size:0.95rem;color:#555}
  .meta{display:flex;justify-content:space-between;font-size:0.8rem;color:#888;margin-top:8px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{background:#C9A84C;color:#fff;padding:9px 10px;font-size:0.78rem;text-align:left;font-weight:700}
  td{padding:9px 10px;border-bottom:1px solid #f0e8d8;font-size:0.84rem;vertical-align:top}
  tr:nth-child(even) td{background:#fafaf8}
  .total-row td{font-weight:900;font-size:1rem;color:#8B5E2A;border-top:2px solid #C9A84C;border-bottom:none;background:#fff8e0}
  .footer{margin-top:28px;padding-top:16px;border-top:1px solid #e8dfc8;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:#888}
  .disclaimer{margin-top:20px;padding:12px 16px;background:#fafaf8;border:1px solid #e8dfc8;border-radius:8px;font-size:0.78rem;color:#888;line-height:1.6}
  .wa-btn{padding:7px 14px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-size:0.78rem;font-weight:700}
  @media print{body{background:#fff}.wa-btn{display:none}.page{padding:16px}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-logo">
      ${logoSrc?`<img src="${logoSrc}" alt="${cfg.company}"/>`:''}
      <div><div class="company-name">${cfg.company}</div><div class="company-sub">Interiors and Renovations</div></div>
    </div>
    <div class="quote-title">Quotation for False Ceiling — ${location}</div>
    <div class="client-line">Client Name: <strong>${clientName}</strong></div>
    <div class="meta"><span>Date: ${today}</span><span>${cfg.phone} | ${cfg.email}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:36px">S.No</th>
        <th>Description</th>
        <th style="text-align:center;width:90px">Location</th>
        <th style="text-align:center;width:52px">Length</th>
        <th style="text-align:center;width:52px">Breadth</th>
        <th style="text-align:center;width:60px">Qty</th>
        <th style="text-align:center;width:44px">Unit</th>
        <th style="text-align:center;width:52px">Rate</th>
        <th style="text-align:right;width:80px">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row">
        <td colspan="8">Total</td>
        <td style="text-align:right">₹${grandTotal.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <div class="disclaimer">
    Mentioned above is an estimated quotation for the false ceiling work in the mentioned specifications. 
    Final measurements may vary slightly based on site conditions. GST extra if applicable.
  </div>

  <div class="footer">
    <div><strong>${cfg.company}</strong> · ${cfg.city}</div>
    <a class="wa-btn" href="https://wa.me/${cfg.waNumber}">💬 WhatsApp Us</a>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html],{type:'text/html'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download='FalseCeiling_'+clientName.replace(/\s+/g,'_')+'.html';
    a.click(); URL.revokeObjectURL(url);

    document.querySelector('.fc-download-btn').textContent='✅ Downloaded!';
    setTimeout(()=>document.querySelector('.fc-download-btn').textContent='📄 Download False Ceiling Quote',3000);
  }

  // Init false ceiling with one empty room
  function initFalseCeiling() {
    if (fcRooms.length === 0) {
      fcAddRoom('Hall');
    }
  }
  // ══════════════════════════════════════════════════


  // ══════════════════════════════════════════════════
  // FALSE CEILING FINALIZE
  // ══════════════════════════════════════════════════
  let fcFinData = null;   // loaded quote data
  let fcFinExtraCount = 0;

  // ── Load from current FC quote ──────────────────
  function fcFinLoadCurrent() {
    if (!fcRooms || fcRooms.length === 0) {
      alert('No rooms found. Please go to the False Ceiling page and add rooms first.');
      return;
    }
    const clientName = document.getElementById('fc-clientName')?.value.trim() || 'Client';
    const location   = document.getElementById('fc-location')?.value.trim() || '—';
    const cncChk  = document.getElementById('fc-cnc-chk')?.checked || false;
    const cncQty  = parseFloat(document.getElementById('fc-cnc-qty')?.value)||0;
    const puttyChk  = document.getElementById('fc-putty-chk')?.checked || false;
    const primerChk = document.getElementById('fc-primer-chk')?.checked || false;
    const totalSft  = fcGetTotalSft();

    fcFinData = {
      clientName, location,
      rooms: fcRooms.map(r => ({
        id:r.id, name:r.name, l:parseFloat(r.l)||0, b:parseFloat(r.b)||0,
        tier:r.tier, addons:[...r.addons]
      })),
      globals: {
        cnc:   { active:cncChk,  qty:cncQty, rate:750, label:'CNC Design with Light Board Sheet', unit:'Rft' },
        putty: { active:puttyChk, qty:totalSft, rate:20, label:'Putty — 2 coats (Birla Putty)', unit:'Sft' },
        primer:{ active:primerChk, qty:totalSft, rate:15, label:'Primer — 1 coat (Asian Paints)', unit:'Sft' }
      }
    };
    fcFinBuild();
  }

  // ── Load from uploaded HTML file ────────────────
  function fcFinLoadFile(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const html = e.target.result;
      // Try embedded JSON first
      const jsonMatch = html.match(/<!-- FC_DATA:([\s\S]+?) -->/);
      if (jsonMatch) {
        try {
          fcFinData = JSON.parse(jsonMatch[1].trim());
          fcFinBuild();
          return;
        } catch(err) { console.warn('FC JSON parse failed', err); }
      }
      // Fallback: parse table rows from HTML
      const rows = [...html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)];
      const rooms = [];
      let rctr = 0;
      rows.forEach(m => {
        const cells = [...m[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c=>c[1].replace(/<[^>]+>/g,'').trim());
        if (cells.length >= 8 && !isNaN(parseFloat(cells[3]))) {
          const l=parseFloat(cells[3])||0, b=parseFloat(cells[4])||0;
          const rate=parseFloat(cells[7].replace(/[^0-9.]/g,''))||80;
          const tier = rate<=65?'basic':rate<=75?'standard':'premium';
          rooms.push({id:rctr++,name:cells[2]||'Room '+rctr,l,b,tier,addons:[]});
        }
      });
      const nameMatch = html.match(/Client Name[:\s]+([A-Za-z\s.]+)/i);
      const locMatch  = html.match(/False Ceiling \u2014 ([^<\n]+)/i) || html.match(/False Ceiling[^\n]* ([A-Za-z0-9,. ]+)/i);
      fcFinData = {
        clientName: nameMatch?nameMatch[1].trim():'Client',
        location: locMatch?locMatch[1].trim():'—',
        rooms,
        globals: {
          cnc:   {active:false,qty:0,rate:750,label:'CNC Design with Light Board Sheet',unit:'Rft'},
          putty: {active:false,qty:0,rate:20,label:'Putty — 2 coats (Birla Putty)',unit:'Sft'},
          primer:{active:false,qty:0,rate:15,label:'Primer — 1 coat (Asian Paints)',unit:'Sft'}
        }
      };
      fcFinBuild();
    };
    reader.readAsText(file);
  }

  function fcFinBuild() {
    if (!fcFinData) return;
    // Show loaded info
    const info = document.getElementById('fcfin-loaded-info');
    const nameEl = document.getElementById('fcfin-client-name');
    const countEl = document.getElementById('fcfin-room-count');
    if (info)  info.style.display = 'block';
    if (nameEl)  nameEl.textContent = fcFinData.clientName;
    if (countEl) countEl.textContent = fcFinData.rooms.length + ' rooms loaded';

    // Show nav button
    const navBtn = document.getElementById('nav-fc-finalize');
    if (navBtn) navBtn.style.display = 'block';

    fcFinRenderRooms();
    fcFinRenderGlobals();
    document.getElementById('fcfin-main').style.display = 'block';
    document.getElementById('fcfin-main').scrollIntoView({behavior:'smooth'});
  }

  // ── RENDER ROOMS WITH DEDUCTIONS ────────────────
  function fcFinRenderRooms() {
    if (!fcFinData) return;
    const container = document.getElementById('fcfin-room-rows');
    if (!container) return;

    container.innerHTML = fcFinData.rooms.map((room, ri) => {
      const grossSft = room.l * room.b;
      const deds = room.deductions || [];
      const dedSft = deds.reduce((s,d) => s+(d.sft||0), 0);
      const netSft = Math.max(0, grossSft - dedSft);
      const tier = FC_TIERS[room.tier] || FC_TIERS.standard;

      const dedRows = deds.map((d,di) => `
        <div class="fc-ded-row">
          <input class="fq-diff-input" type="text" value="${d.label||''}" placeholder="e.g. Toilet cutout, Pillar"
            oninput="fcFinUpdateDed(${ri},${di},'label',this.value)" style="font-size:0.82rem"/>
          <input class="fq-diff-input" type="number" value="${d.l||''}" placeholder="L(ft)"
            oninput="fcFinUpdateDed(${ri},${di},'l',this.value)" style="text-align:center"/>
          <input class="fq-diff-input" type="number" value="${d.b||''}" placeholder="B(ft)"
            oninput="fcFinUpdateDed(${ri},${di},'b',this.value)" style="text-align:center"/>
          <div class="fc-ded-sft">−${(d.sft||0).toLocaleString('en-IN')} sft</div>
          <button class="fq-del-btn" onclick="fcFinRemoveDed(${ri},${di})">✕</button>
        </div>`).join('');

      const addonTags = room.addons.map(a =>
        `<span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:rgba(201,168,76,0.1);color:var(--gold);border:1px solid rgba(201,168,76,0.2)">${a==='pvc'?'PVC Panels':'Coves'}</span>`
      ).join(' ');

      return `<div class="fc-room-card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div>
            <div class="fc-room-title">${room.name}</div>
            <div style="font-size:0.78rem;color:var(--muted);margin-top:3px">${room.l} × ${room.b} ft = ${grossSft.toLocaleString('en-IN')} sft gross${addonTags?' &nbsp;':''} ${addonTags}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:0.75rem;color:var(--muted)">Rate (₹/sft)</div>
            <input class="fq-diff-input" type="number" id="fcfin-rate-${ri}" value="${tier.rate}"
              oninput="fcFinRecalc()" style="width:80px;text-align:center"/>
          </div>
        </div>

        ${deds.length > 0 ? `
        <div style="margin-bottom:10px">
          <div style="font-size:0.72rem;color:#ff8080;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Deductions</div>
          <div style="display:grid;grid-template-columns:1fr 100px 100px 90px 30px;gap:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,80,80,0.15);margin-bottom:4px">
            <span style="font-size:0.7rem;color:var(--muted)">Description</span>
            <span style="font-size:0.7rem;color:var(--muted);text-align:center">Length</span>
            <span style="font-size:0.7rem;color:var(--muted);text-align:center">Breadth</span>
            <span style="font-size:0.7rem;color:var(--muted);text-align:right">Area</span>
            <span></span>
          </div>
          ${dedRows}
        </div>` : ''}

        <button class="fc-add-ded-btn" onclick="fcFinAddDed(${ri})">− Add Deduction (toilet, pillar, opening…)</button>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">
          <div style="font-size:0.82rem;color:var(--muted)">
            ${dedSft>0?`Gross ${grossSft.toLocaleString('en-IN')} − Deductions ${dedSft.toLocaleString('en-IN')} = `:''}
            <strong style="color:var(--text)">Net: ${netSft.toLocaleString('en-IN')} sft</strong>
          </div>
          <div id="fcfin-room-total-${ri}" style="font-size:0.9rem;font-weight:700;color:var(--gold)">
            ₹${(netSft * tier.rate).toLocaleString('en-IN')}
          </div>
        </div>
      </div>`;
    }).join('');
    fcFinRecalc();
  }

  function fcFinAddDed(roomIdx) {
    if (!fcFinData?.rooms[roomIdx]) return;
    if (!fcFinData.rooms[roomIdx].deductions) fcFinData.rooms[roomIdx].deductions = [];
    fcFinData.rooms[roomIdx].deductions.push({label:'',l:0,b:0,sft:0});
    fcFinRenderRooms();
  }

  function fcFinRemoveDed(roomIdx, dedIdx) {
    fcFinData.rooms[roomIdx].deductions.splice(dedIdx, 1);
    fcFinRenderRooms();
  }

  function fcFinUpdateDed(roomIdx, dedIdx, field, value) {
    const ded = fcFinData.rooms[roomIdx].deductions[dedIdx];
    ded[field] = field==='label' ? value : (parseFloat(value)||0);
    ded.sft = (ded.l||0) * (ded.b||0);
    // Update sft display without full re-render
    const grossSft = fcFinData.rooms[roomIdx].l * fcFinData.rooms[roomIdx].b;
    const dedSft = fcFinData.rooms[roomIdx].deductions.reduce((s,d)=>s+(d.sft||0),0);
    const netSft = Math.max(0, grossSft - dedSft);
    const ri = roomIdx;
    const rate = parseFloat(document.getElementById('fcfin-rate-'+ri)?.value)||80;
    const totalEl = document.getElementById('fcfin-room-total-'+ri);
    if (totalEl) totalEl.textContent = '₹'+(netSft*rate).toLocaleString('en-IN');
    // Update ded sft display
    const dedSftEl = document.querySelectorAll('#fcfin-room-rows .fc-ded-sft')[dedIdx];
    if (dedSftEl) dedSftEl.textContent = '−'+(ded.sft||0).toLocaleString('en-IN')+' sft';
    fcFinRecalc();
  }

  function fcFinRenderGlobals() {
    if (!fcFinData?.globals) return;
    const container = document.getElementById('fcfin-globals-rows');
    if (!container) return;
    const gl = fcFinData.globals;
    container.innerHTML = Object.entries(gl).map(([key,g]) => `
      <div class="fc-global-row" style="margin-bottom:8px">
        <div>
          <div class="fc-global-label">${g.label}</div>
          <div style="font-size:0.75rem;color:var(--muted)">₹${g.rate}/${g.unit}</div>
        </div>
        <input type="checkbox" id="fcfin-${key}-chk" ${g.active?'checked':''} onchange="fcFinRecalc()"
          style="accent-color:var(--gold);width:18px;height:18px"/>
        <span class="fc-global-unit">${g.unit}</span>
        <input class="fq-diff-input" type="number" id="fcfin-${key}-qty"
          value="${g.qty||''}" placeholder="Qty" oninput="fcFinRecalc()"
          style="${key==='putty'||key==='primer'?'color:var(--muted)':''};text-align:center"/>
      </div>`).join('');
  }

  // ── Extra rows ──────────────────────────────────
  function fcFinAddExtra() {
    const tbody = document.getElementById('fcfin-extra-body');
    const idx = fcFinExtraCount++;
    const sno = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.id = 'fcfin-extra-'+idx;
    row.innerHTML = `
      <td style="text-align:center;color:var(--muted);font-size:0.82rem">${sno}</td>
      <td><input class="fq-extra-input" type="text" id="fcfe-desc-${idx}" placeholder="Description"/></td>
      <td><input class="fq-extra-input" type="number" id="fcfe-qty-${idx}" placeholder="Qty" oninput="fcFinCalcExtra(${idx})" style="text-align:center"/></td>
      <td><input class="fq-extra-input" type="text" id="fcfe-unit-${idx}" placeholder="Sft/Rft/Nos"/></td>
      <td><input class="fq-extra-input" type="number" id="fcfe-rate-${idx}" placeholder="₹" oninput="fcFinCalcExtra(${idx})" style="text-align:right"/></td>
      <td style="text-align:right;font-weight:700;color:var(--gold)" id="fcfe-total-${idx}">₹0</td>
      <td><button class="fq-del-btn" onclick="document.getElementById('fcfin-extra-${idx}').remove();fcFinRecalc()">✕</button></td>`;
    tbody.appendChild(row);
  }

  function fcFinCalcExtra(idx) {
    const qty  = parseFloat(document.getElementById('fcfe-qty-'+idx)?.value)||0;
    const rate = parseFloat(document.getElementById('fcfe-rate-'+idx)?.value)||0;
    const el   = document.getElementById('fcfe-total-'+idx);
    if (el) el.textContent = '₹'+(qty*rate).toLocaleString('en-IN');
    fcFinRecalc();
  }

  function fcFinGetExtras() {
    const rows = [];
    document.querySelectorAll('#fcfin-extra-body tr').forEach(row => {
      const idx = row.id.replace('fcfin-extra-','');
      const desc = document.getElementById('fcfe-desc-'+idx)?.value.trim()||'';
      const qty  = parseFloat(document.getElementById('fcfe-qty-'+idx)?.value)||0;
      const unit = document.getElementById('fcfe-unit-'+idx)?.value.trim()||'';
      const rate = parseFloat(document.getElementById('fcfe-rate-'+idx)?.value)||0;
      if (desc||qty||rate) rows.push({sno:rows.length+1,desc,qty,unit,rate,total:qty*rate});
    });
    return rows;
  }

  // ── Recalc ──────────────────────────────────────
  function fcFinRecalc() {
    if (!fcFinData) return;
    let grandTotal = 0;
    const grandRows = [];

    fcFinData.rooms.forEach((room, ri) => {
      const grossSft = room.l * room.b;
      const deds = room.deductions||[];
      const dedSft = deds.reduce((s,d)=>s+(d.sft||0),0);
      const netSft = Math.max(0, grossSft - dedSft);
      const rate = parseFloat(document.getElementById('fcfin-rate-'+ri)?.value) || FC_TIERS[room.tier]?.rate || 80;
      const baseAmt = netSft * rate;
      grandTotal += baseAmt;
      grandRows.push(`<div class="fq-grand-row"><span class="fq-grand-label">${room.name} — ${netSft.toLocaleString('en-IN')} sft × ₹${rate}</span><span class="fq-grand-val">₹${baseAmt.toLocaleString('en-IN')}</span></div>`);

      room.addons.forEach(addon => {
        const aRate = addon==='pvc' ? 220 : rate;
        const aAmt  = netSft * aRate;
        grandTotal += aAmt;
        grandRows.push(`<div class="fq-grand-row"><span class="fq-grand-label" style="padding-left:12px">↳ ${room.name} — ${addon==='pvc'?'PVC Panels':'Coves'} (${netSft.toLocaleString('en-IN')} sft × ₹${aRate})</span><span class="fq-grand-val">₹${aAmt.toLocaleString('en-IN')}</span></div>`);
      });
    });

    // Globals
    if (fcFinData.globals) {
      Object.entries(fcFinData.globals).forEach(([key,g]) => {
        const chk = document.getElementById('fcfin-'+key+'-chk')?.checked;
        const qty = parseFloat(document.getElementById('fcfin-'+key+'-qty')?.value)||0;
        if (chk && qty>0) {
          const amt = qty * g.rate;
          grandTotal += amt;
          grandRows.push(`<div class="fq-grand-row"><span class="fq-grand-label">${g.label} (${qty.toLocaleString('en-IN')} ${g.unit} × ₹${g.rate})</span><span class="fq-grand-val">₹${amt.toLocaleString('en-IN')}</span></div>`);
        }
      });
    }

    // Extras
    fcFinGetExtras().forEach(r => {
      grandTotal += r.total;
      grandRows.push(`<div class="fq-grand-row"><span class="fq-grand-label">${r.desc} (${r.qty} ${r.unit} × ₹${r.rate})</span><span class="fq-grand-val">₹${r.total.toLocaleString('en-IN')}</span></div>`);
    });

    const grandEl = document.getElementById('fcfin-grand-rows');
    if (grandEl) grandEl.innerHTML = grandRows.join('') || '<div style="color:var(--muted);font-size:0.85rem">Load a quote above to see summary</div>';
    const totEl = document.getElementById('fcfin-grand-total');
    if (totEl) totEl.textContent = '₹'+grandTotal.toLocaleString('en-IN');
  }

  // ── DOWNLOAD FINAL FC QUOTE ─────────────────────
  function fcFinDownload() {
    if (!fcFinData) return;
    const cfg = getConfig();
    const today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const logoSrc = document.querySelector('.nav-logo img')?.src||'';
    let grandTotal = 0;
    let tableRows = '';
    let sno = 1;

    fcFinData.rooms.forEach((room, ri) => {
      const grossSft = room.l * room.b;
      const deds = room.deductions||[];
      const dedSft = deds.reduce((s,d)=>s+(d.sft||0),0);
      const netSft = Math.max(0, grossSft - dedSft);
      const rate = parseFloat(document.getElementById('fcfin-rate-'+ri)?.value)||FC_TIERS[room.tier]?.rate||80;
      const tier = FC_TIERS[room.tier]||FC_TIERS.standard;
      const baseAmt = netSft * rate;
      grandTotal += baseAmt;

      const dedNote = deds.filter(d=>d.sft>0).map(d=>`<br/><small style="color:#888">− ${d.label||'Deduction'}: ${d.l}×${d.b} = ${d.sft} sft</small>`).join('');

      tableRows += `<tr>
        <td>${sno++}</td>
        <td>False Ceiling — ${tier.label}<br/><small style="color:#888">${tier.channel}<br/>${tier.board}</small>${dedNote}</td>
        <td style="text-align:center">${room.name}</td>
        <td style="text-align:center">${room.l}</td>
        <td style="text-align:center">${room.b}</td>
        <td style="text-align:center">${dedSft>0?`<span style="color:#888;text-decoration:line-through">${grossSft}</span> → ${netSft.toLocaleString('en-IN')}`:netSft.toLocaleString('en-IN')}</td>
        <td style="text-align:center">Sft</td>
        <td style="text-align:center">₹${rate}</td>
        <td style="text-align:right">₹${baseAmt.toLocaleString('en-IN')}</td>
      </tr>`;

      room.addons.forEach(addon => {
        const aRate = addon==='pvc'?220:rate;
        const aAmt = netSft*aRate;
        const aLabel = addon==='pvc'?`PVC Panels<br/><small style="color:#888">${FC_ADDONS.pvc.channel}<br/>${FC_ADDONS.pvc.board}</small>`:'Coves';
        grandTotal += aAmt;
        tableRows += `<tr><td>${sno++}</td><td>${aLabel}</td><td style="text-align:center">${room.name}</td><td></td><td></td><td style="text-align:center">${netSft.toLocaleString('en-IN')}</td><td style="text-align:center">Sft</td><td style="text-align:center">₹${aRate}</td><td style="text-align:right">₹${aAmt.toLocaleString('en-IN')}</td></tr>`;
      });
    });

    // Globals
    if (fcFinData.globals) {
      Object.entries(fcFinData.globals).forEach(([key,g]) => {
        const chk = document.getElementById('fcfin-'+key+'-chk')?.checked;
        const qty = parseFloat(document.getElementById('fcfin-'+key+'-qty')?.value)||0;
        if (chk && qty>0) {
          const amt = qty*g.rate;
          grandTotal += amt;
          tableRows += `<tr><td>${sno++}</td><td>${g.label}</td><td style="text-align:center">Interior</td><td></td><td></td><td style="text-align:center">${qty.toLocaleString('en-IN')}</td><td style="text-align:center">${g.unit}</td><td style="text-align:center">₹${g.rate}</td><td style="text-align:right">₹${amt.toLocaleString('en-IN')}</td></tr>`;
        }
      });
    }

    // Extras
    fcFinGetExtras().forEach(r => {
      grandTotal += r.total;
      tableRows += `<tr><td>${sno++}</td><td>${r.desc}</td><td></td><td></td><td></td><td style="text-align:center">${r.qty}</td><td style="text-align:center">${r.unit}</td><td style="text-align:center">₹${r.rate}</td><td style="text-align:right">₹${r.total.toLocaleString('en-IN')}</td></tr>`;
    });

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Final False Ceiling Quote — ${fcFinData.clientName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#fff;color:#222}
.page{max-width:850px;margin:0 auto;padding:32px 24px}
.header{text-align:center;border-bottom:2px solid #C9A84C;padding-bottom:18px;margin-bottom:24px}
.header-logo{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:6px}
.header-logo img{height:48px;width:48px;object-fit:contain;border-radius:8px}
.company-name{font-family:Georgia,serif;font-size:1.6rem;font-weight:900;color:#8B5E2A}
.company-sub{font-size:0.9rem;color:#888;margin-top:2px}
.quote-title{font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#333;margin:16px 0 4px}
.client-line{font-size:0.95rem;color:#555}
.meta{display:flex;justify-content:space-between;font-size:0.8rem;color:#888;margin-top:8px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#C9A84C;color:#fff;padding:9px 10px;font-size:0.78rem;text-align:left;font-weight:700}
td{padding:9px 10px;border-bottom:1px solid #f0e8d8;font-size:0.84rem;vertical-align:top}
tr:nth-child(even) td{background:#fafaf8}
.total-row td{font-weight:900;font-size:1rem;color:#8B5E2A;border-top:2px solid #C9A84C;border-bottom:none;background:#fff8e0}
.footer{margin-top:28px;padding-top:16px;border-top:1px solid #e8dfc8;display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:#888}
.disclaimer{margin-top:20px;padding:12px 16px;background:#fafaf8;border:1px solid #e8dfc8;border-radius:8px;font-size:0.78rem;color:#888;line-height:1.6}
.wa-btn{padding:7px 14px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-size:0.78rem;font-weight:700}
@media print{body{background:#fff}.wa-btn{display:none}}
</style></head>
<body><div class="page">
  <div class="header">
    <div class="header-logo">${logoSrc?`<img src="${logoSrc}" alt="${cfg.company}"/>`:''}
      <div><div class="company-name">${cfg.company}</div><div class="company-sub">Interiors and Renovations</div></div>
    </div>
    <div class="quote-title">Quotation for False Ceiling — ${fcFinData.location}</div>
    <div class="client-line">Client Name: <strong>${fcFinData.clientName}</strong></div>
    <div class="meta"><span>Date: ${today}</span><span>${cfg.phone} | ${cfg.email}</span></div>
  </div>
  <table>
    <thead><tr>
      <th style="width:36px">S.No</th><th>Description</th>
      <th style="text-align:center;width:90px">Location</th>
      <th style="text-align:center;width:52px">Length</th>
      <th style="text-align:center;width:52px">Breadth</th>
      <th style="text-align:center;width:70px">Qty</th>
      <th style="text-align:center;width:44px">Unit</th>
      <th style="text-align:center;width:52px">Rate</th>
      <th style="text-align:right;width:80px">Subtotal</th>
    </tr></thead>
    <tbody>
      ${tableRows}
      <tr class="total-row"><td colspan="8">Total</td><td style="text-align:right">₹${grandTotal.toLocaleString('en-IN')}</td></tr>
    </tbody>
  </table>
  <div class="disclaimer">Mentioned above is an estimated quotation for the false ceiling work in the mentioned specifications. Final measurements may vary slightly based on site conditions. GST extra if applicable.</div>
  <div class="footer">
    <div><strong>${cfg.company}</strong> · ${cfg.city}</div>
    <a class="wa-btn" href="https://wa.me/${cfg.waNumber}">💬 WhatsApp Us</a>
  </div>
</div></body></html>`;

    const blob = new Blob([html],{type:'text/html'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download='FinalFC_'+fcFinData.clientName.replace(/\s+/g,'_')+'.html';
    a.click(); URL.revokeObjectURL(url);

    const btn = document.querySelector('#page-fc-finalize .fc-download-btn');
    if (btn) { btn.textContent='✅ Downloaded!'; setTimeout(()=>btn.textContent='🖨️ Generate & Download Final FC Quote',3000); }
  }
  // ── SIGN OUT ─────────────────────────────────────────────
  async function sbLogout() {
    const SUPABASE_URL = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';
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
    if (typeof showLandingPage === 'function') showLandingPage();
    else window.location.reload();
  }

  function toggleMenu() {
    const links = document.getElementById('navLinks');
    const btn = document.getElementById('navHamburger');
    if (links) links.classList.toggle('open');
    if (btn) btn.textContent = links && links.classList.contains('open') ? '✕' : '☰';
  }
  function closeMenu() {
    const links = document.getElementById('navLinks');
    const btn = document.getElementById('navHamburger');
    if (links) links.classList.remove('open');
    if (btn) btn.textContent = '☰';
  }


  // ══════════════════════════════════════════════════


  // ══════════════════════════════════════════════════
  // WORK ORDER
  // ══════════════════════════════════════════════════
  async function getWorkOrderNumber() {
    const year = new Date().getFullYear();
    // Phase 3: get next number from Supabase if session exists
    if (window.SB_SESSION && window.SB_COMPANY_ID) {
      try {
        const url = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
        const key = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';
        const res = await fetch(`${url}/rest/v1/rpc/next_wo_number`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + window.SB_SESSION.access_token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_company_id: window.SB_COMPANY_ID })
        });
        if (res.ok) {
          const counter = await res.json();
          return { label: 'WO-' + year + '-' + String(counter).padStart(3, '0'), counter };
        }
      } catch (e) {
        console.warn('[SB] getWorkOrderNumber failed, falling back to localStorage:', e);
      }
    }
    // Fallback: localStorage (offline / not logged in)
    let counter = parseInt(localStorage.getItem('eh_wo_counter')) || 0;
    counter += 1;
    localStorage.setItem('eh_wo_counter', counter);
    return { label: 'WO-' + year + '-' + String(counter).padStart(3, '0'), counter };
  }

  async function saveWorkOrderToDB(counter, woHtml) {
    if (!window.SB_SESSION || !window.SB_COMPANY_ID) return;
    try {
      const url = 'https://gmpamjblvnbiqwbkzmtp.supabase.co';
      const key = 'sb_publishable_dGo3_9kBS4vSzupFSKd-iQ_pgC1oZ0F';
      await fetch(`${url}/rest/v1/work_orders`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + window.SB_SESSION.access_token,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          company_id: window.SB_COMPANY_ID,
          wo_number: counter,
          wo_data: { html_length: woHtml.length, generated_at: new Date().toISOString() }
        })
      });
    } catch (e) {
      console.warn('[SB] saveWorkOrderToDB failed:', e);
    }
  }

  async function generateWorkOrder() {
    if (!fqData) { alert('Please load a quote first.'); return; }
    const cfg   = getConfig();
    const pkg   = fqData.pkg;
    const name  = fqData.name || '—';
    const phone = fqData.phone || '—';
    const loc   = fqData.loc || '—';
    const type  = fqData.type || 'Residential';
    const floors = fqData.floors || '1';
    const area  = fqData.area || 0;
    const dims  = fqData.dims || [];
    const addonData = fqData.addonData || [];
    const extraRows = getExtraRows();
    const today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    const woResult = await getWorkOrderNumber();
    const woNumber = woResult.label;
    const logoSrc = document.querySelector('.nav-logo img')?.src || '';
    const pkgLabel = { basic:'Basic', standard:'Standard', premium:'Premium' };

    // Recompute floor-wise costs (same logic as generateFinalQuote)
    let constructionTotal = 0;
    const floorLines = dims.map((d, i) => {
      const sft  = parseFloat(document.getElementById('fq-fl-sft-'+i)?.value) || 0;
      const rate = parseFloat(document.getElementById('fq-fl-rate-'+i)?.value) || 0;
      const amt  = sft * rate;
      constructionTotal += amt;
      return { name: d.name, sft, rate, amt };
    });
    let addonTotal = 0;
    addonData.forEach(a => { addonTotal += Number(a.cost) || 0; });
    let extraTotal = 0;
    extraRows.forEach(r => { extraTotal += r.total; });
    const grandTotal = constructionTotal + addonTotal + extraTotal;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Work Order — ${name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#fff;color:#222;line-height:1.5}
  .page{max-width:850px;margin:0 auto;padding:32px 28px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C9A84C;padding-bottom:16px;margin-bottom:20px}
  .header-logo{display:flex;align-items:center;gap:12px}
  .header-logo img{height:50px;width:50px;object-fit:contain;border-radius:8px}
  .company-name{font-family:Georgia,serif;font-size:1.5rem;font-weight:900;color:#8B5E2A}
  .company-sub{font-size:0.85rem;color:#888;margin-top:2px}
  .wo-meta{text-align:right;font-size:0.82rem;color:#555}
  .wo-meta strong{color:#222;font-size:0.95rem}
  .doc-title{text-align:center;font-family:Georgia,serif;font-size:1.4rem;font-weight:900;letter-spacing:1px;margin:18px 0 24px;text-transform:uppercase;color:#333}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 28px;margin-bottom:24px;padding:18px 20px;background:#fafaf8;border:1px solid #e8dfc8;border-radius:10px}
  .info-item{font-size:0.88rem}
  .info-label{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:2px}
  .info-val{font-weight:700;color:#222}
  .section-title{font-family:Georgia,serif;font-size:1.05rem;font-weight:700;color:#8B5E2A;margin:22px 0 10px;padding-bottom:6px;border-bottom:1px solid #e8dfc8}
  table{width:100%;border-collapse:collapse;margin-bottom:18px}
  th{background:#C9A84C;color:#fff;padding:8px 10px;font-size:0.76rem;text-align:left;font-weight:700}
  td{padding:8px 10px;border-bottom:1px solid #f0e8d8;font-size:0.82rem}
  tr:nth-child(even) td{background:#fafaf8}
  .total-row td{font-weight:900;font-size:0.95rem;color:#8B5E2A;border-top:2px solid #C9A84C;background:#fff8e0}
  .spec-section{margin-bottom:14px}
  .spec-section h4{font-size:0.82rem;color:#8B5E2A;margin-bottom:6px;font-weight:700}
  .spec-section ul{list-style:none;padding-left:0}
  .spec-section li{font-size:0.78rem;color:#444;padding:3px 0 3px 14px;position:relative;line-height:1.5}
  .spec-section li:before{content:'›';position:absolute;left:0;color:#C9A84C;font-weight:700}
  .sign-section{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:50px;page-break-inside:avoid}
  .sign-box{text-align:center}
  .sign-line{border-top:1.5px solid #333;margin-top:50px;padding-top:8px;font-size:0.82rem;font-weight:700;color:#222}
  .sign-sub{font-size:0.74rem;color:#888;margin-top:2px}
  .sign-date{font-size:0.74rem;color:#888;margin-top:18px}
  .footer-note{margin-top:30px;padding:14px 16px;background:#fafaf8;border:1px solid #e8dfc8;border-radius:8px;font-size:0.76rem;color:#888;line-height:1.6}
  .print-btn{display:block;width:100%;padding:12px;margin-top:24px;background:#C9A84C;color:#fff;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer}
  @media print{.print-btn{display:none}.page{padding:10px}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-logo">
      ${logoSrc?`<img src="${logoSrc}" alt="${cfg.company}"/>`:''}
      <div><div class="company-name">${cfg.company}</div><div class="company-sub">${cfg.tagline} · ${cfg.city}</div></div>
    </div>
    <div class="wo-meta">
      <div><strong>${woNumber}</strong></div>
      <div>Date: ${today}</div>
      <div>${cfg.phone}</div>
    </div>
  </div>

  <div class="doc-title">Work Order</div>

  <div class="info-grid">
    <div class="info-item"><div class="info-label">Client Name</div><div class="info-val">${name}</div></div>
    <div class="info-item"><div class="info-label">Contact Number</div><div class="info-val">${phone}</div></div>
    <div class="info-item" style="grid-column:1/-1"><div class="info-label">Project Address / Location</div><div class="info-val">${loc}</div></div>
    <div class="info-item"><div class="info-label">Project Type</div><div class="info-val">${type}</div></div>
    <div class="info-item"><div class="info-label">Package Selected</div><div class="info-val">${pkgLabel[pkg]||pkg}</div></div>
    <div class="info-item"><div class="info-label">Number of Floors</div><div class="info-val">${getFloorLabel(floors)}</div></div>
    <div class="info-item"><div class="info-label">Total Built-up Area</div><div class="info-val">${area.toLocaleString('en-IN')} sft</div></div>
  </div>

  <div class="section-title">Project Cost — Floor Wise</div>
  <table>
    <tr><th>Floor</th><th style="text-align:right">Area (sft)</th><th style="text-align:right">Rate (₹/sft)</th><th style="text-align:right">Amount</th></tr>
    ${floorLines.map(f=>`<tr><td>${f.name}</td><td style="text-align:right">${f.sft.toLocaleString('en-IN')}</td><td style="text-align:right">₹${f.rate.toLocaleString('en-IN')}</td><td style="text-align:right">₹${f.amt.toLocaleString('en-IN')}</td></tr>`).join('')}
    ${addonData.map(a=>`<tr><td>${a.label}</td><td style="text-align:right">${Number(a.litres).toLocaleString('en-IN')} litres</td><td style="text-align:right">₹${a.rate}/litre</td><td style="text-align:right">₹${Number(a.cost).toLocaleString('en-IN')}</td></tr>`).join('')}
    ${extraRows.length?extraRows.map(r=>`<tr><td>${r.desc}</td><td style="text-align:right">${r.qty} ${r.unit}</td><td style="text-align:right">₹${r.price.toLocaleString('en-IN')}</td><td style="text-align:right">₹${r.total.toLocaleString('en-IN')}</td></tr>`).join(''):''}
    <tr class="total-row"><td colspan="3">Total Work Order Value</td><td style="text-align:right">₹${grandTotal.toLocaleString('en-IN')}</td></tr>
  </table>

  <div class="section-title">General Specifications</div>
  ${specsTextToHtml(getSpecsText('specs'))}

  <div class="section-title">Terms &amp; Conditions</div>
  ${specsTextToHtml(getSpecsText('terms'))}

  <div class="sign-section">
    <div class="sign-box">
      <div class="sign-line">${name}</div>
      <div class="sign-sub">Client Signature</div>
      <div class="sign-date">Date: _______________</div>
    </div>
    <div class="sign-box">
      <div class="sign-line">${cfg.company}</div>
      <div class="sign-sub">Contractor Signature</div>
      <div class="sign-date">Date: _______________</div>
    </div>
  </div>

  <div class="footer-note">
    This work order confirms the agreed scope, specifications and cost between the client and contractor as detailed above. Any changes to scope or specifications after signing will require a written addendum. Please retain a signed copy for your records.
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'WorkOrder_' + name.replace(/\s+/g,'_') + '.html';
    a.click(); URL.revokeObjectURL(url);

    saveWorkOrderToDB(woResult.counter, html);

    const btns = document.querySelectorAll('.fq-finalize-btn');
    const woBtn = [...btns].find(b => b.textContent.includes('Work Order'));
    if (woBtn) { woBtn.textContent='✅ Downloaded!'; setTimeout(()=>woBtn.textContent='📋 Download Work Order',3000); }
  }
  // ══════════════════════════════════════════════════

  // ── SHARE-LINK PAGE DISPATCH (runs last, after all data is defined) ──
  (function specsLinkDispatch(){
    const params = new URLSearchParams(window.location.search);
    if (params.get('specs')) { renderSpecsSharePage(); }
    else if (params.get('fcspecs')) { renderFcSpecsSharePage(); }
  })();
