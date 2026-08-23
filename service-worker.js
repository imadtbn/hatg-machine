const CACHE_NAME = 'appliance-errors-v10';
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
  './data/taxonomy.json',
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
  './articles/when-to-call-technician.html',
  './articles/refrigerator-not-cooling.html',
  './articles/dryer-not-drying.html',
  './articles/ac-weak-airflow.html',
  './articles/dishwasher-white-residue.html',
  './articles/microwave-not-heating.html',
  './articles/washing-machine-bad-smell.html'
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
  const isDataRequest = /\/data\/(brands|errors|taxonomy|articles)\.json$/i.test(requestUrl.pathname);
  const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';
  const isCodeOrStyle = event.request.destination === 'script' || event.request.destination === 'style' || /\/assets\/(js|css)\//i.test(requestUrl.pathname);

  if (isCodeOrStyle) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

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
