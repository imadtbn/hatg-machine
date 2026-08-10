const CACHE_NAME = 'appliance-errors-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/errors.html',
  '/brand.html',
  '/brands.html',
  '/error.html',
  '/articles.html',
  '/faq.html',
  '/about.html',
  '/contact.html',
  '/privacy.html',
  '/disclaimer.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/data/brands.json',
  '/data/errors.json'
];

// Install
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).catch(function(err) {
      console.warn('Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Return cached response if available
      if (response) return response;
      
      // Fetch from network
      return fetch(event.request).then(function(networkResponse) {
        // Cache successful responses
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
