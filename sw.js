// SUGANG 서비스 워커 — 판마다 캐시 이름이 바뀜(build-pwa.js가 아래 CACHE의 판 번호 자리를 채움)
// 같은 주소의 GET만 「네트워크 먼저, 안 되면 캐시」 → 새 판이 바로 반영됨. 구글 서버 요청은 건드리지 않음.
const CACHE = 'sugang-app-c5ea6e2250';
const FILES = ['./', './index.html', './banner.png', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sugang-app-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
