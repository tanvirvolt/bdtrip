/* BDTrip journal. Self-contained: needs only /data.js (window.BD_DATA). Entries live in this browser's IndexedDB. */
(() => {
  'use strict';
  const D = window.BD_DATA;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);
  const MAX_PHOTOS = 8, MAX_NOTE = 500, MAX_SIDE = 1280;
  const MAP_KEY = 'bdtrip_v2'; // the main map's saved state, used for the "mark as visited" sync
  const DIV_ORDER = [6, 1, 5, 4, 3, 2, 7, 8];
  const TAGS = ['প্রকৃতি', 'ইতিহাস', 'খাবার', 'সমুদ্র', 'পাহাড়', 'নদী', 'পরিবার', 'বন্ধু', 'একা', 'অ্যাডভেঞ্চার', 'ফটোগ্রাফি', 'ধর্মীয় স্থান'];
  const RATE_TXT = ['রেটিং দেননি', '১/৫ · মোটামুটি', '২/৫ · চলনসই', '৩/৫ · ভালো', '৪/৫ · খুব ভালো', '৫/৫ · অসাধারণ'];

  const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  const byId = new Map(D.districts.map((d) => [d.id, d]));
  const divName = (id) => D.divisions.find((x) => x.id === id).bn;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const fmtDate = (iso) => { try { return new Date(iso + 'T00:00:00').toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return iso; } };
  const newId = () => 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---------- IndexedDB ----------
  let db = null;
  const openDB = () => new Promise((res, rej) => {
    const r = indexedDB.open('bdtrip-journal', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('entries', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const store = (mode) => db.transaction('entries', mode).objectStore('entries');
  const rp = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const dbAll = () => rp(store('readonly').getAll());
  const dbPut = (e) => rp(store('readwrite').put(e));
  const dbDel = (id) => rp(store('readwrite').delete(id));

  // ---------- state ----------
  let entries = [];
  let curId = null;
  let rating = 0;
  let tags = new Set();
  let photos = []; // { blob, url }
  let listUrls = [];

  const sel = $('#jrDistrict'), dateEl = $('#jrDate'), spendEl = $('#jrSpend'), noteEl = $('#jrNote');
  const starsEl = $('#jrStars'), tagsEl = $('#jrTags'), photosEl = $('#jrPhotos'), listEl = $('#jrList');

  // ---------- toast ----------
  let toastT;
  function toast(msg) {
    const t = $('#jrToast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.hidden = true), 3200);
  }

  // ---------- district select + map ----------
  DIV_ORDER.forEach((did) => {
    const g = document.createElement('optgroup');
    g.label = divName(did) + ' বিভাগ';
    D.districts.filter((d) => d.div === did).sort((a, b) => a.bn.localeCompare(b.bn, 'bn')).forEach((d) => {
      const o = document.createElement('option');
      o.value = d.id; o.textContent = d.bn;
      g.appendChild(o);
    });
    sel.appendChild(g);
  });

  const svg = $('#jrMap');
  svg.setAttribute('viewBox', `0 0 ${D.w} ${D.h}`);
  const pathEls = new Map();
  D.districts.forEach((d) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d.d);
    p.setAttribute('role', 'button');
    p.setAttribute('tabindex', '0');
    p.setAttribute('aria-label', d.bn);
    const t = document.createElementNS(NS, 'title');
    t.textContent = d.bn;
    p.appendChild(t);
    p.addEventListener('click', () => chooseDistrict(d.id));
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseDistrict(d.id); } });
    pathEls.set(d.id, p);
    svg.appendChild(p);
  });

  function chooseDistrict(id) {
    sel.value = String(id);
    onDistrictChange();
    if (window.innerWidth <= 900) $('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onDistrictChange() {
    const id = +sel.value;
    const n = id ? entries.filter((e) => e.did === id).length : 0;
    const hint = $('#jrHint');
    hint.textContent = '';
    if (n && !curId) {
      const b = el('b', null, bn(n) + 'টি');
      hint.append('এই জেলায় আপনার ', b, ' এন্ট্রি আছে। তালিকা থেকে দেখতে বা সম্পাদনা করতে পারেন।');
    }
    renderMap();
  }

  function renderMap() {
    const has = new Set(entries.map((e) => e.did));
    const cur = +sel.value;
    pathEls.forEach((p, id) => {
      p.classList.toggle('has', has.has(id));
      p.classList.toggle('sel', id === cur);
      p.setAttribute('aria-pressed', id === cur ? 'true' : 'false');
    });
    const curEl = pathEls.get(cur);
    if (curEl) svg.appendChild(curEl); // bring the selected outline to the front
  }

  // ---------- stars + tags ----------
  const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';
  for (let i = 1; i <= 5; i++) {
    const b = el('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', RATE_TXT[i]);
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}" stroke-linejoin="round"/></svg>`;
    b.addEventListener('click', () => setRating(rating === i ? 0 : i));
    starsEl.appendChild(b);
  }
  function setRating(n) {
    rating = n;
    [...starsEl.children].forEach((b, i) => {
      b.classList.toggle('on', i < n);
      b.setAttribute('aria-checked', i + 1 === n ? 'true' : 'false');
    });
    $('#jrRateTxt').textContent = RATE_TXT[n];
  }

  TAGS.forEach((t) => {
    const b = el('button', 'tag', t);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      tags.has(t) ? tags.delete(t) : tags.add(t);
      b.setAttribute('aria-pressed', tags.has(t) ? 'true' : 'false');
    });
    tagsEl.appendChild(b);
  });
  function syncTags() {
    [...tagsEl.children].forEach((b) => b.setAttribute('aria-pressed', tags.has(b.textContent) ? 'true' : 'false'));
  }
  // tags that came from a backup but are not in the preset list stay visible as extra chips
  function ensureTagChips() {
    tags.forEach((t) => {
      if (![...tagsEl.children].some((b) => b.textContent === t)) {
        const b = el('button', 'tag', t);
        b.type = 'button';
        b.addEventListener('click', () => { tags.has(t) ? tags.delete(t) : tags.add(t); b.setAttribute('aria-pressed', tags.has(t) ? 'true' : 'false'); });
        tagsEl.appendChild(b);
      }
    });
    syncTags();
  }

  noteEl.addEventListener('input', () => { $('#jrCount').textContent = `${bn(noteEl.value.length)}/${bn(MAX_NOTE)}`; });

  // ---------- photos ----------
  const loadImg = (file) => new Promise((res, rej) => {
    const u = URL.createObjectURL(file), i = new Image();
    i.onload = () => { URL.revokeObjectURL(u); res(i); };
    i.onerror = () => { URL.revokeObjectURL(u); rej(new Error('load')); };
    i.src = u;
  });
  async function compress(file) {
    if (!/^image\//.test(file.type)) throw new Error('type');
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { bmp = await loadImg(file); }
    const w0 = bmp.width, h0 = bmp.height, s = Math.min(1, MAX_SIDE / Math.max(w0, h0));
    const c = document.createElement('canvas');
    c.width = Math.round(w0 * s); c.height = Math.round(h0 * s);
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(bmp, 0, 0, c.width, c.height);
    if (bmp.close) bmp.close();
    return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('enc'))), 'image/jpeg', 0.82));
  }
  async function addFiles(files) {
    const list = [...files].filter((f) => /^image\//.test(f.type));
    if (!list.length) { toast('শুধু ছবির ফাইল বেছে নিন'); return; }
    let failed = 0, skipped = 0;
    for (const f of list) {
      if (photos.length >= MAX_PHOTOS) { skipped++; continue; }
      try {
        const blob = await compress(f);
        photos.push({ blob, url: URL.createObjectURL(blob) });
      } catch (e) { failed++; }
    }
    renderPhotos();
    if (skipped) toast(`সর্বোচ্চ ${bn(MAX_PHOTOS)}টি ছবি রাখা যায়`);
    else if (failed) toast(`${bn(failed)}টি ছবি পড়া যায়নি (HEIC হলে JPG/PNG করে দিন)`);
  }
  function renderPhotos() {
    photosEl.textContent = '';
    photos.forEach((p, i) => {
      const w = el('div', 'ph');
      const img = el('img');
      img.src = p.url; img.alt = `ছবি ${bn(i + 1)}`;
      const x = el('button', null, '×');
      x.type = 'button'; x.setAttribute('aria-label', `ছবি ${bn(i + 1)} সরান`);
      x.addEventListener('click', () => { URL.revokeObjectURL(p.url); photos.splice(i, 1); renderPhotos(); });
      w.append(img, x);
      photosEl.appendChild(w);
    });
    $('#jrPhotoCount').textContent = `(${bn(photos.length)}/${bn(MAX_PHOTOS)})`;
  }
  const fileInput = $('#jrPhoto'), drop = $('#jrDrop');
  fileInput.addEventListener('change', async () => { await addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });

  // ---------- form state ----------
  function clearPhotos() { photos.forEach((p) => URL.revokeObjectURL(p.url)); photos = []; }
  function resetForm(did) {
    curId = null;
    clearPhotos(); renderPhotos();
    tags = new Set(); ensureTagChips();
    setRating(0);
    sel.value = did ? String(did) : '';
    dateEl.value = todayISO(); dateEl.max = todayISO();
    spendEl.value = ''; noteEl.value = '';
    noteEl.dispatchEvent(new Event('input'));
    $('#jrEditTitle').textContent = 'নতুন এন্ট্রি';
    $('#jrSave').textContent = 'জার্নাল সেভ করুন';
    $('#jrDelete').hidden = true;
    resetDelete();
    onDistrictChange();
    renderList();
  }
  function fillForm(e) {
    curId = e.id;
    clearPhotos();
    photos = (e.photos || []).map((b) => ({ blob: b, url: URL.createObjectURL(b) }));
    renderPhotos();
    tags = new Set(e.tags || []); ensureTagChips();
    setRating(e.rating || 0);
    sel.value = String(e.did);
    dateEl.value = e.date || todayISO();
    spendEl.value = e.spend == null ? '' : e.spend;
    noteEl.value = e.note || '';
    noteEl.dispatchEvent(new Event('input'));
    $('#jrEditTitle').textContent = 'এন্ট্রি সম্পাদনা';
    $('#jrSave').textContent = 'পরিবর্তন সেভ করুন';
    $('#jrDelete').hidden = false;
    resetDelete();
    onDistrictChange();
    renderList();
  }

  sel.addEventListener('change', onDistrictChange);

  // ---------- save / delete ----------
  function syncMap(did) {
    try {
      const s = JSON.parse(localStorage.getItem(MAP_KEY) || 'null') || { v: [], w: [], theme: 0, name: '', labels: true };
      const v = new Set(s.v || []); v.add(did);
      s.v = [...v];
      s.w = (s.w || []).filter((x) => x !== did);
      localStorage.setItem(MAP_KEY, JSON.stringify(s));
    } catch (e) { /* storage blocked: skip */ }
  }

  $('#jrForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!db) { toast('এই ব্রাউজারে সংরক্ষণ চালু নেই (প্রাইভেট মোড হতে পারে)'); return; }
    const did = +sel.value;
    if (!did) { toast('আগে একটি জেলা বেছে নিন'); sel.focus(); return; }
    const prev = curId ? entries.find((e) => e.id === curId) : null;
    const now = Date.now();
    const spend = spendEl.value === '' ? null : Math.max(0, Math.round(+spendEl.value) || 0);
    const entry = {
      id: prev ? prev.id : newId(), did,
      date: dateEl.value || todayISO(), rating, tags: [...tags], spend,
      note: noteEl.value.trim().slice(0, MAX_NOTE), photos: photos.map((p) => p.blob),
      created: prev ? prev.created : now, updated: now
    };
    const btn = $('#jrSave');
    btn.disabled = true;
    try {
      await dbPut(entry);
      entries = await dbAll();
      curId = entry.id;
      if ($('#jrSync').checked) syncMap(did);
      $('#jrEditTitle').textContent = 'এন্ট্রি সম্পাদনা';
      btn.textContent = 'পরিবর্তন সেভ করুন';
      $('#jrDelete').hidden = false;
      renderAll();
      toast(prev ? 'পরিবর্তন সেভ হয়েছে' : 'জার্নালে সেভ হয়েছে');
    } catch (e) {
      toast('সেভ করা যায়নি। ডিভাইসে জায়গা কম থাকতে পারে, কিছু ছবি সরিয়ে চেষ্টা করুন।');
    }
    btn.disabled = false;
  });

  const delBtn = $('#jrDelete');
  let delT;
  function resetDelete() { clearTimeout(delT); delBtn.classList.remove('sure'); delBtn.textContent = 'মুছুন'; }
  delBtn.addEventListener('click', async () => {
    if (!curId) return;
    if (!delBtn.classList.contains('sure')) {
      delBtn.classList.add('sure'); delBtn.textContent = 'নিশ্চিত? আবার ক্লিক করুন';
      delT = setTimeout(resetDelete, 4000);
      return;
    }
    try {
      await dbDel(curId);
      entries = await dbAll();
      resetForm();
      renderAll();
      toast('এন্ট্রি মুছে ফেলা হয়েছে');
    } catch (e) { toast('মোছা যায়নি'); }
  });
  $('#jrNew').addEventListener('click', () => { resetForm(); $('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' }); });

  // ---------- list + stats ----------
  const search = $('#jrSearch'), sortEl = $('#jrSort');
  search.addEventListener('input', renderList);
  sortEl.addEventListener('change', renderList);

  function stars(n) {
    const s = el('span', 'stars-s');
    s.setAttribute('aria-label', `${bn(n)}/৫`);
    s.append('★'.repeat(n));
    if (n < 5) s.append(el('i', null, '★'.repeat(5 - n)));
    return s;
  }

  function renderList() {
    listUrls.forEach((u) => URL.revokeObjectURL(u)); listUrls = [];
    listEl.textContent = '';
    $('#jrCountPill').textContent = bn(entries.length);
    const q = search.value.trim().toLowerCase();
    let arr = entries.filter((e) => {
      const d = byId.get(e.did);
      if (!d) return false;
      return !q || (d.bn + ' ' + d.en + ' ' + (e.note || '') + ' ' + (e.tags || []).join(' ')).toLowerCase().includes(q);
    });
    const mode = sortEl.value;
    arr.sort((a, b) => mode === 'old' ? (a.date || '').localeCompare(b.date || '') || a.created - b.created
      : mode === 'rate' ? (b.rating || 0) - (a.rating || 0) || (b.date || '').localeCompare(a.date || '')
      : (b.date || '').localeCompare(a.date || '') || b.created - a.created);

    if (!arr.length) {
      const e = el('div', 'empty');
      if (entries.length) e.append(el('b', null, 'কিছু পাওয়া যায়নি'), 'অন্য শব্দে খুঁজে দেখুন।');
      else e.append(el('b', null, 'এখনো কোনো জার্নাল নেই'), 'ম্যাপ থেকে একটি জেলা বেছে প্রথম ভ্রমণের স্মৃতি লিখুন।');
      listEl.appendChild(e);
      return;
    }
    arr.forEach((e) => {
      const d = byId.get(e.did);
      const b = el('button', 'item' + (e.id === curId ? ' cur' : ''));
      b.type = 'button';
      const th = el('div', 'thumb');
      if (e.photos && e.photos[0]) {
        const u = URL.createObjectURL(e.photos[0]); listUrls.push(u);
        const im = el('img'); im.src = u; im.alt = ''; im.loading = 'lazy';
        th.appendChild(im);
      } else th.textContent = d.bn.charAt(0);
      const body = el('div', 'body');
      const title = el('b');
      title.append(el('span', null, d.bn));
      if (e.rating) title.append(stars(e.rating));
      const spend = e.spend != null ? ' · ৳' + e.spend.toLocaleString('bn-BD') : '';
      const ph = e.photos && e.photos.length ? ` · ${bn(e.photos.length)}টি ছবি` : '';
      body.append(title, el('span', 'meta', fmtDate(e.date) + spend + ph));
      if (e.note) body.append(el('p', null, e.note));
      if (e.tags && e.tags.length) {
        const m = el('div', 'mini');
        e.tags.slice(0, 4).forEach((t) => m.append(el('span', null, t)));
        body.append(m);
      }
      b.append(th, body);
      b.addEventListener('click', () => {
        fillForm(e);
        if (window.innerWidth <= 900) $('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      listEl.appendChild(b);
    });
  }

  function renderStats() {
    const rated = entries.filter((e) => e.rating);
    const avg = rated.length ? rated.reduce((s, e) => s + e.rating, 0) / rated.length : 0;
    $('#stEntries').textContent = bn(entries.length);
    $('#stDistricts').innerHTML = bn(new Set(entries.map((e) => e.did)).size) + '<small>/' + bn(D.districts.length) + '</small>';
    $('#stRating').textContent = rated.length ? bn((Math.round(avg * 10) / 10).toString()) + ' ★' : '–';
    $('#stPhotos').textContent = bn(entries.reduce((s, e) => s + (e.photos ? e.photos.length : 0), 0));
  }
  function renderAll() { renderStats(); renderMap(); renderList(); }

  // ---------- backup / restore ----------
  const blobToDataURL = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
  function saveBlob(blob, name) {
    const u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  }
  $('#jrExport').addEventListener('click', async () => {
    if (!entries.length) { toast('ব্যাকআপ নেওয়ার মতো কোনো এন্ট্রি নেই'); return; }
    const btn = $('#jrExport'); btn.disabled = true;
    try {
      const out = [];
      for (const e of entries) out.push({ ...e, photos: await Promise.all((e.photos || []).map(blobToDataURL)) });
      const json = JSON.stringify({ app: 'bdtrip-journal', version: 1, exported: new Date().toISOString(), entries: out });
      saveBlob(new Blob([json], { type: 'application/json' }), `bdtrip-journal-${todayISO()}.json`);
      toast('ব্যাকআপ ফাইল নামানো হয়েছে');
    } catch (e) { toast('ব্যাকআপ তৈরি করা যায়নি'); }
    btn.disabled = false;
  });

  async function cleanEntry(x) {
    if (!x || typeof x !== 'object') return null;
    const d = byId.get(+x.did);
    if (!d) return null;
    const ph = [];
    for (const u of (Array.isArray(x.photos) ? x.photos : []).slice(0, MAX_PHOTOS)) {
      if (typeof u === 'string' && /^data:image\/(jpeg|png|webp|gif);base64,/.test(u)) {
        try { ph.push(await (await fetch(u)).blob()); } catch (e) { /* skip bad photo */ }
      }
    }
    const sp = x.spend == null || x.spend === '' ? null : Number(x.spend);
    return {
      id: typeof x.id === 'string' && /^[\w-]{3,40}$/.test(x.id) ? x.id : newId(),
      did: d.id,
      date: /^\d{4}-\d{2}-\d{2}$/.test(x.date) ? x.date : todayISO(),
      rating: Math.min(5, Math.max(0, Math.round(Number(x.rating)) || 0)),
      tags: (Array.isArray(x.tags) ? x.tags : []).filter((t) => typeof t === 'string' && t).map((t) => t.slice(0, 24)).slice(0, 12),
      spend: Number.isFinite(sp) ? Math.max(0, Math.round(sp)) : null,
      note: String(x.note || '').slice(0, MAX_NOTE),
      photos: ph,
      created: Number(x.created) || Date.now(), updated: Number(x.updated) || Date.now()
    };
  }
  $('#jrImport').addEventListener('change', async (ev) => {
    const f = ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    if (!db) { toast('এই ব্রাউজারে সংরক্ষণ চালু নেই'); return; }
    if (f.size > 80 * 1024 * 1024) { toast('ফাইলটি অনেক বড় (৮০ MB এর বেশি)'); return; }
    try {
      const data = JSON.parse(await f.text());
      if (!data || data.app !== 'bdtrip-journal' || !Array.isArray(data.entries)) throw new Error('format');
      let n = 0;
      for (const x of data.entries) {
        const e = await cleanEntry(x);
        if (e) { await dbPut(e); n++; }
      }
      entries = await dbAll();
      resetForm();
      renderAll();
      toast(n ? `${bn(n)}টি এন্ট্রি ফেরত আনা হয়েছে` : 'ফাইলে কোনো সঠিক এন্ট্রি পাওয়া যায়নি');
    } catch (e) { toast('এটি BDTrip এর ব্যাকআপ ফাইল নয়, বা ফাইলটি নষ্ট'); }
  });

  // ---------- start ----------
  (async () => {
    $('#yr').textContent = new Date().getFullYear();
    try {
      db = await openDB();
      entries = await dbAll();
    } catch (e) {
      db = null;
      toast('এই ব্রাউজারে সংরক্ষণ চালু নেই (প্রাইভেট মোড হতে পারে)');
    }
    const p = new URLSearchParams(location.search);
    const q = (p.get('d') || p.get('district') || '').toLowerCase();
    const pre = D.districts.find((d) => String(d.id) === q || d.en.toLowerCase().replace(/[^a-z]/g, '') === q.replace(/[^a-z]/g, '') && q);
    resetForm(pre ? pre.id : null);
    renderAll();
  })();
})();