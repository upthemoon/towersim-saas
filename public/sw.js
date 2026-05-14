// TowerSim Service Worker
// Strategy:
//   - navigations: network-first, fallback to cache, fallback to /offline
//   - same-origin static assets: cache-first with stale-while-revalidate
//   - API/auth routes: network-only (never cache)
//   - cross-origin: network-only (Supabase, Stripe, Google Fonts handled by browser)

const CACHE_VERSION = "towersim-v1";
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const PRECACHE = `${CACHE_VERSION}-precache`;

const PRECACHE_URLS = [
  "/",
  "/simulator.html",
  "/icon.svg",
  "/icon-maskable.svg",
  "/manifest.webmanifest",
  "/offline",
];

const NO_CACHE_PATHS = [
  "/api/",
  "/auth/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => {
            // 個別失敗は無視 (一部だけ取れなくても致命的ではない)
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function shouldBypass(url) {
  return NO_CACHE_PATHS.some((p) => url.pathname.startsWith(p));
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok && request.method === "GET") {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const offline = await caches.match("/offline");
      if (offline) return offline;
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response));
        }
      })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok && request.method === "GET") {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(?:svg|png|jpg|jpeg|webp|ico|woff2?|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
