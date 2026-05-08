const CACHE_NAME = "auction-pwa-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL);
}

self.addEventListener("install", event => {
  event.waitUntil(
    cacheAppShell().then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(async keys => {
      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })
  );
});

async function fromCacheOrNetwork(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.status === 200) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.match("/index.html");
      })
    );
    return;
  }

  if (url.origin === self.location.origin || request.destination === "image") {
    event.respondWith(fromCacheOrNetwork(request));
  }
});