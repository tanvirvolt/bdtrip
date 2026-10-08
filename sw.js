const CACHE='bdtrip-v5';

const CORE=[
  '/',
  '/index.html',
  '/style.css',
  '/v2.css',
  '/navbar.css',
  '/navbar.js',
  '/app.js',
  '/data.js',
  '/info.js',
  '/site.webmanifest',
  '/og-image.svg',
  '/vendor/jspdf.umd.min.js'
];

self.addEventListener('install', event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(key=>key.startsWith('bdtrip-') && key!==CACHE)
          .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', event=>{
  const req=event.request;
  if(req.method!=='GET' || !req.url.startsWith(self.location.origin)) return;

  // Always try the network first for HTML/navigation so deployed changes
  // (especially the shared navbar) cannot be hidden by an old cached page.
  if(req.mode==='navigate' || req.destination==='document'){
    event.respondWith(
      fetch(req)
        .then(res=>{
          if(res.ok){
            const copy=res.clone();
            caches.open(CACHE).then(cache=>cache.put(req,copy));
          }
          return res;
        })
        .catch(()=>caches.match(req).then(cached=>cached || caches.match('/index.html')))
    );
    return;
  }

  // Static assets use cache-first with a network update.
  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(res=>{
        if(res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy));
        }
        return res;
      }).catch(()=>cached || caches.match('/index.html'));
      return cached || network;
    })
  );
});