(() => {
  'use strict';
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