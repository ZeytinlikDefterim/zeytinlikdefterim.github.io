/* Zeytinlik Defterim © 2026 Fatih Aybars TAHTALI. Tüm hakları saklıdır. */
const V = 'zd-20261029194727';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  /* sayfanın kendisi: önce internet (güncel sürüm), yoksa kayıtlı kopya */
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put('./index.html', c)); return res; })
      .catch(() => caches.match('./index.html').then(h => h || caches.match('./'))));
    return;
  }
  /* uygulama dosyaları, Firebase kütüphanesi ve yazı tipleri: önce kayıtlı kopya */
  const mine = u.origin === location.origin;
  const lib = u.hostname === 'www.gstatic.com' && u.pathname.indexOf('/firebasejs/') === 0;
  const font = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!mine && !lib && !font) return;
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); }
    return res;
  })));
});
