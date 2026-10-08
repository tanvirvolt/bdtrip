(() => {
  'use strict';
  const host=document.getElementById('bdtrip-nav');
  if(host){host.innerHTML=`<header class="bdnav" id="bdtripNavbar"><a class="bdnav-brand" href="/" aria-label="BDTrip হোম"><span class="bdnav-pin"><svg viewBox="0 0 32 32"><path d="M16 4a7.5 7.5 0 0 0-7.5 7.5C8.5 17 16 27 16 27s7.5-10 7.5-15.5A7.5 7.5 0 0 0 16 4z" fill="#ffb703"/><circle cx="16" cy="11.5" r="2.8" fill="#0b3d3a"/></svg></span><span><span class="bdnav-word">BD<b>Trip</b></span><span class="bdnav-tagline">বাংলাদেশ ঘুরুন, নিজের মতো করে</span></span></a><nav class="bdnav-links" aria-label="প্রধান মেনু"><a class="bdnav-link" href="/"><span>⌂</span><span>হোম</span></a><a class="bdnav-link" href="/#tool"><span>▦</span><span>ম্যাপ</span></a><a class="bdnav-link" href="/district-guide/"><span>⌖</span><span>জেলা গাইড</span></a><a class="bdnav-link" href="/planner/"><span>◈</span><span>প্ল্যানার</span></a><a class="bdnav-link" href="/journal/"><span>▣</span><span>জার্নাল</span></a><div class="bdnav-more-wrap"><button class="bdnav-more" type="button" data-bn-more aria-expanded="false"><span>⊞</span><span>আরও</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button><div class="bdnav-dropdown" data-bn-more-menu><a class="bdnav-drop-item" href="/budget/"><i class="ico">৳</i>বাজেট ক্যালকুলেটর</a><a class="bdnav-drop-item" href="/checklist/"><i class="ico">✓</i>ট্রিপ চেকলিস্ট</a><a class="bdnav-drop-item" href="/#faq"><i class="ico">?</i>প্রশ্নোত্তর</a><a class="bdnav-drop-item" href="/journal/"><i class="ico">✎</i>আমার জার্নাল</a></div></div></nav><div class="bdnav-tools"><button class="bdnav-search" type="button" data-bn-search-open><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="search-label">জেলা, স্থান বা গাইড খুঁজুন...</span></button><div style="position:relative"><button class="bdnav-lang" type="button" data-bn-lang>🇧🇩 <span>বাংলা</span>⌄</button><div class="bdnav-lang-menu" data-bn-lang-menu><a class="active" href="/">✓ বাংলা</a><a href="/en/">English</a></div></div><button class="bdnav-theme" type="button" data-bn-theme aria-label="ডার্ক মোড">🌙</button><a class="bdnav-cta" href="/planner/">＋ প্ল্যান করুন</a></div><div class="bdnav-mobile-tools"><button class="bdnav-icon-btn" type="button" data-bn-mobile-search aria-label="জেলা খুঁজুন">⌕</button><button class="bdnav-icon-btn" type="button" data-bn-theme aria-label="ডার্ক মোড">🌙</button><button class="bdnav-icon-btn" type="button" data-bn-menu aria-label="মেনু">☰</button></div></header><div class="bdnav-drawer" aria-hidden="true"><div class="bdnav-drawer-card"><div class="bdnav-drawer-head"><div class="bdnav-drawer-brand"><span class="bdnav-pin"><svg viewBox="0 0 32 32"><path d="M16 4a7.5 7.5 0 0 0-7.5 7.5C8.5 17 16 27 16 27s7.5-10 7.5-15.5A7.5 7.5 0 0 0 16 4z" fill="#ffb703"/><circle cx="16" cy="11.5" r="2.8" fill="#0b3d3a"/></svg></span>BD<b>Trip</b></div><button class="close" type="button" data-bn-close>×</button></div><nav class="bdnav-drawer-links"><a class="bdnav-drawer-link" href="/"><i class="di">⌂</i>হোম</a><a class="bdnav-drawer-link" href="/#tool"><i class="di">▦</i>ম্যাপ</a><a class="bdnav-drawer-link" href="/district-guide/"><i class="di">⌖</i>জেলা গাইড</a><a class="bdnav-drawer-link" href="/planner/"><i class="di">◈</i>প্ল্যানার</a><a class="bdnav-drawer-link" href="/journal/"><i class="di">▣</i>জার্নাল</a><div class="bdnav-drawer-divider"></div><a class="bdnav-drawer-link" href="/budget/"><i class="di">৳</i>বাজেট ক্যালকুলেটর</a><a class="bdnav-drawer-link" href="/checklist/"><i class="di">✓</i>চেকলিস্ট</a><a class="bdnav-drawer-link" href="/#faq"><i class="di">?</i>প্রশ্নোত্তর</a></nav><div class="bdnav-drawer-bottom"><a href="/">বাংলা</a><a href="/en/">English</a></div><button class="bdnav-drawer-cta" type="button" data-bn-mobile-search>⌕ জেলা খুঁজুন</button><a class="bdnav-cta" style="width:100%;justify-content:center;margin-top:8px" href="/planner/">＋ ট্রিপ প্ল্যান করুন</a></div></div><div class="bdnav-search-panel" aria-hidden="true"><div class="bdnav-search-box"><div class="bdnav-search-head"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input data-bn-search type="search" placeholder="জেলা, স্থান বা গাইড খুঁজুন..." autocomplete="off"><button class="bdnav-search-close" type="button" data-bn-search-close>×</button></div><div class="bdnav-search-body"><div class="bdnav-search-filters"><button class="active">সব</button><button>জেলা</button><button>জনপ্রিয় স্থান</button></div><div class="bdnav-results" data-bn-results></div></div></div></div>`}
  const nav=document.querySelector('.bdnav');
  if(!nav) return;
  const qs=s=>nav.querySelector(s), qsa=s=>[...nav.querySelectorAll(s)];
  const path=location.pathname.replace(/\\/$/,'')||'/';
  const current=(href)=>{
    try{const u=new URL(href,location.origin); const p=u.pathname.replace(/\\/$/,'')||'/'; return p===path || (p==='/'&&path==='/');}catch(e){return false;}
  };
  qsa('.bdnav-link').forEach(a=>{if(current(a.href))a.classList.add('active'),a.setAttribute('aria-current','page');});
  const themeBtn=qs('[data-bn-theme]');
  const syncTheme=()=>{const dark=document.body.classList.contains('dark');if(themeBtn){themeBtn.textContent=dark?'☀️':'🌙';themeBtn.setAttribute('aria-label',dark?'লাইট মোড':'ডার্ক মোড');}};
  try{if(localStorage.getItem('bdtrip_theme')==='dark')document.body.classList.add('dark')}catch(e){}
  syncTheme();
  themeBtn?.addEventListener('click',()=>{document.body.classList.toggle('dark');try{localStorage.setItem('bdtrip_theme',document.body.classList.contains('dark')?'dark':'light')}catch(e){}syncTheme()});
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
    if(window.BD_DATA){loaded=true;resolve();return;}
    if(loaded){resolve();return;}
    const s=document.createElement('script');s.src='/data.js';s.onload=()=>{loaded=true;resolve()};s.onerror=()=>resolve();document.head.appendChild(s);
  });
  const norm=v=>String(v||'').toLowerCase().replace(/[\s\-_]/g,'');
  function render(query){
    if(!results)return;
    ensureData().then(()=>{
      const q=norm(query);
      const ds=window.BD_DATA?.districts||[];
      const items=q?ds.filter(d=>norm(d.bn).includes(q)||norm(d.en).includes(q)||norm(d.id).includes(q)).slice(0,12):ds.slice(0,8);
      if(!items.length){results.innerHTML='<div class="bdnav-empty"><div><b>কোনো জেলা পাওয়া যায়নি</b><br><small>বাংলা বা English নাম দিয়ে আবার চেষ্টা করুন</small></div></div>';return;}
      results.innerHTML=items.map(d=>'<a class="bdnav-result" href="/district/'+encodeURIComponent(d.id)+'/"><span class="bdnav-result-icon">⌖</span><span><b>'+escapeHtml(d.bn)+'</b><small>'+escapeHtml(d.en)+'</small></span><span style="margin-left:auto">›</span></a>').join('');
    });
  }
  const escapeHtml=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  input?.addEventListener('input',e=>render(e.target.value));
})();