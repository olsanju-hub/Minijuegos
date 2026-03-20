const CACHE_NAME = "minijuegos-shell-v8";
const SCOPE_URL = new URL(self.registration.scope);
const APP_BASE = SCOPE_URL.pathname.endsWith("/") ? SCOPE_URL.pathname : `${SCOPE_URL.pathname}/`;
const APP_SHELL = [
  APP_BASE,
  `${APP_BASE}index.html`,
  `${APP_BASE}styles.css`,
  `${APP_BASE}app.js`,
  `${APP_BASE}engine.js`,
  `${APP_BASE}ui.js`,
  `${APP_BASE}manifest.webmanifest`,
  `${APP_BASE}assets/icono.png`,
  `${APP_BASE}assets/icon-192.png`,
  `${APP_BASE}assets/icon-512.png`,
  `${APP_BASE}games/tres-en-raya.js`,
  `${APP_BASE}games/cuatro-en-raya.js`,
  `${APP_BASE}games/damas.js`,
  `${APP_BASE}games/parchis.js`,
  `${APP_BASE}games/escaleras-serpientes.js`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${APP_BASE}index.html`))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return networkResponse;
      });
    })
  );
});
