(() => {
  'use strict';
  const D = window.BD_DATA;
  const INFO = window.BD_INFO || {};
  const NS = 'http://www.w3.org/2000/svg';
  const STORE = 'bdtrip_v2';
  const CHK = 'bdtrip_chk';
  const DIV_ORDER = [6, 1, 5, 4, 3, 2, 7, 8]; // ঢাকা, চট্টগ্রাম, সিলেট, বরিশাল, খুলনা, রাজশাহী, রংপুর, ময়মনসিংহ

  const THEMES = [
    { name: 'সবুজ',     v: '#0f7a5a', w: '#f5a623', bg: '#f3efe3', empty: '#e0dac7', hover: '#cfdcd2' },
    { name: 'সাগর',     v: '#1d4ed8', w: '#f59e0b', bg: '#eef3fb', empty: '#d9e2f1', hover: '#c5d3ee' },
    { name: 'সূর্যাস্ত', v: '#e4572e', w: '#7c3aed', bg: '#fbf0e6', empty: '#ecdccd', hover: '#f1cdbb' },
    { name: 'বেগুনি',    v: '#6d28d9', w: '#10b981', bg: '#f4effa', empty: '#e4dbf0', hover: '#d3c3e6' },
    { name: 'রাত',      v: '#34d399', w: '#fbbf24', bg: '#0f1c1a', empty: '#21332f', hover: '#2e4a42', ink: '#f2f7f5', mut: '#9fb5ad', pageV: '#0f7a5a' }
  ];
  const LEVELS = [[0, 'নতুন ভ্রমণকারী'], [5, 'পথের সাথী'], [15, 'অভিযাত্রী'], [30, 'দেশ-দর্শক'], [64, 'বাংলাদেশ জয়ী']];
  const LEVEL_META = [[1,'🌱','নতুন ভ্রমণকারী','১–৪ জেলা'],[5,'🧭','পথের সাথী','৫–১৪ জেলা'],[15,'🏕','অভিযাত্রী','১৫–২৯ জেলা'],[30,'🗺','দেশ-দর্শক','৩০–৪৯ জেলা'],[64,'🏆','বাংলাদেশ জয়ী','৬৪ জেলা']];
  const CHECKS = [
    'জাতীয় পরিচয়পত্র / আইডি কার্ড', 'ফোন চার্জার ও পাওয়ার ব্যাংক', 'নগদ টাকা (দূরের এলাকার জন্য)',
    'অগ্রিম টিকিট ও হোটেল বুকিং', 'প্রয়োজনীয় ওষুধ ও ফার্স্ট এইড', 'ছাতা / রেইনকোট',
    'পানির বোতল ও হালকা খাবার', 'আবহাওয়ার পূর্বাভাস দেখে নেওয়া', 'স্থানীয় নিয়ম ও অনুমতি যাচাই (পাহাড়, দ্বীপ, বনাঞ্চল)'
  ];

  const $ = (s) => document.querySelector(s);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const bnDigits = '০১২৩৪৫৬৭৮৯';
  const bn = (n) => String(n).replace(/\d/g, (d) => bnDigits[d]);
  const money = (n) => '৳' + Math.round(n).toLocaleString('bn-BD');

  // ---------- state ----------
  const state = { v: new Set(), w: new Set(), mode: 'v', theme: 0, name: '', labels: true, cur: null };
  try {
    let s = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (!s) {
      const old = JSON.parse(localStorage.getItem('ub_state_v1') || 'null'); // আগের ভার্সন থেকে নিয়ে আসা
      if (old) s = { v: old.sel, theme: old.theme, name: old.name, labels: old.labels };
    }
    if (s) {
      state.v = new Set(s.v || []);
      state.w = new Set((s.w || []).filter((id) => !state.v.has(id)));
      state.theme = Math.min(s.theme || 0, THEMES.length - 1);
      state.name = s.name || '';
      state.labels = s.labels !== false;
    }
  } catch (e) {}
  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify({ v: [...state.v], w: [...state.w], theme: state.theme, name: state.name, labels: state.labels })); } catch (e) {}
  };

  const byId = new Map(D.districts.map((d) => [d.id, d]));
  const total = D.districts.length;
  const divName = (id) => D.divisions.find((x) => x.id === id).bn;
  const statusOf = (id) => (state.v.has(id) ? 'v' : state.w.has(id) ? 'w' : null);
  function setStatus(id, st) {
    state.v.delete(id); state.w.delete(id);
    if (st === 'v') state.v.add(id);
    if (st === 'w') state.w.add(id);
  }

  // ---------- share-link codec ----------
  const SHARE_BITS = 2;
  const bytesToB64Url = (bytes) => {
    let s = ''; for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };
  const b64UrlToBytes = (str) => {
    const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - str.length % 4) % 4));
    return Uint8Array.from(s, ch => ch.charCodeAt(0));
  };
  const encodeShare = () => {
    const bytes = new Uint8Array(Math.ceil(total * SHARE_BITS / 8));
    D.districts.forEach((d, i) => {
      const st = statusOf(d.id), val = st === 'v' ? 1 : st === 'w' ? 2 : 0;
      const bit = i * SHARE_BITS, bi = bit >> 3, off = bit & 7;
      bytes[bi] |= val << off;
    });
    return bytesToB64Url(bytes);
  };
  const decodeShare = (code) => {
    try {
      const bytes = b64UrlToBytes(code);
      if (bytes.length < Math.ceil(total * SHARE_BITS / 8)) return null;
      const shared = { v:new Set(), w:new Set() };
      D.districts.forEach((d, i) => {
        const bit = i * SHARE_BITS, bi = bit >> 3, off = bit & 7;
        const val = (bytes[bi] >> off) & 3;
        if (val === 1) shared.v.add(d.id);
        if (val === 2) shared.w.add(d.id);
      });
      return shared;
    } catch (_) { return null; }
  };
  const shareCode = new URLSearchParams(location.search).get('m') || (location.pathname.match(/^\/m\/([A-Za-z0-9_-]{10,40})\/?$/) || [])[1] || '';
  const sharedState = shareCode ? decodeShare(shareCode) : null;
  const qp = new URLSearchParams(location.search);
  const districtParam = Number(qp.get('district') || 0);
  const markParam = qp.get('mark');
  if (districtParam && byId.has(districtParam) && (markParam === 'v' || markParam === 'w')) {
    setStatus(districtParam, markParam);
    state.cur = districtParam;
    window.BDTripCurrentDistrict = districtParam;
    save();
  }

  // ---------- map ----------
  const svg = $('#map');
  svg.setAttribute('viewBox', `0 0 ${D.w} ${D.h}`);
  const pathEls = new Map();
  D.districts.forEach((d) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d.d);
    p.dataset.id = d.id;
    pathEls.set(d.id, p);
    svg.appendChild(p);
  });
  const labelG = document.createElementNS(NS, 'g');
  svg.appendChild(labelG);

  const tip = $('#tip');
  svg.addEventListener('click', (e) => {
    const p = e.target.closest('path');
    if (p) pick(+p.dataset.id);
  });
  svg.addEventListener('mousemove', (e) => {
    const p = e.target.closest('path');
    if (!p) { tip.hidden = true; return; }
    const d = byId.get(+p.dataset.id), st = statusOf(d.id);
    tip.textContent = d.bn + (st === 'v' ? ' ✓' : st === 'w' ? ' ★' : '');
    tip.style.left = e.clientX + 'px';
    tip.style.top = e.clientY + 'px';
    tip.hidden = false;
  });
  svg.addEventListener('mouseleave', () => (tip.hidden = true));

  function pick(id) {
    state.cur = id;
    window.BDTripCurrentDistrict = id;
    setStatus(id, statusOf(id) === state.mode ? null : state.mode);
    update();
  }

  // ---------- picker ----------
  const groupsEl = $('#groups');
  const chipEls = new Map();
  const groupEls = [];
  DIV_ORDER.forEach((did) => {
    const list = D.districts.filter((d) => d.div === did).sort((a, b) => a.bn.localeCompare(b.bn, 'bn'));
    const g = document.createElement('div');
    g.className = 'group';
    g.innerHTML = `<div class="g-head"><h3>${divName(did)} বিভাগ<span class="gc"></span></h3><button type="button" class="g-all"></button></div><div class="chips"></div>`;
    const chips = g.querySelector('.chips');
    list.forEach((d) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = d.bn;
      b.dataset.q = (d.bn + ' ' + d.en).toLowerCase();
      b.addEventListener('click', () => pick(d.id));
      chips.appendChild(b);
      chipEls.set(d.id, b);
    });
    g.querySelector('.g-all').addEventListener('click', () => {
      const all = list.every((d) => state.v.has(d.id));
      list.forEach((d) => setStatus(d.id, all ? null : 'v'));
      update();
    });
    g._list = list;
    groupsEl.appendChild(g);
    groupEls.push(g);
  });

  $('#selAll').addEventListener('click', () => { D.districts.forEach((d) => setStatus(d.id, 'v')); update(); });
  $('#clrAll').addEventListener('click', () => { state.v.clear(); state.w.clear(); update(); });

  const homeSearch = $('#search');
  const homeSearchResults = $('#homeSearchResults');
  const renderHomeSearch = async (value) => {
    const q = value.trim();
    if(!homeSearchResults) return;
    if(!q){
      homeSearchResults.hidden=true;
      homeSearch?.setAttribute('aria-expanded','false');
      $('#noResult').hidden=true;
      groupEls.forEach(g=>{g.hidden=false;g.querySelectorAll('.chip').forEach(c=>c.hidden=false);});
      return;
    }
    if(!window.BDTripSearch){
      homeSearchResults.hidden=false;
      homeSearchResults.innerHTML='<div class="home-search-empty">Search engine লোড হচ্ছে…</div>';
      return;
    }
    homeSearchResults.hidden=false;
    homeSearchResults.innerHTML='<div class="home-search-empty">খুঁজছি…</div>';
    homeSearch.setAttribute('aria-expanded','true');
    try{
      const items=await window.BDTripSearch.query(q);
      if(!items.length){
        homeSearchResults.innerHTML='<div class="home-search-empty"><b>কোনো ফলাফল পাওয়া যায়নি</b><small>জেলা, tourist place, খাবার বা division-এর নাম দিয়ে চেষ্টা করুন</small></div>';
        $('#noResult').hidden=true;
        return;
      }
      homeSearchResults.innerHTML=items.map(item=>{
        const id=item.district.id;
        return '<button type="button" class="home-search-result" data-id="'+id+'"><span class="hsr-icon">'+(item.type==='place'?'🏛':item.type==='food'?'🍛':item.type==='division'?'🗺':item.type==='guide'?'📖':'📍')+'</span><span><b>'+escapeHtml(item.title)+'</b><small>'+escapeHtml(item.label)+' · '+escapeHtml(item.subtitle)+'</small></span><span class="hsr-arrow">›</span></button>';
      }).join('');
      homeSearchResults.querySelectorAll('[data-id]').forEach(btn=>btn.addEventListener('click',()=>{
        const id=Number(btn.dataset.id);
        state.cur=id; window.BDTripCurrentDistrict=id;
        setStatus(id,'v');
        homeSearch.value=byId.get(id)?.bn||'';
        homeSearchResults.hidden=true;
        homeSearch.setAttribute('aria-expanded','false');
        update();
      }));
    }catch(_){
      homeSearchResults.innerHTML='<div class="home-search-empty">Search error — আবার চেষ্টা করুন</div>';
    }
  };
  homeSearch?.addEventListener('input',e=>renderHomeSearch(e.target.value));
  homeSearch?.addEventListener('focus',e=>{if(e.target.value.trim())renderHomeSearch(e.target.value);});
  document.addEventListener('click',e=>{
    if(homeSearchResults && !homeSearchResults.contains(e.target) && e.target!==homeSearch){
      homeSearchResults.hidden=true;
      homeSearch?.setAttribute('aria-expanded','false');
    }
  });

  // ---------- controls ----------
  const themesEl = $('#themes');
  THEMES.forEach((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme';
    b.title = t.name;
    b.setAttribute('role', 'radio');
    b.style.background = t.v;
    b.style.setProperty('--tw', t.w);
    b.addEventListener('click', () => { state.theme = i; update(); });
    themesEl.appendChild(b);
  });
  const setMode = (m) => { state.mode = m; update(false); };
  $('#modeV').addEventListener('click', () => setMode('v'));
  $('#modeW').addEventListener('click', () => setMode('w'));

  // ---------- local profile photo ----------
  const PROFILE_DB='bdtrip_profile_v1';
  let profileDB=null;
  const openProfileDB=()=>new Promise((resolve,reject)=>{if(profileDB)return resolve(profileDB);const q=indexedDB.open(PROFILE_DB,1);q.onupgradeneeded=()=>q.result.createObjectStore('profile',{keyPath:'id'});q.onsuccess=()=>{profileDB=q.result;resolve(profileDB)};q.onerror=()=>reject(q.error)});
  const getProfilePhoto=()=>new Promise(async(resolve,reject)=>{try{const db=await openProfileDB();const q=db.transaction('profile','readonly').objectStore('profile').get('photo');q.onsuccess=()=>resolve(q.result?.blob||null);q.onerror=()=>reject(q.error)}catch(e){reject(e)}});
  const saveProfilePhoto=blob=>new Promise(async(resolve,reject)=>{try{const db=await openProfileDB();const q=db.transaction('profile','readwrite').objectStore('profile').put({id:'photo',blob});q.onsuccess=()=>resolve();q.onerror=()=>reject(q.error)}catch(e){reject(e)}});
  const removeProfilePhoto=()=>new Promise(async(resolve,reject)=>{try{const db=await openProfileDB();const q=db.transaction('profile','readwrite').objectStore('profile').delete('photo');q.onsuccess=()=>resolve();q.onerror=()=>reject(q.error)}catch(e){reject(e)}});
  const resizeProfile=()=>new Promise((resolve,reject)=>{const f=$('#profilePhotoInput')?.files?.[0];if(!f)return reject(new Error('no-file'));const im=new Image();im.onload=()=>{const s=Math.min(1,480/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);cv.toBlob(b=>resolve(b),'image/jpeg',.82)};im.onerror=reject;im.src=URL.createObjectURL(f)});
  const renderProfilePhoto=async()=>{try{const blob=await getProfilePhoto();const av=$('#profileAvatar');const mapAv=$('#mapProfileAvatar');if(!av)return;if(blob){const old=av.dataset.url;if(old)URL.revokeObjectURL(old);const url=URL.createObjectURL(blob);av.dataset.url=url;av.innerHTML='<img alt="আপনার প্রোফাইল ছবি" src="'+url+'">';if(mapAv){mapAv.hidden=false;mapAv.style.backgroundImage='url("'+url+'")';mapAv.setAttribute('aria-label','আপনার প্রোফাইল ছবি')}$('#profilePhotoRemove').hidden=false}else{av.innerHTML='<span>♙</span>';if(mapAv){mapAv.hidden=true;mapAv.style.backgroundImage='none';mapAv.removeAttribute('aria-label')}$('#profilePhotoRemove').hidden=true}}catch(_){}}; 
  $('#profilePhotoBtn')?.addEventListener('click',()=>$('#profilePhotoInput').click());
  $('#profilePhotoInput')?.addEventListener('change',async()=>{try{const blob=await resizeProfile();await saveProfilePhoto(blob);await renderProfilePhoto();toast('আপনার ছবি এই ডিভাইসে সেভ হয়েছে।')}catch(_){toast('ছবি যোগ করা যায়নি।')}}); 
  $('#profilePhotoRemove')?.addEventListener('click',async()=>{await removeProfilePhoto();await renderProfilePhoto();toast('প্রোফাইল ছবি সরানো হয়েছে।')});
  renderProfilePhoto();

  $('#nameInput').value = state.name;
  $('#nameInput').addEventListener('input', (e) => { state.name = e.target.value.trim(); update(false); });
  $('#labelToggle').checked = state.labels;
  $('#labelToggle').addEventListener('change', (e) => { state.labels = e.target.checked; update(false); });

  const titleText = () => (state.name ? `${state.name}-এর বাংলাদেশ` : 'আমার বাংলাদেশ');

  // ---------- guide ----------
  function renderGuide() {
    const box = $('#guideCard');
    if (state.cur == null) { box.innerHTML = '<p class="placeholder">একটি জেলা বেছে নিন, এখানে তার গাইড দেখাবে।</p>'; return; }
    const d = byId.get(state.cur), info = INFO[d.en] || {}, st = statusOf(d.id);
    const badge = st === 'v' ? '<span class="badge v">✓ ঘুরেছি</span>' : st === 'w' ? '<span class="badge w">★ ঘুরতে চাই</span>' : '<span class="badge n">এখনো বাছাই হয়নি</span>';
    const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(d.bn + ' জেলা, বাংলাদেশ');
    box.innerHTML = `
      <div class="g-title"><div><h3>${d.bn}</h3><small>${divName(d.div)} বিভাগ · ${d.en}</small></div>${badge}</div>
      <div class="g-actions">
        <button type="button" data-st="v" class="${st === 'v' ? 'on' : ''}">ঘুরেছি</button>
        <button type="button" data-st="w" class="${st === 'w' ? 'on' : ''}">ঘুরতে চাই</button>
        <button type="button" data-st="">মুছুন</button>
        <a href="${maps}" target="_blank" rel="noopener">Google Maps এ দেখুন</a>
      </div>
      <div class="g-sec"><h4>ঘুরে দেখার জায়গা <span class="info-count">${bn((info.a || []).length)}টি</span></h4><ul>${(info.a || ['স্থানীয় পর্যটন স্পটের তথ্য শিগগির যোগ হবে']).map((x) => `<li>${x}</li>`).join('')}</ul></div>
      <div class="g-sec"><h4>ঘোরার সেরা সময়</h4><p>${info.s || 'অক্টোবর–মার্চ'}</p></div>
      <div class="g-sec"><h4>স্থানীয় খাবার / পণ্য</h4><p>${info.f || 'স্থানীয় খাবার ও পণ্য সম্পর্কে যাত্রার আগে জেলা-ভিত্তিক সরকারি তথ্য যাচাই করুন।'}</p></div>
      <div class="g-sec"><h4>পূর্ণ জেলা গাইড</h4><p><a class="btn" href="/district/${d.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}/">এই জেলার SEO গাইড দেখুন ↗</a></p></div><div class="g-sec"><h4>তথ্যসূত্র</h4><div class="source-list">${(info.src || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a>`).join('') || '<span>সরকারি জেলা/পর্যটন পোর্টাল যাচাই করুন।</span>'}</div></div>`;
    box.querySelectorAll('[data-st]').forEach((b) =>
      b.addEventListener('click', () => { setStatus(d.id, b.dataset.st || null); update(); }));
  }

  // ---------- render ----------
  function update(full = true) {
    const t = THEMES[state.theme];
    const card = $('#mapCard').style;
    card.setProperty('--mapbg', t.bg);
    card.setProperty('--v', t.v);
    card.setProperty('--w', t.w);
    card.setProperty('--empty', t.empty);
    card.setProperty('--hover', t.hover);
    card.setProperty('--ink', t.ink || '#11302f');
    card.setProperty('--mut', t.mut || '#62706d');
    card.color = t.ink || '';
    document.documentElement.style.setProperty('--v', t.pageV || t.v);
    document.documentElement.style.setProperty('--w', t.w);

    [...themesEl.children].forEach((b, i) => b.setAttribute('aria-checked', i === state.theme));
    $('#modeV').classList.toggle('active', state.mode === 'v');
    $('#modeW').classList.toggle('active', state.mode === 'w');
    $('#modeV').setAttribute('aria-checked', state.mode === 'v');
    $('#modeW').setAttribute('aria-checked', state.mode === 'w');

    const n = state.v.size, wn = state.w.size;
    chipEls.forEach((c, id) => {
      const st = statusOf(id);
      c.classList.toggle('on-v', st === 'v');
      c.classList.toggle('on-w', st === 'w');
      c.classList.toggle('cur', id === state.cur);
    });
    pathEls.forEach((p, id) => {
      const st = statusOf(id);
      p.classList.toggle('v', st === 'v');
      p.classList.toggle('w', st === 'w');
      p.classList.toggle('cur', id === state.cur);
    });
    groupEls.forEach((g) => {
      const c = g._list.filter((d) => state.v.has(d.id)).length;
      g.querySelector('.gc').textContent = `${bn(c)}/${bn(g._list.length)}`;
      g.querySelector('.g-all').textContent = c === g._list.length ? 'সব মুছুন' : 'সব ঘুরেছি';
    });

    labelG.textContent = '';
    if (state.labels) {
      [...state.v, ...state.w].forEach((id) => {
        const d = byId.get(id);
        const tx = document.createElementNS(NS, 'text');
        tx.setAttribute('x', d.c[0]);
        tx.setAttribute('y', d.c[1] + 2.5);
        tx.textContent = d.bn;
        labelG.appendChild(tx);
      });
    }

    const pct = Math.round((n / total) * 100);
    $('#countPill').textContent = `${bn(n)}/${bn(total)}`;
    $('#bigCount').textContent = bn(n);
    $('#mapTitle').textContent = titleText();
    $('#bar').style.width = pct + '%';
    $('#pctText').textContent = `${bn(n)}টি জেলা ভ্রমণ · ${bn(pct)}% সম্পন্ন`;
    $('#legV').textContent = bn(n);
    $('#legW').textContent = bn(wn);
    const full8 = D.divisions.filter((v) => D.districts.filter((d) => d.div === v.id).every((d) => state.v.has(d.id)));
    $('#divText').textContent = full8.length ? `${bn(full8.length)}টি বিভাগ সম্পূর্ণ` : '';

    // hero score
    $('#heroCount').textContent = bn(n);
    $('#heroRing').style.setProperty('--p', (n / total) * 100);
    let li = 0;
    LEVELS.forEach((l, i) => { if (n >= l[0]) li = i; });
    $('#heroLevel').textContent = LEVELS[li][1];
    const nx = LEVELS[li + 1];
    $('#heroNext').textContent = nx ? `আর ${bn(nx[0] - n)}টি জেলা গেলেই “${nx[1]}”` : 'সব ৬৪ জেলা ঘোরা শেষ, অভিনন্দন!';

    // Premium travel progress dashboard
    const full8Dash = D.divisions.filter((v) => D.districts.filter((d) => d.div === v.id).every((d) => state.v.has(d.id)));
    const divCounts = D.divisions.map(v => ({v, c:D.districts.filter(d=>d.div===v.id && state.v.has(d.id)).length, total:D.districts.filter(d=>d.div===v.id).length})).sort((a,b)=>b.c-a.c);
    const topDiv = divCounts[0];
    const nextDiv = divCounts.find(x=>x.c>0 && x.c<x.total) || divCounts.find(x=>x.c===0);
    const dashCount=$('#dashCount'), dashPercent=$('#dashPercent'), dashBar=$('#dashBar'), dashDivisions=$('#dashDivisions'), dashTop=$('#dashTopDivision'), dashTopCount=$('#dashTopCount'), dashNext=$('#dashNextGoal'), dashNextText=$('#dashNextText');
    if(dashCount)dashCount.textContent=bn(n);
    if(dashPercent)dashPercent.textContent=bn(pct)+'% বাংলাদেশ ঘোরা হয়েছে';
    if(dashBar)dashBar.style.width=pct+'%';
    if(dashDivisions)dashDivisions.textContent=bn(full8Dash.length)+' / ৮';
    if(dashTop)dashTop.textContent=topDiv&&topDiv.c?divName(topDiv.v.id):'—';
    if(dashTopCount)dashTopCount.textContent=topDiv&&topDiv.c?bn(topDiv.c)+'টি জেলা':'এখনও শুরু হয়নি';
    if(dashNext){
      if(n===64){dashNext.textContent='বাংলাদেশ জয়ী 🏆';dashNextText.textContent='সব ৬৪ জেলা ঘোরা সম্পূর্ণ!';}
      else if(nextDiv){const left=nextDiv.total-nextDiv.c;dashNext.textContent=bn(left)+'টি জেলা বাকি';dashNextText.textContent=divName(nextDiv.v.id)+' বিভাগ সম্পূর্ণ করুন';}
      else {dashNext.textContent='পরবর্তী জেলা';dashNextText.textContent='আপনার journey চালিয়ে যান';}
    }
    renderAchievements();
    // guide + stats + wishlist (only when selection changed)
    renderGuide();
    $('#divStats').innerHTML = DIV_ORDER.map((did) => {
      const l = D.districts.filter((d) => d.div === did), c = l.filter((d) => state.v.has(d.id)).length;
      return `<div class="d-row"><div><span>${divName(did)}</span><span>${bn(c)}/${bn(l.length)}</span></div><i><b style="width:${(c / l.length) * 100}%"></b></i></div>`;
    }).join('');
    const wl = $('#wishList');
    $('#wishCount').textContent = wn ? `${bn(wn)}টি জেলা` : '';
    wl.innerHTML = wn ? '' : '<span class="empty">“ঘুরতে চাই” মোডে জেলা বেছে নিলে এখানে জমা হবে।</span>';
    state.w.forEach((id) => {
      const d = byId.get(id);
      const tag = document.createElement('span');
      tag.className = 'wtag';
      tag.innerHTML = `${d.bn}<button type="button" aria-label="${d.bn} মুছুন">×</button>`;
      tag.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') setStatus(id, null); else { state.cur = id; window.BDTripCurrentDistrict = id; }
        update();
      });
      wl.appendChild(tag);
    });

    $('#waBtn').href = 'https://wa.me/?text=' + encodeURIComponent(shareText());
    save();
  }

  // ---------- export ----------
  async function render(preset = 'portrait') {
    const PRESETS = { portrait:{W:1080,H:1350}, story:{W:1080,H:1920}, square:{W:1080,H:1080}, a3:{W:1191,H:1684} };
    const { W, H } = PRESETS[preset] || PRESETS.portrait;
    const posterOnly = preset === "a3";
    try {
      await Promise.all([
        document.fonts.load('800 60px "Noto Sans Bengali"', 'বাংলাদেশ'),
        document.fonts.load('600 24px "Hind Siliguri"', 'জেলা'),
        document.fonts.load('800 28px "Poppins"', 'BDTrip')
      ]);
    } catch (e) {}

    const t = THEMES[state.theme];
    const ink = t.ink || '#11302f', mut = t.mut || '#62706d';
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');

    // Premium warm paper background
    const bg = c.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#fffdf5'); bg.addColorStop(.58,t.bg || '#f3efe3'); bg.addColorStop(1,'#eee7d6');
    c.fillStyle=bg; c.fillRect(0,0,W,H);

    // Decorative soft travel atmosphere
    const glow=c.createRadialGradient(W*.86,H*.08,0,W*.86,H*.08,W*.28);
    glow.addColorStop(0,'#ffb70345'); glow.addColorStop(1,'#ffb70300');
    c.fillStyle=glow; c.fillRect(0,0,W,H);
    c.strokeStyle='#c9b98b25'; c.lineWidth=2;
    for(let r=35;r<190;r+=34){ c.beginPath(); c.arc(W-10,10,r,Math.PI*.1,Math.PI*.95); c.stroke(); }
    c.strokeStyle='#0f7a5a18';
    for(let r=30;r<150;r+=32){ c.beginPath(); c.arc(10,H-10,r,-Math.PI*.15,Math.PI*.45); c.stroke(); }

    // Header
    c.textAlign='left';
    c.fillStyle='#52706a'; c.font='600 22px "Hind Siliguri", sans-serif';
    if(!posterOnly) c.fillText('BDTrip · আমার ভ্রমণ মানচিত্র',70,76);

    let title=titleText(), fs=62;
    c.fillStyle=ink; c.font=`800 ${fs}px "Noto Sans Bengali", sans-serif`;
    while(c.measureText(title).width>620 && fs>30){fs-=2;c.font=`800 ${fs}px "Noto Sans Bengali", sans-serif`;}
    const hasProfile = !!document.querySelector('#mapProfileAvatar:not([hidden])');
    if(!posterOnly) c.fillText(title,hasProfile ? 190 : 70,148);

    // Profile photo from IndexedDB
    try{
      const blob=await getProfilePhoto();
      if(blob&&!posterOnly){
        const url=URL.createObjectURL(blob);
        await new Promise(resolve=>{
          const im=new Image();
          im.onload=()=>{c.save();c.save();
          c.shadowColor='#0b3d3a38'; c.shadowBlur=18; c.shadowOffsetY=7;
          c.fillStyle='#ffb703'; c.beginPath(); c.arc(95,123,68,0,Math.PI*2); c.fill();
          c.shadowColor='transparent'; c.shadowBlur=0; c.shadowOffsetY=0;
          c.beginPath(); c.arc(95,123,60,0,Math.PI*2); c.clip(); c.drawImage(im,35,63,120,120); c.restore();URL.revokeObjectURL(url);resolve();};
          im.onerror=()=>{URL.revokeObjectURL(url);resolve();}; im.src=url;
        });
      }
    }catch(_){}

    // Score badge
    const n=state.v.size, wn=state.w.size, pct=n/total;
    if(!posterOnly){
      const bx=W-205, by=52;
      c.fillStyle='#0b3d3a'; c.beginPath(); c.roundRect(bx,by,135,88,22); c.fill();
      c.textAlign='center'; c.fillStyle='#ffcf3a'; c.font='800 54px "Noto Sans Bengali", sans-serif'; c.fillText(bn(n),bx+68,112);
      c.fillStyle='#d4e8e2'; c.font='500 20px "Hind Siliguri", sans-serif'; c.fillText('/৬৪',bx+68,135);
    }

    // Map
    const ax=55, ay=190, aw=W-110, ah=Math.max(430,H*.59);
    const sc=Math.min(aw/D.w,ah/D.h);
    const ox=ax+(aw-D.w*sc)/2, oy=ay+(ah-D.h*sc)/2;
    c.save(); c.translate(ox,oy); c.scale(sc,sc);
    c.lineJoin='round'; c.lineWidth=(1/sc)*1.45; c.strokeStyle='#f8f4e8';
    D.districts.forEach(d=>{
      const p=new Path2D(d.d), st=statusOf(d.id);
      c.fillStyle=st==='v'?t.v:st==='w'?t.w:t.empty;
      c.fill(p); c.stroke(p);
    });
    c.restore();

    if(state.labels){
      c.textAlign='center'; c.font='600 15px "Noto Sans Bengali", sans-serif';
      c.lineWidth=3; c.lineJoin='round';
      [...state.v,...state.w].forEach(id=>{
        const d=byId.get(id), x=ox+d.c[0]*sc, y=oy+d.c[1]*sc+5;
        c.strokeStyle='rgba(0,0,0,.45)'; c.strokeText(d.bn,x,y);
        c.fillStyle='#fff'; c.fillText(d.bn,x,y);
      });
    }

    // Progress
    const bx=70,bw=W-140,by=H-225;
    if(!posterOnly){
      c.fillStyle='#0b3d3a18'; c.beginPath(); c.roundRect(bx,by,bw,12,6); c.fill();
      if(n){c.fillStyle='#0f7a5a';c.beginPath();c.roundRect(bx,by,Math.max(14,bw*pct),12,6);c.fill();}
      c.textAlign='left';c.fillStyle=mut;c.font='600 24px "Hind Siliguri", sans-serif';
      c.fillText(`${bn(n)}টি জেলা ভ্রমণ · ${bn(Math.round(pct*100))}% সম্পন্ন`,70,H-175);
    }

    // Legend pills
    if(!posterOnly){
      c.font='600 23px "Hind Siliguri", sans-serif';
      const l1=`ঘুরেছি ${bn(n)}`,l2=`ঘুরতে চাই ${bn(wn)}`;
      const totalW=c.measureText(l1).width+c.measureText(l2).width+105;
      let lx=(W-totalW)/2, ly=H-128;
      c.fillStyle='#ffffffc8';c.beginPath();c.roundRect(lx-14,ly-32,totalW+28,48,24);c.fill();
      c.fillStyle=t.v;c.beginPath();c.arc(lx+5,ly-8,8,0,Math.PI*2);c.fill();
      c.fillStyle=ink;c.fillText(l1,lx+22,ly);
      lx+=c.measureText(l1).width+58;
      c.fillStyle=t.w;c.beginPath();c.arc(lx+5,ly-8,8,0,Math.PI*2);c.fill();
      c.fillStyle=ink;c.fillText(l2,lx+22,ly);
    }else{
      c.textAlign='center';c.fillStyle=ink;c.font='800 52px "Noto Sans Bengali", sans-serif';
      c.fillText(`${bn(n)} / ${bn(total)} জেলা`,W/2,H-110);
    }

    // BDTrip footer
    if(!posterOnly){
      c.textAlign='center';c.font='800 32px "Poppins", sans-serif';
      c.fillStyle=ink;c.fillText('BD',W/2-28,H-48);c.fillStyle=t.v;c.fillText('Trip',W/2+18,H-48);
    }
    return cv;
  }

  function download(url, name) {
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (el.hidden = true), 3200);
  }

  document.querySelectorAll('.dl-btns .btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const fmt = btn.dataset.fmt, label = btn.textContent;
      btn.disabled = true; btn.textContent = 'তৈরি হচ্ছে...';
      try {
        const cv = await render();
        const base = 'bdtrip-map';
        if (fmt === 'png') download(cv.toDataURL('image/png'), base + '.png');
        else if (fmt === 'jpg') download(cv.toDataURL('image/jpeg', 0.93), base + '.jpg');
        else {
          const loadJsPDF = () => new Promise((resolve, reject) => {
            if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
            const existing = document.querySelector('script[data-jspdf-loader]');
            if (existing) {
              existing.addEventListener('load', () => resolve(window.jspdf && window.jspdf.jsPDF), { once:true });
              existing.addEventListener('error', reject, { once:true });
              return;
            }
            const s = document.createElement('script');
            s.src = 'vendor/jspdf.umd.min.js';
            s.async = true;
            s.dataset.jspdfLoader = 'true';
            s.onload = () => window.jspdf && window.jspdf.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('PDF লাইব্রেরি লোড হয়নি।'));
            s.onerror = () => reject(new Error('PDF লাইব্রেরি লোড করা যায়নি।'));
            document.head.appendChild(s);
          });
          const J = await loadJsPDF();
          const pdf = new J({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const ph = 210 * (H / W);
          pdf.addImage(cv.toDataURL('image/jpeg', 0.95), 'JPEG', 0, (297 - ph) / 2, 210, ph);
          pdf.save(base + '.pdf');
        }
      } catch (err) {
        toast(err.message || 'ডাউনলোড করা যায়নি।');
      } finally {
        btn.disabled = false; btn.textContent = label;
      }
    });
  });

  document.querySelectorAll('.export-presets [data-preset]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const preset = btn.dataset.preset, label = btn.textContent;
      btn.disabled = true; btn.textContent = 'তৈরি হচ্ছে...';
      try {
        const cv = await render(preset);
        if (preset === 'a3') {
          const loadJsPDF = () => new Promise((resolve, reject) => {
            if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
            const s = document.createElement('script'); s.src='vendor/jspdf.umd.min.js'; s.async=true;
            s.onload=()=>window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('PDF লাইব্রেরি লোড হয়নি।'));
            s.onerror=reject; document.head.appendChild(s);
          });
          const J = await loadJsPDF();
          const pdf = new J({orientation:'portrait', unit:'mm', format:'a3'});
          const mmH = 297 * (1684 / 1191);
          pdf.addImage(cv.toDataURL('image/jpeg', .95), 'JPEG', 0, (420-mmH)/2, 297, mmH);
          pdf.save('bdtrip-a3-poster.pdf');
        } else download(cv.toDataURL('image/png'), 'bdtrip-' + preset + '.png');
      } catch (err) { toast(err.message || 'এক্সপোর্ট করা যায়নি।'); }
      finally { btn.disabled=false; btn.textContent=label; }
    });
  });

  // ---------- share ----------
  const shareUrl = () => {
    const base = location.origin + '/journey/?m=' + encodeURIComponent(encodeShare());
    return state.name ? base + '&name=' + encodeURIComponent(state.name) : base;
  };
  const showSharedComparison = () => {
    if (!sharedState) return;
    const common = [...sharedState.v].filter(id => state.v.has(id)).length;
    const missing = [...sharedState.v].filter(id => !state.v.has(id)).length;
    const el = $('#shareCompare');
    $('#sharedVisited').textContent = bn(sharedState.v.size);
    $('#sharedCommon').textContent = bn(common);
    $('#sharedMissing').textContent = bn(missing);
    $('#shareCompareText').textContent = 'আপনার সাথে মিল ' + bn(common) + 'টি জেলা। আপনার বন্ধু যেসব জেলা ঘুরেছেন কিন্তু আপনি যাননি: ' + bn(missing) + 'টি।';
    el.hidden = false;
  };
  $('#shareCompareClose')?.addEventListener('click', () => { $('#shareCompare').hidden = true; });
  $('#sharedStartBtn')?.addEventListener('click', () => { $('#shareCompare').hidden = true; document.querySelector('#tool')?.scrollIntoView({behavior:'smooth'}); });
  const copyShareLink = async () => {
    const ok = await copyText(shareUrl());
    toast(ok ? 'শেয়ার লিংক কপি হয়েছে' : shareUrl());
    return ok;
  };
  $('#shareLinkBtn')?.addEventListener('click', async () => {
    const url = shareUrl();
    if (navigator.share) {
      try { await navigator.share({ title:'BDTrip — আমার ভ্রমণ ম্যাপ', text:shareText(), url }); return; } catch (_) {}
    }
    await copyShareLink();
  });
  function shareText() {
    const n = state.v.size, pct = Math.round((n / total) * 100);
    const url = location.protocol.startsWith('http') ? shareUrl() : '';
    return `আমি বাংলাদেশের ${bn(n)}টি জেলা ঘুরেছি (${bn(pct)}%)! তুমি কতটা ঘুরেছ? BDTrip এ নিজের ম্যাপ বানাও ${url}`.trim();
  }
  async function copyText(txt) {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) { return false; }
  }
  $('#copyBtn').addEventListener('click', async () => {
    toast((await copyText(shareText())) ? 'টেক্সট কপি হয়েছে' : 'কপি করা যায়নি');
  });
  $('#shareBtn').addEventListener('click', async () => {
    const btn = $('#shareBtn');
    btn.disabled = true;
    try {
      const cv = await render();
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const file = new File([blob], 'bdtrip-map.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText(), title: 'BDTrip' });
      } else {
        await copyText(shareText());
        toast('টেক্সট কপি হয়েছে। ম্যাপ ডাউনলোড করে শেয়ার করুন।');
      }
    } catch (e) { /* user cancelled */ }
    btn.disabled = false;
  });

  // ---------- Phase 3: journal, achievements, planner ----------
  const JOURNAL_DB = 'bdtrip_journal_v1';
  const JOURNAL_STORE = 'entries';
  const PLAN_STORE = 'bdtrip_plans_v1';
  let journalDB = null;
  const openJournalDB = () => new Promise((resolve,reject) => {
    if (journalDB) return resolve(journalDB);
    const req = indexedDB.open(JOURNAL_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(JOURNAL_STORE, { keyPath:'id' });
    req.onsuccess = () => { journalDB=req.result; resolve(journalDB); };
    req.onerror = () => reject(req.error);
  });
  const journalGet = async (id) => { const db=await openJournalDB(); return new Promise((res,rej)=>{const r=db.transaction(JOURNAL_STORE,'readonly').objectStore(JOURNAL_STORE).get(id);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error);}); };
  const journalPut = async (entry) => { const db=await openJournalDB(); return new Promise((res,rej)=>{const r=db.transaction(JOURNAL_STORE,'readwrite').objectStore(JOURNAL_STORE).put(entry);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);}); };
  const journalAll = async () => { const db=await openJournalDB(); return new Promise((res,rej)=>{const r=db.transaction(JOURNAL_STORE,'readonly').objectStore(JOURNAL_STORE).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);}); };
  const resizeImage = (file,max=1200) => new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);cv.toBlob(b=>resolve(b),'image/jpeg',.82);};im.onerror=reject;im.src=URL.createObjectURL(file);});
  const journalFill = async () => {
    const id=state.cur, d=id!=null?byId.get(id):null;
    $('#journalDistrictTitle').textContent=d?d.bn:'একটি জেলা বেছে নিন';
    $('#journalPhotos').innerHTML='';
    if(!d){$('#journalDate').value='';$('#journalRating').value='0';$('#journalNote').value='';return;}
    try{
      const e=await journalGet(id);
      $('#journalDate').value=e?.date||'';$('#journalRating').value=e?.rating||'0';$('#journalNote').value=e?.note||'';
      (e?.photos||[]).forEach(p=>{const img=document.createElement('img');img.alt=p.name||'জার্নাল ছবি';img.src=URL.createObjectURL(p.blob);$('#journalPhotos').appendChild(img);});
    }catch(_){}
  };
  const renderJournalList = async () => {
    try{const rows=(await journalAll()).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,12);$('#journalCount').textContent=bn(rows.length);$('#journalList').innerHTML=rows.map(e=>{const d=byId.get(e.id);return `<button type="button" class="journal-item" data-jid="${e.id}"><b>${d?.bn||''}</b><span>${e.date||'তারিখ নেই'} · ${e.rating?('★'.repeat(e.rating)):'রেটিং নেই'}</span><small>${(e.note||'').slice(0,90)}</small></button>`;}).join('')||'<p class="placeholder">এখনো কোনো জার্নাল নেই।</p>';$('#journalList').querySelectorAll('[data-jid]').forEach(b=>b.addEventListener('click',()=>{state.cur=+b.dataset.jid;window.BDTripCurrentDistrict=state.cur;update();journalFill();}));}catch(_){}
  };
  $('#journalSave')?.addEventListener('click', async () => {
    if(state.cur==null)return toast('আগে একটি জেলা বেছে নিন।');
    try{
      const files=[...($('#journalPhoto')?.files||[])];
      const photos=[];
      for(const f of files.slice(0,6)){const blob=await resizeImage(f);photos.push({name:f.name,blob});}
      await journalPut({id:state.cur,date:$('#journalDate').value,rating:Number($('#journalRating').value)||0,note:$('#journalNote').value.trim(),photos,updatedAt:Date.now()});
      toast('জার্নাল সেভ হয়েছে — শুধু এই ডিভাইসে।'); renderJournalList();
    }catch(e){toast('সেভ করা যায়নি। ব্রাউজারের IndexedDB/স্টোরেজ অনুমতি দেখুন।');}
  });
  $('#journalClear')?.addEventListener('click',()=>{['journalDate','journalNote'].forEach(id=>$('#'+id).value='');$('#journalRating').value='0';if($('#journalPhoto'))$('#journalPhoto').value='';});
  let lastLevelIndex = -1;
  const levelIndexForCount = (n) => { let idx=0; LEVEL_META.forEach((l,i)=>{if(n>=l[0])idx=i;}); return idx; };
  const celebrateLevelUp = (idx) => {
    const meta=LEVEL_META[idx]; if(!meta)return;
    let el=document.getElementById('levelCelebration');
    if(!el){
      el=document.createElement('div'); el.id='levelCelebration'; el.className='level-celebration';
      el.innerHTML='<div class="level-celebration-card"><span class="celebration-spark">✦</span><div class="celebration-icon"></div><small>TRAVEL LEVEL UP</small><h3></h3><p></p><button type="button">চলুন, আরও ঘুরি! ✦</button></div>';
      document.body.appendChild(el);
      el.addEventListener('click',e=>{if(e.target===el||e.target.closest('button'))el.classList.remove('show');});
    }
    el.querySelector('.celebration-icon').textContent=meta[1];
    el.querySelector('h3').textContent=meta[2];
    el.querySelector('p').textContent=meta[3]+' সম্পন্ন — অভিনন্দন!';
    requestAnimationFrame(()=>el.classList.add('show')); clearTimeout(el._timer); el._timer=setTimeout(()=>el.classList.remove('show'),3600);
  };
  const renderAchievements = () => {
    const grid=$('#achievementGrid'); if(!grid)return; const n=state.v.size; const current=levelIndexForCount(n);
    grid.innerHTML=LEVEL_META.map((l,i)=>{const unlocked=n>=l[0], currentClass=i===current?' current':''; return '<article class="achievement '+(unlocked?'active':'locked')+currentClass+'"><div class="a-icon">'+l[1]+'</div><b>'+l[2]+'</b><small>'+l[3]+'</small></article>';}).join('');
    const badge=$('#levelBadge'); if(badge)badge.textContent=LEVEL_META[current][1]+' '+LEVEL_META[current][2];
    if(lastLevelIndex>=0&&current>lastLevelIndex)celebrateLevelUp(current);
    lastLevelIndex=current;
  };
    const PLAN_KEY='bdtrip_plan_v1';
  let plan={title:'',days:[],budget:{travel:0,hotel:0,food:0,other:0}};
  try{plan=JSON.parse(localStorage.getItem(PLAN_KEY)||'null')||plan;}catch(_){}
  const renderPlan=()=>{$('#plannerTitle').value=plan.title||'';$('#plannerDays').innerHTML=plan.days.map((day,i)=>`<div class="plan-day" data-day="${i}"><div class="plan-day-head"><b>দিন ${bn(i+1)}</b><button type="button" class="remove-day" data-remove="${i}">×</button></div><select class="plan-district" data-plan-district="${i}"><option value="">জেলা বেছে নিন</option>${D.districts.map(d=>`<option value="${d.id}" ${day.district==d.id?'selected':''}>${d.bn}</option>`).join('')}</select><textarea class="plan-note" data-plan-note="${i}" rows="2" placeholder="আজ কী করবেন?">${day.note||''}</textarea></div>`).join('');document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{plan.days.splice(+b.dataset.remove,1);renderPlan();});document.querySelectorAll('[data-plan-district]').forEach(s=>s.onchange=()=>{plan.days[+s.dataset.planDistrict].district=Number(s.value)||null;});document.querySelectorAll('[data-plan-note]').forEach(s=>s.oninput=()=>{plan.days[+s.dataset.planNote].note=s.value;});['travel','hotel','food','other'].forEach(k=>$('#plan'+k[0].toUpperCase()+k.slice(1)).value=plan.budget[k]||'');calcPlanTotal();};
  const calcPlanTotal=()=>{const b=plan.budget;const total=(Number(b.travel)||0)+(Number(b.hotel)||0)+(Number(b.food)||0)+(Number(b.other)||0);$('#planTotal').textContent=money(total);};
  $('#plannerAdd')?.addEventListener('click',()=>{plan.days.push({district:null,note:''});renderPlan();});
  ['travel','hotel','food','other'].forEach(k=>$('#plan'+k[0].toUpperCase()+k.slice(1))?.addEventListener('input',()=>{plan.budget[k]=Number($('#plan'+k[0].toUpperCase()+k.slice(1)).value)||0;calcPlanTotal();}));
  $('#plannerSave')?.addEventListener('click',()=>{try{localStorage.setItem(PLAN_KEY,JSON.stringify(plan));toast('ট্রিপ প্ল্যান সেভ হয়েছে।');}catch(_){toast('প্ল্যান সেভ করা যায়নি।');}});
  $('#plannerReset')?.addEventListener('click',()=>{plan={title:'',days:[],budget:{travel:0,hotel:0,food:0,other:0}};renderPlan();});
  const planShareCode=()=>{const bytes=new TextEncoder().encode(JSON.stringify(plan));let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');};
  const decodePlan=code=>{try{const s=atob(code.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-code.length%4)%4));return JSON.parse(new TextDecoder().decode(Uint8Array.from(s,ch=>ch.charCodeAt(0))));}catch(_){return null;}};
  const sharedPlan=decodePlan(new URLSearchParams(location.search).get('p')||''); if(sharedPlan&&Array.isArray(sharedPlan.days)){plan=sharedPlan;try{localStorage.setItem(PLAN_KEY,JSON.stringify(plan));}catch(_){} }
  $('#plannerShare')?.addEventListener('click',async()=>{const code=planShareCode();const url=location.origin+'/planner/?p='+code;await copyText(url);toast('ট্রিপ প্ল্যান লিংক কপি হয়েছে।');});

  // ---------- budget ----------
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  function calcBudget() {
    const people = Math.max(1, num('#b_people')), days = Math.max(1, num('#b_days'));
    const nights = Math.max(0, days - 1);
    let sum = num('#b_travel') * people + num('#b_hotel') * num('#b_rooms') * nights + num('#b_food') * people * days + num('#b_other');
    if ($('#b_buf').checked) sum *= 1.1;
    $('#o_total').textContent = money(sum);
    $('#o_pp').textContent = money(sum / people);
    $('#o_pd').textContent = money(sum / days);
  }
  document.querySelectorAll('.budget input').forEach((i) => i.addEventListener('input', calcBudget));
  calcBudget();

  // ---------- checklist ----------
  let done = {};
  try { done = JSON.parse(localStorage.getItem(CHK) || '{}'); } catch (e) {}
  const cl = $('#checkList');
  CHECKS.forEach((txt, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<label><input type="checkbox"><span>${txt}</span></label>`;
    const cb = li.querySelector('input');
    cb.checked = !!done[i];
    cb.addEventListener('change', () => {
      done[i] = cb.checked;
      try { localStorage.setItem(CHK, JSON.stringify(done)); } catch (e) {}
    });
    cl.appendChild(li);
  });

  $('#yr').textContent = new Date().getFullYear();
  update();
  renderJournalList(); journalFill(); renderAchievements(); renderPlan();
  if (sharedState) setTimeout(showSharedComparison, 250);
})();