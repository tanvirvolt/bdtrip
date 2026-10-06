const CACHE='bdtrip-v3';
const CORE=['/','/index.html','/style.css','/v2.css','/app.js','/data.js','/info.js','/site.webmanifest','/favicon.svg','/og-image.svg','/vendor/jspdf.umd.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('bdtrip-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||!req.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.match(req).then(cached=>{
    const network=fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>cached||caches.match('/index.html'));
    return cached||network;
  }));
});