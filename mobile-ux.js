(() => {
  'use strict';
  const svg = document.getElementById('map');
  const tool = document.querySelector('.tool');
  const picker = document.querySelector('.picker');
  const stage = document.querySelector('.stage');
  if (!svg || !tool || !picker || !stage) return;

  // Mobile: put the map first and turn the district picker into a bottom sheet.
  const sheetBtn = document.createElement('button');
  sheetBtn.type = 'button';
  sheetBtn.className = 'mobile-district-toggle';
  sheetBtn.setAttribute('aria-expanded', 'false');
  sheetBtn.innerHTML = '<span>☰</span> জেলা তালিকা <b id="mobileDistrictCount">৬৪</b>';
  tool.insertBefore(sheetBtn, picker);

  const closeSheet = () => {
    picker.classList.remove('mobile-sheet-open');
    sheetBtn.setAttribute('aria-expanded', 'false');
  };
  sheetBtn.addEventListener('click', () => {
    const open = picker.classList.toggle('mobile-sheet-open');
    sheetBtn.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => picker.querySelector('#search')?.focus(), 80);
  });

  // Mobile map controls + pan/zoom using the SVG viewBox.
  const viewport = document.createElement('div');
  viewport.className = 'map-viewport';
  const mapControls = document.createElement('div');
  mapControls.className = 'map-zoom-controls';
  mapControls.innerHTML = '<button type="button" data-zoom="-1" aria-label="জুম আউট">−</button><button type="button" data-zoom="0" aria-label="ম্যাপ রিসেট">⟲</button><button type="button" data-zoom="1" aria-label="জুম ইন">+</button>';
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

  // Avoid overlapping district labels. The current district gets highest priority.
  const avoidLabelCollision = () => {
    const labels = [...svg.querySelectorAll('text')].filter(t => !t.classList.contains('a11y-status-icon'));
    if (!labels.length) return;
    labels.forEach(t => { t.style.display = ''; });
    labels.sort((a,b) => (a.dataset.current === '1' ? -1 : 0) - (b.dataset.current === '1' ? -1 : 0));
    const kept = [];
    for (const label of labels) {
      try {
        const box = label.getBBox();
        const hit = kept.some(k => {
          const b = k.box;
          return !(box.x+box.width < b.x-2 || b.x+b.width < box.x-2 || box.y+box.height < b.y-2 || b.y+b.height < box.y-2);
        });
        if (hit) label.style.display = 'none';
        else kept.push({box});
      } catch (_) {}
    }
  };

  const updateLabelPriority = () => {
    svg.querySelectorAll('text').forEach(t => t.dataset.current = '0');
    const currentId = window.BDTripCurrentDistrict;
    if (currentId != null) {
      const d = window.BD_DATA?.districts?.find(x => x.id === currentId);
      if (d) [...svg.querySelectorAll('text')].forEach(t => { if (t.textContent === d.bn) t.dataset.current = '1'; });
    }
    requestAnimationFrame(avoidLabelCollision);
  };

  // Keep mobile sheet count useful without touching the app state.
  const count = document.getElementById('countPill');
  const observer = new MutationObserver(() => {
    if (count) document.getElementById('mobileDistrictCount').textContent = count.textContent;
    updateLabelPriority();
  });
  if (count) observer.observe(count, { childList:true, characterData:true, subtree:true });
  const mapObserver = new MutationObserver(updateLabelPriority);
  mapObserver.observe(svg, { childList:true, subtree:true });
  window.addEventListener('resize', () => requestAnimationFrame(avoidLabelCollision));
  requestAnimationFrame(updateLabelPriority);
})();