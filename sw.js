/* Autoevaluación ABP · funciona sin conexión una vez abierta
   Isabel González Mosquera · CPR Plurilingüe Divina Pastora Ourense · Fundación Ana Mogas */
const CACHE = 'autoeval-abp-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const EXTRA = ['https://cdn.jsdelivr.net/npm/docx@9.5.1/dist/index.iife.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(CORE);
    for (const u of EXTRA) { try { await c.add(new Request(u, { mode: 'cors' })); } catch (err) {} }
  }).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Muestra lo guardado al instante y lo actualiza en segundo plano */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: req.mode === 'navigate' }) || (req.mode === 'navigate' ? await c.match('./index.html') : undefined);
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
