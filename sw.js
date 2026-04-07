const CACHE_NAME = "minijuegos-shell-v19";
const UPDATE_MESSAGE_TYPE = "minijuegos:sw-activated";
const SCOPE_URL = new URL(self.registration.scope);
const APP_BASE = SCOPE_URL.pathname.endsWith("/") ? SCOPE_URL.pathname : `${SCOPE_URL.pathname}/`;

const APP_SHELL = [
  APP_BASE,
  `${APP_BASE}index.html`,
  `${APP_BASE}styles.css`,
  `${APP_BASE}app.js`,
  `${APP_BASE}appearance-refresh.js`,
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
  `${APP_BASE}games/escaleras-serpientes.js`,
  `${APP_BASE}games/trafico.js`,
  `${APP_BASE}games/buscaminas.js`,
  `${APP_BASE}games/sokoban.js`
];

const NETWORK_FIRST_PATHS = new Set([
  APP_BASE,
  `${APP_BASE}index.html`,
  `${APP_BASE}styles.css`,
  `${APP_BASE}app.js`,
  `${APP_BASE}appearance-refresh.js`,
  `${APP_BASE}engine.js`,
  `${APP_BASE}ui.js`,
  `${APP_BASE}manifest.webmanifest`
]);

function isGameModulePath(pathname) {
  return pathname.startsWith(`${APP_BASE}games/`) && pathname.endsWith(".js");
}

function isShellRequest(request, url) {
  return request.mode === "navigate" || NETWORK_FIRST_PATHS.has(url.pathname) || isGameModulePath(url.pathname);
}

async function matchShellFallback(request) {
  const directMatch = await caches.match(request);
  if (directMatch) return directMatch;
  if (request.mode === "navigate") {
    const appBaseMatch = await caches.match(APP_BASE);
    if (appBaseMatch) return appBaseMatch;
    return caches.match(`${APP_BASE}index.html`);
  }
  return null;
}

async function cacheShellResponse(cache, request, response) {
  if (!response || response.status !== 200) return response;
  if (request.mode === "navigate") {
    const baseClone = response.clone();
    await cache.put(APP_BASE, baseClone.clone());
    await cache.put(`${APP_BASE}index.html`, baseClone);
    return response;
  }
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      await cacheShellResponse(cache, request, networkResponse);
      return networkResponse;
    }
    const cachedResponse = await matchShellFallback(request);
    return cachedResponse || networkResponse;
  } catch (error) {
    const cachedResponse = await matchShellFallback(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function notifyClientsOfActivation() {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: UPDATE_MESSAGE_TYPE, version: CACHE_NAME });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
    await notifyClientsOfActivation();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (isShellRequest(request, url)) {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});
