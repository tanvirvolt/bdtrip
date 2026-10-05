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
  const LEVELS = [
    [0, 'নতুন ভ্রমণকারী'], [1, 'ঘুরতে শুরু'], [6, 'পথের সাথী'], [16, 'অভিযাত্রী'],
    [31, 'দেশ-দর্শক'], [51, 'প্রায় সারা দেশ'], [64, 'বাংলাদেশ জয়ী']
  ];
  const CHECKS = [
    'জাতীয় পরিচয়পত্র / আইডি কার্ড', 'ফোন চার্জার ও পাওয়ার ব্যাংক', 'নগদ টাকা (দূরের এলাকার জন্য)',
    'অগ্রিম টিকিট ও হোটেল বুকিং', 'প্রয়োজনীয় ওষুধ ও ফার্স্ট এইড', 'ছাতা / রেইনকোট',
    'পানির বোতল ও হালকা খাবার', 'আবহাওয়ার পূর্বাভাস দেখে নেওয়া', 'স্থানীয় নিয়ম ও অনুমতি যাচাই (পাহাড়, দ্বীপ, বনাঞ্চল)'
  ];

  const $ = (s) => document.querySelector(s);
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

  $('#search').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    let any = false;
    groupEls.forEach((g) => {
      let vis = 0;
      g.querySelectorAll('.chip').forEach((c) => {
        const show = !q || c.dataset.q.includes(q);
        c.hidden = !show;
        if (show) vis++;
      });
      g.hidden = vis === 0;
      if (vis) any = true;
    });
    $('#noResult').hidden = any;
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
      <div class="g-sec"><h4>ঘুরে দেখার জায়গা</h4><ul>${(info.a || ['স্থানীয়দের কাছ থেকে জেনে নিন']).map((x) => `<li>${x}</li>`).join('')}</ul></div>
      <div class="g-sec"><h4>ঘোরার সেরা সময়</h4><p>${info.s || 'অক্টোবর–মার্চ'}</p></div>
      ${info.f ? `<div class="g-sec"><h4>বিখ্যাত খাবার ও পণ্য</h4><p>${info.f}</p></div>` : ''}`;
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
        if (e.target.tagName === 'BUTTON') setStatus(id, null); else state.cur = id;
        update();
      });
      wl.appendChild(tag);
    });

    $('#waBtn').href = 'https://wa.me/?text=' + encodeURIComponent(shareText());
    save();
  }

  // ---------- export ----------
  const W = 1080, H = 1350;
  async function render() {
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
    c.fillStyle = t.bg; c.fillRect(0, 0, W, H);

    c.textAlign = 'left';
    c.fillStyle = mut; c.font = '500 24px "Hind Siliguri", sans-serif';
    c.fillText('BDTrip · ভ্রমণ ম্যাপ', 70, 92);
    c.fillStyle = ink;
    let title = titleText(), fs = 64;
    c.font = `800 ${fs}px "Noto Sans Bengali", "Hind Siliguri", sans-serif`;
    while (c.measureText(title).width > 640 && fs > 30) { fs -= 2; c.font = `800 ${fs}px "Noto Sans Bengali", sans-serif`; }
    c.fillText(title, 70, 165);

    const n = state.v.size, wn = state.w.size;
    c.textAlign = 'right';
    c.fillStyle = mut; c.font = '500 34px "Hind Siliguri", sans-serif';
    const tot = '/' + bn(total);
    c.fillText(tot, W - 70, 165);
    const tw = c.measureText(tot).width;
    c.fillStyle = t.v; c.font = '800 120px "Noto Sans Bengali", sans-serif';
    c.fillText(bn(n), W - 70 - tw - 8, 165);

    const ax = 100, ay = 205, aw = W - 200, ah = 880;
    const sc = Math.min(aw / D.w, ah / D.h);
    const ox = ax + (aw - D.w * sc) / 2, oy = ay + (ah - D.h * sc) / 2;
    c.save();
    c.translate(ox, oy); c.scale(sc, sc);
    c.lineJoin = 'round'; c.lineWidth = (1 / sc) * 1.4; c.strokeStyle = t.bg;
    D.districts.forEach((d) => {
      const p = new Path2D(d.d), st = statusOf(d.id);
      c.fillStyle = st === 'v' ? t.v : st === 'w' ? t.w : t.empty;
      c.fill(p); c.stroke(p);
    });
    c.restore();

    if (state.labels) {
      c.textAlign = 'center';
      c.font = '600 15px "Noto Sans Bengali", sans-serif';
      c.lineWidth = 3; c.lineJoin = 'round';
      [...state.v, ...state.w].forEach((id) => {
        const d = byId.get(id);
        const x = ox + d.c[0] * sc, y = oy + d.c[1] * sc + 5;
        c.strokeStyle = 'rgba(0,0,0,.45)'; c.strokeText(d.bn, x, y);
        c.fillStyle = '#fff'; c.fillText(d.bn, x, y);
      });
    }

    const pct = n / total, bx = 70, bw = W - 140, by = 1118;
    c.fillStyle = 'rgba(128,128,128,.22)'; c.beginPath(); c.roundRect(bx, by, bw, 10, 5); c.fill();
    if (n) { c.fillStyle = t.v; c.beginPath(); c.roundRect(bx, by, Math.max(10, bw * pct), 10, 5); c.fill(); }
    c.textAlign = 'left'; c.fillStyle = mut; c.font = '500 24px "Hind Siliguri", sans-serif';
    c.fillText(`${bn(n)}টি জেলা ভ্রমণ · ${bn(Math.round(pct * 100))}% সম্পন্ন`, 70, 1168);

    // legend
    c.font = '600 24px "Hind Siliguri", sans-serif';
    const l1 = `ঘুরেছি ${bn(n)}`, l2 = `ঘুরতে চাই ${bn(wn)}`;
    c.textAlign = 'left';
    const w1 = c.measureText(l1).width, w2 = c.measureText(l2).width;
    const lw = 22 + w1 + 44 + 22 + w2, lx = (W - lw) / 2, ly = 1215;
    c.fillStyle = t.v; c.beginPath(); c.arc(lx + 8, ly - 8, 8, 0, 7); c.fill();
    c.fillStyle = ink; c.fillText(l1, lx + 22, ly);
    const x2 = lx + 22 + w1 + 44;
    c.fillStyle = t.w; c.beginPath(); c.arc(x2 + 8, ly - 8, 8, 0, 7); c.fill();
    c.fillStyle = ink; c.fillText(l2, x2 + 22, ly);

    // brand
    c.font = '800 34px "Poppins", sans-serif';
    const a = 'BD', b = 'Trip';
    const wa = c.measureText(a).width, wb = c.measureText(b).width, bx0 = (W - wa - wb) / 2;
    c.fillStyle = ink; c.fillText(a, bx0, 1295);
    c.fillStyle = t.v; c.fillText(b, bx0 + wa, 1295);
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
          const J = window.jspdf && window.jspdf.jsPDF;
          if (!J) throw new Error('PDF লাইব্রেরি লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
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

  // ---------- share ----------
  function shareText() {
    const n = state.v.size, pct = Math.round((n / total) * 100);
    const url = location.protocol.startsWith('http') ? location.href.split('#')[0] : '';
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
})();