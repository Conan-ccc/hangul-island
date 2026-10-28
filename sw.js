// Offline cache. Bump VERSION together with shared/config.js on every release.
const VERSION = '1.0.1';
const CACHE = 'hangul-island-' + VERSION;
const ASSETS = [
  './',
  './hangul/island1.html',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './index.html',
  './manifest.webmanifest',
  './shared/activities/bridge.js',
  './shared/activities/common.js',
  './shared/activities/door.js',
  './shared/activities/find.js',
  './shared/activities/fruit.js',
  './shared/activities/gift.js',
  './shared/characters.js',
  './shared/config.js',
  './shared/drag.js',
  './shared/evolve.js',
  './shared/fx.js',
  './shared/hangul.js',
  './shared/home.js',
  './shared/island.js',
  './shared/island1-content.js',
  './shared/mastery.js',
  './shared/parent.js',
  './shared/pet.js',
  './shared/register-sw.js',
  './shared/save.js',
  './shared/speech.js',
  './shared/strokes.js',
  './shared/trace.js',
  './shared/ui.css',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('hangul-island-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
