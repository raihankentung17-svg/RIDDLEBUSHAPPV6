const CACHE_NAME = 'rba-system-cache-v15';

// DAFTAR SELURUH FILE APLIKASI (PASTIKAN SEMUA FILE INI ADA DI FOLDER ANDA)
const urlsToCache = [
  '/',
  '/index.html',
  '/tracker.html',
  '/datamosh.html',
  '/regang.html',
  '/manifest.json',
  '/logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching aplikasi RBA...');
        // Menambahkan catch agar jika 1 file hilang, tidak merusak seluruh aplikasi
        return cache.addAll(urlsToCache).catch(err => console.log('Ada file yang terlewat di-cache:', err));
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Menghapus cache usang:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
            return response; // Tampilkan dari cache jika ada
        }
        
        return fetch(event.request).catch(() => {
            // JIKA FETCH GAGAL, berikan respons darurat (BUKAN UNDEFINED) agar tidak ERR_FAILED
            return new Response('Aplikasi sedang offline atau file tidak ditemukan di server.', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/plain' })
            });
        });
      })
  );
});