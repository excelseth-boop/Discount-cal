var CACHE_NAME = 'discount-calc-v1';
var FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './favicon.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Serve from cache, but refresh cache in background for next time
        fetchAndCache(event.request);
        return cachedResponse;
      }
      return fetchAndCache(event.request);
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});

function fetchAndCache(request) {
  return fetch(request).then(function(response) {
    if (!response || response.status !== 200) {
      return response;
    }
    var responseClone = response.clone();
    caches.open(CACHE_NAME).then(function(cache) {
      cache.put(request, responseClone);
    });
    return response;
  }).catch(function() {
    return caches.match('./index.html');
  });
}
