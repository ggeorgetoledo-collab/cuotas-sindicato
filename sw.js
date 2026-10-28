const CACHE_NAME = 'cuotas-sindicales-v12';
const ASSETS = ['./cuotas.html', './portal.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE_NAME).then(c=> c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=> Promise.all(ks.filter(k=> k !== CACHE_NAME).map(k=> caches.delete(k))))); self.clients.claim(); });
// Red primero: con internet trae siempre la versión más nueva; sin conexión usa la copia guardada.
// Los archivos de datos (.json cifrados) nunca se guardan en caché.
self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;
  if(/\/(datos|portal)-[a-z0-9-]+(\.enc)?\.json$/.test(url.pathname)) return;
  const key = url.origin + url.pathname;
  e.respondWith(fetch(e.request).then(r=>{ if(r && r.status === 200){ const cl = r.clone(); caches.open(CACHE_NAME).then(c=> c.put(key, cl)); } return r; }).catch(()=> caches.match(key)));
});
