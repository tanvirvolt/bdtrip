(() => {
  'use strict';
  const root=document.body, key='bdtrip_theme';
  try{if(localStorage.getItem(key)==='dark')root.classList.add('dark')}catch(e){}
  const btn=document.getElementById('themeToggle');
  const sync=()=>{if(btn){btn.textContent=root.classList.contains('dark')?'☀':'◐';btn.setAttribute('aria-label',root.classList.contains('dark')?'লাইট মোড':'ডার্ক মোড')}};
  sync();
  btn?.addEventListener('click',()=>{root.classList.toggle('dark');try{localStorage.setItem(key,root.classList.contains('dark')?'dark':'light')}catch(e){}sync()});
  document.querySelectorAll('.mobile-nav a,.v2-search-btn').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.mobile-nav a').forEach(x=>x.removeAttribute('aria-current'));const n=document.querySelector('.mobile-nav a[href="'+a.getAttribute('href')+'"]');n?.setAttribute('aria-current','page')}));

  const topLink=document.querySelector('.foot .totop');
  topLink?.addEventListener('click',(e)=>{
    e.preventDefault();
    window.scrollTo({top:0,left:0,behavior:'smooth'});
    history.replaceState(null,'',location.pathname+location.search);
  });
})();