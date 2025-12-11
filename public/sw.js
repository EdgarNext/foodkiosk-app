const CACHE_NAME = "foodkiosk-cache-v6.11";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-icon.png",
  "/icons/apple-touch-icon.png",
  OFFLINE_URL
];

const isSameOrigin = (request) => {
  const url = new URL(request.url);
  return self.location.origin === url.origin;
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
};

const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((error) => console.error("[SW] Precaching failed", error))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isSameOrigin(request)) {
    return;
  }

  const acceptHeader = request.headers.get("accept") || "";

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await networkFirst(request);
        } catch {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })()
    );
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === "image" || acceptHeader.includes("image")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (acceptHeader.includes("text/html")) {
    event.respondWith(networkFirst(request));
  }
});
