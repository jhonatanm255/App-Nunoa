// service-worker.js

// Nombre del caché
const CACHE_NAME = 'v1_cache';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.html',
  '/style.css',
  '/main.css',
  '/navegacion.css',
  '/header.css',
  '/app.js',
  '/btnEliminarCondominio.js',
  '/codeExportDb.js',
  '/condominios.js',
  '/generarQr.js',
  '/qrExportDb.js',
  '/registerUserPass.js',
  '/user.js',
  '/images/logo.png',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache inicializada');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
});

// Interceptar y servir las solicitudes desde el caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
