const CACHE_NAME = 'appliance-errors-v15';
const STATIC_ASSETS = [
  './',
  './index.html',
  './errors.html',
  './troubleshooting.html',
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
  './data/i18n.json',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/site-tags.js',
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
  './articles/washing-machine-bad-smell.html',
  './assets/images/articles/refrigerator-not-cooling.jpg',
  './assets/images/articles/dryer-not-drying.jpg',
  './assets/images/articles/ac-weak-airflow.jpg',
  './assets/images/articles/when-to-call-technician.jpg',
  './assets/images/articles/dishwasher-white-residue.jpg',
  './assets/images/articles/dishwasher-drying.jpg',
  './assets/images/articles/ac-maintenance.jpg',
  './assets/images/articles/choose-washing-machine.jpg',
  './assets/images/articles/dishwasher-errors.jpg',
  './assets/images/articles/dishwasher-filter.jpg',
  './assets/images/articles/energy-saving.jpg',
  './assets/images/articles/maintenance-tips.jpg',
  './assets/images/articles/microwave-not-heating.jpg',
  './assets/images/articles/washing-machine-bad-smell.jpg',
  './assets/images/articles/washing-machine-care.jpg',
  './assets/images/articles/washing-machine-drain.jpg',
  './assets/images/articles/washing-machine-vibration.jpg',
  './en/index.html', './en/errors.html', './en/troubleshooting.html', './en/brand.html', './en/brands.html',
  './en/error.html', './en/articles.html', './en/article.html', './en/faq.html', './en/about.html', './en/contact.html',
  './en/privacy.html', './en/disclaimer.html'
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
  const isDataRequest = /\/data\/(brands|errors|taxonomy|articles|i18n)\.json$/i.test(requestUrl.pathname);
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
