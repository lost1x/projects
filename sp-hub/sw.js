// ===== SERVICE WORKER FOR PERFORMANCE & CACHING =====

const CACHE_VERSION = 'v2';
const CACHE_NAME = `spaarow-hub-${CACHE_VERSION}`;
const OFFLINE_URL = 'offline.html';

// Calculate base path (supports subdirectory deployment)
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '/') || '/';

const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}asset/css/main.css`,
  `${BASE_PATH}asset/js/hub.js`,
  `${BASE_PATH}asset/js/navigation.js`,
  `${BASE_PATH}asset/img/favicon.ico`,
  `${BASE_PATH}asset/img/hub-og-image.jpg`,
  `${BASE_PATH}tarot-reading/index.html`,
  `${BASE_PATH}love-language-quiz/index.html`,
  `${BASE_PATH}dream-interpreter/index.html`,
  `${BASE_PATH}fortune-teller/index.html`,
  `${BASE_PATH}zodiac-calculator/index.html`,
  `${BASE_PATH}numerology/index.html`,
  `${BASE_PATH}rune-casting/index.html`,
  `${BASE_PATH}birth-charts/index.html`,
  `${BASE_PATH}crystal-healing/index.html`,
  `${BASE_PATH}${OFFLINE_URL}`
];

function cleanOldCaches() {
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames
        .filter(name => name.startsWith('spaarow-hub-') && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
  });
}

function cacheFirst(request) {
  return caches.match(request).then(cachedResponse => {
    if (cachedResponse) {
      // Update cache in the background
      fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        }
      }).catch(() => {});
      return cachedResponse;
    }

    return fetch(request)
      .then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
        return networkResponse;
      })
      .catch(() => {
        // When offline, fall back to the offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match(`/${OFFLINE_URL}`);
        }
      });
  });
}

function networkFirst(request) {
  return fetch(request)
    .then(networkResponse => {
      // If response is invalid, fall back to cache
      if (!networkResponse || networkResponse.status !== 200) {
        return caches.match(request);
      }

      // Update cache
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
      return networkResponse;
    })
    .catch(() => {
      return caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (request.mode === 'navigate') {
          return caches.match(`/${OFFLINE_URL}`);
        }
      });
    });
}

// Install event - cache resources
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => cleanOldCaches())
  );
});

// Activate event - claim clients and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      cleanOldCaches()
    ])
  );
});

// Fetch event - network-first for navigation, cache-first for others
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

// Listen for skipWaiting message from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
