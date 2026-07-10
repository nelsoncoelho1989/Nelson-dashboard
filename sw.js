const CACHE = "nc-corrida-v2";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: tenta sempre a rede primeiro (versão mais recente).
// Só usa a cache como fallback se estiveres offline.
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
