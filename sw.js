const cacheName = 'app-shell-v2';
const assetsToCache = [
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
    'https://fonts.gstatic.com/s/materialicons/v55/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',

    'assets/images/bird.jpg',
    'assets/images/cat.jpg',
    'assets/images/dog.jpg',
    'assets/images/fish.jpg',
    'assets/images/habbit.jpg',
    'assets/images/mouse.jpg',
    'assets/images/default.png',

    'assets/js/material.min.js',
    'assets/css/style.css',
    'assets/js/app.js',
    'favicon.ico',
    'index.html',
    '/'
];

async function cacheStaticAssets() {
    try{
        const cache = await caches.open(cacheName);
        return await cache.addAll(assetsToCache);
    } catch (error) {
        console.error('Failed to install assets cache: ', error);
    }
}

self.addEventListener('install', event => {
    console.log('[Service Worker] Installilng service Worker...');
    event.waitUntil(cacheStaticAssets());
    self.skipWaiting(); // só em desenvolvimento deixa isso. Só abre nova versão quando a antiga for fechada no brownser
});

function removeOldCache(cacheKey) {
    if(cacheKey !== cacheName) {
        console.log('[Service Worker] removing old cache');
        return caches.delete(cacheKey);
    }
}

async function cacheCleanup() {
    const keyList = await caches.keys();
    return Promise.all(keyList.map(removeOldCache));
}

self.addEventListener('activate', event => {
    console.log('[Service Worker] activating service worker...');
    event.waitUntil(cacheCleanup());
    self.clients.claim();
});

function isImage(eventRequest) {
    return eventRequest.method === "GET" && eventRequest.destination === "image";
}

async function getRequest(e) {
    return fetch(e.request)
    .then(response => {
        if (response.ok) return response;

        // online sem resposta
        if (isImage(e.request)) {
            return caches.match('assets/images/default.png');
        }
    })
    .catch(err => {
        // offline
        if (isImage(e.request)) {
            return caches.match('assets/images/default.png');
        }
    })
}

// Cache falling back to the network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches
        .match(event.request)
        .then(function (response) {
            return response || getRequest(event)
        })
      )
});