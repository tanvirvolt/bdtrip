(() => {
  'use strict';

  const svg = document.getElementById('map');
  if (!svg || !window.BD_DATA) return;

  const byId = new Map(window.BD_DATA.districts.map(d => [d.id, d]));

  // Non-color status markers: ✓ = visited, ★ = wishlist.
  const statusG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  statusG.setAttribute('class', 'a11y-status-markers');
  statusG.setAttribute('aria-hidden', 'true');

  // app.js appends the district-name group last, so place status markers before it.
  svg.appendChild(statusG);

  const sync = () => {
    svg.querySelectorAll('path[data-id]').forEach(p => {
      const id = Number(p.dataset.id);
      const d = byId.get(id);
      if (!d) return;

      const status = p.classList.contains('v') ? 'v' : p.classList.contains('w') ? 'w' : '';
      const statusText = status === 'v' ? 'ঘুরেছি' : status === 'w' ? 'ঘুরতে চাই' : 'এখনো বাছাই করা হয়নি';

      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.setAttribute('aria-label', `${d.bn} জেলা — ${statusText}। নির্বাচন করতে Enter বা Space চাপুন।`);

      // aria-pressed represents whether this district currently has any status.
      p.setAttribute('aria-pressed', status ? 'true' : 'false');
    });

    statusG.textContent = '';
    svg.querySelectorAll('path[data-id].v, path[data-id].w').forEach(p => {
      const d = byId.get(Number(p.dataset.id));
      if (!d || !d.c) return;

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', d.c[0]);
      icon.setAttribute('y', d.c[1] - 4);
      icon.setAttribute('class', 'a11y-status-icon ' + (p.classList.contains('v') ? 'visited' : 'wishlist'));
      icon.textContent = p.classList.contains('v') ? '✓' : '★';
      statusG.appendChild(icon);
    });
  };

  svg.addEventListener('keydown', e => {
    const p = e.target.closest('path[data-id]');
    if (!p) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      p.click();
    }
  });

  const observer = new MutationObserver(sync);
  observer.observe(svg, { subtree: true, attributes: true, attributeFilter: ['class'] });
  sync();
})();