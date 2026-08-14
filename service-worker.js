const CACHE_NAME = 'appliance-errors-v5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './errors.html',
  './brand.html',
  './brands.html',
  './error.html',
  './articles.html',
  './article.html',
  './faq.html',
  './about.html',
  './contact.html',
  './privacy.html',
  './disclaimer.html',
  './manifest.webmanifest',
  './data/brands.json',
  './data/errors.json',
  './data/articles.json',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/adsData.js',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './articles/maintenance-tips.html',
  './articles/energy-saving.html',
  './articles/washing-machine-care.html',
  './articles/ac-maintenance.html',
  './articles/dishwasher-errors.html',
  './articles/choose-washing-machine.html',
  './articles/dishwasher-filter.html',
  './articles/washing-machine-drain.html',
  './articles/washing-machine-vibration.html',
  './articles/dishwasher-drying.html',
  './articles/when-to-call-technician.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  const requestUrl = new URL(event.request.url);
  const isDataRequest = /\/data\/(brands|errors|articles)\.json$/i.test(requestUrl.pathname);
  const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';

  if (isDataRequest || isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
