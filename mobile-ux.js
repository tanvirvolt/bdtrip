(() => {
  'use strict';
  const svg = document.getElementById('map');
  const tool = document.querySelector('.tool');
  const picker = document.querySelector('.picker');
  const stage = document.querySelector('.stage');
  const groups = document.getElementById('groups');
  if (!svg || !tool || !picker || !stage || !groups) return;

  // Mobile: keep the map visible first, then provide a quick finder and
  // an easy-to-scan district list below it. No hidden bottom sheet.
  const finder = document.createElement('div');
  finder.className = 'mobile-district-finder';
  finder.innerHTML = `
    <div class="mobile-finder-title"><b>জেলা খুঁজুন</b><span>ম্যাপ থেকে বা নিচের তালিকা থেকে বেছে নিন</span></div>
    <div class="mobile-division-filter" role="group" aria-label="বিভাগ ফিল্টার">
      <button type="button" class="active" data-div="all">সব</button>
    </div>
  `;
  picker.insertBefore(finder, picker.querySelector('.bulk'));

  const divisionFilter = finder.querySelector('.mobile-division-filter');
  const allBtn = divisionFilter.querySelector('[data-div="all"]');
  const divisions = window.BD_DATA?.divisions || [];
  divisions.forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.div = d.id;
    b.textContent = d.bn;
    divisionFilter.appendChild(b);
  });

  const filterGroups = divId => {
    [...groups.querySelectorAll('.group')].forEach(g => {
      g.hidden = divId !== 'all' && String(g._list?.[0]?.div) !== String(divId);
    });
    divisionFilter.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.div === String(divId)));
  };
  divisionFilter.addEventListener('click', e => {
    const b = e.target.closest('button[data-div]');
    if (!b) return;
    filterGroups(b.dataset.div);
  });

  // On mobile, each division is collapsible so the 64-district list stays compact.
  [...groups.querySelectorAll('.group')].forEach(g => {
    const head = g.querySelector('.g-head');
    const title = head?.querySelector('h3');
    if (!head || !title) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-group-toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '<span>⌄</span>';
    head.appendChild(toggle);
    const setOpen = open => {
      g.classList.toggle('mobile-group-collapsed', !open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('span').textContent = open ? '⌄' : '›';
    };
    toggle.addEventListener('click', e => { e.stopPropagation(); setOpen(!g.classList.contains('mobile-group-collapsed')); });
  });

  // Map zoom + pan.
  const viewport = document.createElement('div');
  viewport.className = 'map-viewport';
  const mapControls = document.createElement('div');
  mapControls.className = 'map-zoom-controls';
  mapControls.innerHTML = '<button type="button" data-zoom="-1" aria-label="জুম আউট">−</button><button type="button" data-zoom="0" aria-label="ম্যাপ রিসেট">⟳</button><button type="button" data-zoom="1" aria-label="জুম ইন">+</button>';
  svg.parentNode.insertBefore(viewport, svg);
  viewport.appendChild(svg);
  viewport.appendChild(mapControls);

  const vb = svg.getAttribute('viewBox').split(/\s+/).map(Number);
  const base = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  let zoom = 1, panX = 0, panY = 0, drag = null, suppressClick = false;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const applyView = () => {
    const w = base.w / zoom, h = base.h / zoom;
    const maxX = (base.w - w) / 2, maxY = (base.h - h) / 2;
    panX = clamp(panX, -maxX, maxX);
    panY = clamp(panY, -maxY, maxY);
    svg.setAttribute('viewBox', [base.x + (base.w-w)/2 + panX, base.y + (base.h-h)/2 + panY, w, h].join(' '));
  };
  const resetView = () => { zoom = 1; panX = 0; panY = 0; applyView(); };

  mapControls.addEventListener('click', e => {
    const b = e.target.closest('button[data-zoom]');
    if (!b) return;
    const z = Number(b.dataset.zoom);
    if (!z) resetView();
    else zoom = clamp(zoom + z * .5, 1, 3);
    applyView();
  });

  viewport.addEventListener('pointerdown', e => {
    if (e.target.closest('.map-zoom-controls')) return;
    drag = { x:e.clientX, y:e.clientY, px:panX, py:panY, moved:false };
    viewport.setPointerCapture?.(e.pointerId);
  });
  viewport.addEventListener('pointermove', e => {
    if (!drag) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = (base.w / zoom) / Math.max(1, rect.width);
    const scaleY = (base.h / zoom) / Math.max(1, rect.height);
    const dx = (e.clientX - drag.x) * scaleX;
    const dy = (e.clientY - drag.y) * scaleY;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    panX = drag.px - dx;
    panY = drag.py - dy;
    applyView();
  });
  viewport.addEventListener('pointerup', () => {
    if (drag?.moved) suppressClick = true;
    drag = null;
  });
  viewport.addEventListener('pointercancel', () => { drag = null; });
  viewport.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; e.stopPropagation(); }
  }, true);

  // Keep selected district label visible when labels overlap.
  const avoidLabelCollision = () => {
    const labels = [...svg.querySelectorAll('text')].filter(t => !t.classList.contains('a11y-status-icon'));
    if (!labels.length) return;
    labels.forEach(t => { t.style.display = ''; });
    labels.sort((a,b) => (a.dataset.current === '1' ? -1 : 0) - (b.dataset.current === '1' ? -1 : 0));
    const kept = [];
    for (const label of labels) {
      try {
        const box = label.getBBox();
        const hit = kept.some(k => !(box.x+box.width < k.x-2 || k.x+k.width < box.x-2 || box.y+box.height < k.y-2 || k.y+k.height < box.y-2));
        if (hit) label.style.display = 'none';
        else kept.push({x:box.x,y:box.y,width:box.width,height:box.height});
      } catch (_) {}
    }
  };
  const updateLabelPriority = () => {
    svg.querySelectorAll('text').forEach(t => t.dataset.current = '0');
    const currentId = window.BDTripCurrentDistrict;
    const d = window.BD_DATA?.districts?.find(x => x.id === currentId);
    if (d) [...svg.querySelectorAll('text')].forEach(t => { if (t.textContent === d.bn) t.dataset.current = '1'; });
    requestAnimationFrame(avoidLabelCollision);
  };

  const count = document.getElementById('countPill');
  const observer = new MutationObserver(() => {
    updateLabelPriority();
  });
  if (count) observer.observe(count, { childList:true, characterData:true, subtree:true });
  const mapObserver = new MutationObserver(updateLabelPriority);
  mapObserver.observe(svg, { childList:true, subtree:true });
  window.addEventListener('resize', () => requestAnimationFrame(avoidLabelCollision));
  requestAnimationFrame(updateLabelPriority);
})();