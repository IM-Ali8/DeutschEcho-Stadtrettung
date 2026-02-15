// Hero Rescue Shooter PWA Service Worker
const CACHE_NAME = "hrs-cache-20260215095803";
const CORE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "./icons/icon-180.png",
  "./icons/icon-152.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if(req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if(cached) return cached;

      return fetch(req).then((res) => {
        // cache same-origin basic assets
        try {
          const url = new URL(req.url);
          if(url.origin === self.location.origin && (res.type === "basic" || res.type === "cors")) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
        } catch(e) {}
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
