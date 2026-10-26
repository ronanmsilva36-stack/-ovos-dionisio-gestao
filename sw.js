const VERSION = 'ovos-dionisio-pwa-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(SHELL.map(async path => {
      try { await cache.add(new Request(new URL(path, self.registration.scope), {cache: 'reload'})); }
      catch (e) { console.warn('Não foi possível guardar recurso do app shell:', path, e); }
    }));
    // Cacheia bibliotecas externas durante a instalação para melhorar a abertura offline.
    await Promise.all(EXTERNAL_ASSETS.map(async url => {
      try {
        const response = await fetch(new Request(url, {mode: 'no-cors', cache: 'reload'}));
        if (response && (response.ok || response.type === 'opaque')) {
          await cache.put(url, response);
        }
      } catch (e) { /* Se a rede/CDN falhar, tenta novamente quando estiver online. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('ovos-dionisio-') && key !== VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith((async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(VERSION);
          cache.put(new URL('./index.html', self.registration.scope), response.clone()).catch(() => {});
          return response;
        } catch (e) {
          return (await caches.match(request)) ||
                 (await caches.match(new URL('./index.html', self.registration.scope))) ||
                 new Response('Aplicativo indisponível offline. Abra-o uma vez com internet.', {
                   status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}
                 });
        }
      })());
      return;
    }
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(VERSION);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (e) {
        return new Response('', {status: 504, statusText: 'Offline'});
      }
    })());
    return;
  }

  // Bibliotecas externas são servidas do cache quando a conexão cai.
  if (['script', 'style', 'font', 'image'].includes(request.destination)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === 'opaque')) {
          const cache = await caches.open(VERSION);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (e) {
        return cached || new Response('', {status: 504, statusText: 'Offline'});
      }
    })());
  }
});
