/* BDTrip V5 — navigation helpers, keyboard shortcuts, mobile quick actions */
(() => {
  'use strict';
  if (window.__BDTRIP_V5__) return;
  window.__BDTRIP_V5__ = true;

  const makeButton = (id, className, label, text, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = id;
    button.className = className;
    button.setAttribute('aria-label', label);
    button.textContent = text;
    button.addEventListener('click', action);
    document.body.appendChild(button);
    return button;
  };
  const goTo = (target, focusTarget) => {
    const node = document.querySelector(target);
    if (!node) return;
    node.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
    if (focusTarget) {
      window.setTimeout(() => {
        const focusable = node.matches('input,button,a,[tabindex]') ? node : node.querySelector(focusTarget);
        focusable?.focus({preventScroll:true});
      }, 250);
    }
  };

  const top = makeButton('bdtrip-back-top','', 'পাতার শুরুতে যান','↑', () => window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  const updateTop = () => top.classList.toggle('is-visible', window.scrollY > 650);
  window.addEventListener('scroll', updateTop, {passive:true});
  updateTop();

  const dock = document.createElement('nav');
  dock.id = 'bdtrip-mobile-dock';
  dock.setAttribute('aria-label','দ্রুত নেভিগেশন');
  dock.innerHTML = '<button type="button" class="dock-map" data-target="#mapCard"><span aria-hidden="true">▦</span> আমার ম্যাপ</button><button type="button" class="dock-search" data-target="#search"><span aria-hidden="true">⌕</span> জেলা খুঁজুন</button>';
  dock.querySelector('[data-target="#mapCard"]').addEventListener('click', () => goTo('#mapCard'));
  dock.querySelector('[data-target="#search"]').addEventListener('click', () => goTo('#search','input'));
  document.body.appendChild(dock);

  document.addEventListener('keydown', event => {
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    if (event.key === 'Escape') {
      const results = document.getElementById('homeSearchResults');
      if (results && !results.hidden) {
        results.hidden = true;
        document.getElementById('search')?.setAttribute('aria-expanded','false');
      }
      return;
    }
    if (typing || event.altKey || event.shiftKey) return;
    if ((event.key === '/' && !event.ctrlKey && !event.metaKey) ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
      const search = document.getElementById('search');
      if (search) {
        event.preventDefault();
        goTo('#search');
        window.setTimeout(() => search.focus({preventScroll:true}), 180);
      }
    }
  });
})();