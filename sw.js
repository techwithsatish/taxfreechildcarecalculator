const CACHE_NAME = 'childcare-calculator-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const OFFLINE_PAGE = '/offline.html';

// Critical resources that should be cached immediately
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/js/site.js',
    '/images/calculator.jpg',
    '/images/grid.svg'
];

// Non-critical resources that can be cached after load
const NON_CRITICAL_ASSETS = [
    '/js/jquery-3.1.1.min.js',
    '/js/autoNumeric.min.js',
    '/manifest.json',
    '/images/ogimage.jpeg',
    OFFLINE_PAGE
];

// Cache size limits
const STATIC_CACHE_LIMIT = 30;
const DYNAMIC_CACHE_LIMIT = 50;

// Install Event - Cache Critical Assets First
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching critical assets');
                return cache.addAll(CRITICAL_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('Caching non-critical assets');
                return cache.addAll(NON_CRITICAL_ASSETS);
            })
        ])
    );
});

// Activate Event with Better Cache Management
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (![STATIC_CACHE, DYNAMIC_CACHE].includes(key)) {
                            console.log('Deleting old cache:', key);
                            return caches.delete(key);
                        }
                    })
                );
            }),
            // Claim clients immediately
            self.clients.claim()
        ])
    );
});

// Optimized cache trimming
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        console.log(`Trimming cache ${cacheName}`);
        await Promise.all(keys.slice(0, keys.length - maxItems).map(key => cache.delete(key)));
    }
}

// Improved fetch strategy with preloading
self.addEventListener('fetch', event => {
    const request = event.request;

    // Skip non-GET requests and cross-origin requests
    if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
        return;
    }

    // HTML navigation - Network first with fast cache fallback
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, clone))
                        .then(() => trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT));
                    return response;
                })
                .catch(() => 
                    caches.match(request)
                        .then(response => response || caches.match(OFFLINE_PAGE))
                )
        );
        return;
    }

    // Critical assets - Cache first with network fallback
    if (CRITICAL_ASSETS.includes(request.url)) {
        event.respondWith(
            caches.match(request)
                .then(response => response || fetch(request))
        );
        return;
    }

    // Images and other assets - Stale while revalidate
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                const fetchPromise = fetch(request)
                    .then(networkResponse => {
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(request, networkResponse.clone());
                                trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
                            });
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);
                return cachedResponse || fetchPromise;
            })
    );
}); 