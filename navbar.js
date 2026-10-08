(() => {
  'use strict';
  const host=document.getElementById('bdtrip-nav');
  if(host){host.innerHTML=`<header class="bdnav" id="bdtripNavbar"><a class="bdnav-brand" href="/" aria-label="BDTrip হোম"><span class="bdnav-pin"><svg viewBox="0 0 32 32"><path d="M16 4a7.5 7.5 0 0 0-7.5 7.5C8.5 17 16 27 16 27s7.5-10 7.5-15.5A7.5 7.5 0 0 0 16 4z" fill="#ffb703"/><circle cx="16" cy="11.5" r="2.8" fill="#0b3d3a"/></svg></span><span><span class="bdnav-word">BD<b>Trip</b></span><span class="bdnav-tagline">বাংলাদেশ ঘুরুন, নিজের মতো করে</span></span></a><nav class="bdnav-links" aria-label="প্রধান মেনু"><a class="bdnav-link" href="/"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg><span>হোম</span></a><a class="bdnav-link" href="/#tool"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5 8.5 4 15.5 7l5.5-2.5V17.5L15.5 20 8.5 17 3 19.5z"/><path d="M8.5 4v13M15.5 7v13"/></svg><span>ম্যাপ</span></a><a class="bdnav-link" href="/district-guide/"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>জেলা গাইড</span></a><a class="bdnav-link" href="/planner/"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h3M8 17h6"/></svg><span>প্ল্যানার</span></a><a class="bdnav-link" href="/journal/"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M8 4v16M11 8h5M11 12h5M11 16h3"/></svg><span>জার্নাল</span></a><div class="bdnav-more-wrap"><button class="bdnav-more" type="button" data-bn-more aria-expanded="false"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg><span>আরও</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button><div class="bdnav-dropdown" data-bn-more-menu><a class="bdnav-drop-item" href="/budget/"><i class="ico"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h3M15 13h2M7 16h5"/></svg></i>বাজেট ক্যালকুলেটর</a><a class="bdnav-drop-item" href="/checklist/"><i class="ico"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 2.5 2.5L16 9"/></svg></i>ট্রিপ চেকলিস্ট</a><a class="bdnav-drop-item" href="/#faq"><i class="ico"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 4.3 1.7c-.9.9-2 1.3-2 2.8"/><path d="M12 17h.01"/></svg></i>প্রশ্নোত্তর</a><a class="bdnav-drop-item" href="/journal/"><i class="ico"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6 4 4"/><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/></svg></i>আমার জার্নাল</a></div></div></nav><div class="bdnav-tools"><button class="bdnav-search" type="button" data-bn-search-open><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="search-label">জেলা, স্থান বা গাইড খুঁজুন...</span></button><div style="position:relative"><button class="bdnav-lang" type="button" data-bn-lang>🇧🇩 <span>বাংলা</span>⌄</button><div class="bdnav-lang-menu" data-bn-lang-menu><a class="active" href="/">✓ বাংলা</a><a href="/en/">English</a></div></div><button class="bdnav-theme" type="button" data-bn-theme aria-label="ডার্ক মোড">🌙</button><a class="bdnav-cta" href="/planner/">＋ প্ল্যান করুন</a></div><div class="bdnav-mobile-tools"><button class="bdnav-icon-btn" type="button" data-bn-mobile-search aria-label="জেলা খুঁজুন">⌕</button><button class="bdnav-icon-btn" type="button" data-bn-theme aria-label="ডার্ক মোড">🌙</button><button class="bdnav-icon-btn" type="button" data-bn-menu aria-label="মেনু">☰</button></div></header><div class="bdnav-drawer" aria-hidden="true"><div class="bdnav-drawer-card"><div class="bdnav-drawer-head"><div class="bdnav-drawer-brand"><span class="bdnav-pin"><svg viewBox="0 0 32 32"><path d="M16 4a7.5 7.5 0 0 0-7.5 7.5C8.5 17 16 27 16 27s7.5-10 7.5-15.5A7.5 7.5 0 0 0 16 4z" fill="#ffb703"/><circle cx="16" cy="11.5" r="2.8" fill="#0b3d3a"/></svg></span>BD<b>Trip</b></div><button class="close" type="button" data-bn-close>×</button></div><nav class="bdnav-drawer-links"><a class="bdnav-drawer-link" href="/"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg></i>হোম</a><a class="bdnav-drawer-link" href="/#tool"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5 8.5 4 15.5 7l5.5-2.5V17.5L15.5 20 8.5 17 3 19.5z"/><path d="M8.5 4v13M15.5 7v13"/></svg></i>ম্যাপ</a><a class="bdnav-drawer-link" href="/district-guide/"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></i>জেলা গাইড</a><a class="bdnav-drawer-link" href="/planner/"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h3M8 17h6"/></svg></i>প্ল্যানার</a><a class="bdnav-drawer-link" href="/journal/"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M8 4v16M11 8h5M11 12h5M11 16h3"/></svg></i>জার্নাল</a><div class="bdnav-drawer-divider"></div><a class="bdnav-drawer-link" href="/budget/"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h3M15 13h2M7 16h5"/></svg></i>বাজেট ক্যালকুলেটর</a><a class="bdnav-drawer-link" href="/checklist/"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 2.5 2.5L16 9"/></svg></i>চেকলিস্ট</a><a class="bdnav-drawer-link" href="/#faq"><i class="di"><svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 4.3 1.7c-.9.9-2 1.3-2 2.8"/><path d="M12 17h.01"/></svg></i>প্রশ্নোত্তর</a></nav><div class="bdnav-drawer-bottom"><a href="/">বাংলা</a><a href="/en/">English</a></div><button class="bdnav-drawer-cta" type="button" data-bn-mobile-search>⌕ জেলা খুঁজুন</button><a class="bdnav-cta" style="width:100%;justify-content:center;margin-top:8px" href="/planner/">＋ ট্রিপ প্ল্যান করুন</a></div></div><div class="bdnav-search-panel" aria-hidden="true"><div class="bdnav-search-box"><div class="bdnav-search-head"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input data-bn-search type="search" placeholder="জেলা, স্থান বা গাইড খুঁজুন..." autocomplete="off"><button class="bdnav-search-close" type="button" data-bn-search-close>×</button></div><div class="bdnav-search-body"><div class="bdnav-search-filters"><button class="active">সব</button><button>জেলা</button><button>জনপ্রিয় স্থান</button></div><div class="bdnav-results" data-bn-results></div></div></div></div>`}
  const nav=document.querySelector('.bdnav');
  if(!nav) return;
  const qs=s=>nav.querySelector(s), qsa=s=>[...nav.querySelectorAll(s)];
  const path=location.pathname.replace(/\/$/,'')||'/';
  const current=(href)=>{
    try{const u=new URL(href,location.origin); const p=u.pathname.replace(/\/$/,'')||'/'; return p===path || (p==='/'&&path==='/');}catch(e){return false;}
  };
  qsa('.bdnav-link').forEach(a=>{const p=new URL(a.href,location.origin).pathname.replace(/\/$/,'')||'/'; const match=current(a.href)||(p==='/district-guide'&&path.startsWith('/district/')); if(match)a.classList.add('active'),a.setAttribute('aria-current','page');});
  const themeBtns=qsa('[data-bn-theme]');
  const syncTheme=()=>{const dark=document.body.classList.contains('dark');themeBtns.forEach(b=>{b.textContent=dark?'☀️':'🌙';b.setAttribute('aria-label',dark?'লাইট মোড':'ডার্ক মোড');});};
  try{if(localStorage.getItem('bdtrip_theme')==='dark')document.body.classList.add('dark')}catch(e){}
  syncTheme();
  themeBtns.forEach(themeBtn=>themeBtn.addEventListener('click',()=>{document.body.classList.toggle('dark');try{localStorage.setItem('bdtrip_theme',document.body.classList.contains('dark')?'dark':'light')}catch(e){}syncTheme();}));
  const more=qs('[data-bn-more]'), moreMenu=qs('[data-bn-more-menu]');
  const closeMore=()=>{moreMenu?.classList.remove('open');more?.setAttribute('aria-expanded','false')};
  more?.addEventListener('click',e=>{e.stopPropagation();const open=moreMenu.classList.toggle('open');more.setAttribute('aria-expanded',String(open))});
  const lang=qs('[data-bn-lang]'), langMenu=qs('[data-bn-lang-menu]');
  lang?.addEventListener('click',e=>{e.stopPropagation();langMenu?.classList.toggle('open')});
  const drawer=qs('.bdnav-drawer'), menuBtn=qs('[data-bn-menu]');
  const closeDrawer=()=>drawer?.classList.remove('open');
  menuBtn?.addEventListener('click',()=>drawer?.classList.add('open'));
  drawer?.addEventListener('click',e=>{if(e.target===drawer||e.target.closest('[data-bn-close]'))closeDrawer()});
  document.addEventListener('click',()=>{closeMore();langMenu?.classList.remove('open')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMore();langMenu?.classList.remove('open');closeDrawer();closeSearch();}});
  let last=false;
  const onScroll=()=>{const now=scrollY>12;if(now!==last){last=now;nav.classList.toggle('is-scrolled',now)}};
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  const panel=document.querySelector('.bdnav-search-panel'), input=panel?.querySelector('[data-bn-search]'), results=panel?.querySelector('[data-bn-results]');
  const openSearch=()=>{panel?.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>input?.focus(),30);render('');};
  const closeSearch=()=>{if(!panel)return;panel.classList.remove('open');document.body.style.overflow='';};
  qs('[data-bn-search-open]')?.addEventListener('click',openSearch);
  qs('[data-bn-mobile-search]')?.addEventListener('click',()=>{closeDrawer();openSearch()});
  panel?.addEventListener('click',e=>{if(e.target===panel||e.target.closest('[data-bn-search-close]'))closeSearch()});
  let loaded=false;
  const ensureData=()=>new Promise(resolve=>{
    if(window.BD_DATA?.districts?.length){loaded=true;resolve(true);return;}
    if(loaded){resolve(Boolean(window.BD_DATA?.districts?.length));return;}
    const existing=document.querySelector('script[src$="/data.js"],script[src="data.js"]');
    if(existing){
      if(window.BD_DATA?.districts?.length){loaded=true;resolve(true);return;}
      existing.addEventListener('load',()=>{loaded=true;resolve(Boolean(window.BD_DATA?.districts?.length))},{once:true});
      existing.addEventListener('error',()=>resolve(false),{once:true});
      return;
    }
    const s=document.createElement('script');
    s.src='/data.js';
    s.onload=()=>{loaded=true;resolve(Boolean(window.BD_DATA?.districts?.length))};
    s.onerror=()=>resolve(false);
    document.head.appendChild(s);
  });
  const norm=v=>String(v??'').toLocaleLowerCase('bn').replace(/[\s\-_]/g,'');
  const slugify=v=>String(v||'').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  function render(query){
    if(!results)return;
    results.innerHTML='<div class="bdnav-empty"><div><b>খুঁজছি...</b></div></div>';
    ensureData().then(ok=>{
      if(!ok){
        results.innerHTML='<div class="bdnav-empty"><div><b>জেলা ডেটা লোড করা যায়নি</b><br><small>পেজটি refresh করে আবার চেষ্টা করুন</small></div></div>';
        return;
      }
      const q=norm(query);
      const ds=Array.isArray(window.BD_DATA?.districts)?window.BD_DATA.districts:[];
      const items=q
        ? ds.filter(d=>norm(d.bn).includes(q)||norm(d.en).includes(q)).slice(0,12)
        : ds.slice(0,8);
      if(!items.length){
        results.innerHTML='<div class="bdnav-empty"><div><b>কোনো জেলা পাওয়া যায়নি</b><br><small>বাংলা বা English নাম দিয়ে আবার চেষ্টা করুন</small></div></div>';
        return;
      }
      results.innerHTML=items.map(d=>{
        const slug=slugify(d.en);
        return '<a class="bdnav-result" href="/district/'+encodeURIComponent(slug)+'/"><span class="bdnav-result-icon">'+districtIcon()+'</span><span><b>'+escapeHtml(d.bn)+'</b><small>'+escapeHtml(d.en)+'</small></span><span class="bdnav-result-arrow" aria-hidden="true">›</span></a>';
      }).join('');
    }).catch(()=>{
      results.innerHTML='<div class="bdnav-empty"><div><b>Search error</b><br><small>আবার চেষ্টা করুন</small></div></div>';
    });
  }
  const districtIcon=()=>'<svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  const escapeHtml=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  input?.addEventListener('input',e=>render(e.target.value));
})();