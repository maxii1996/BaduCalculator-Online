self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('cache-name')
      .then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/script.js',
          '/estilos.css'
          // Agrega aquí todos los archivos que quieres que se almacenen en caché
        ]);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});