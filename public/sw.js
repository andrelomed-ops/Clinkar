const CACHE_NAME = 'clinkar-inspector-v3-shield';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    '/shield-icon-192.png',
    '/shield-icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Solo cachear peticiones GET a nuestro propio dominio o peticiones críticas
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Opcionalmente cachear nuevas peticiones de activos estáticos
                if (event.request.url.includes('/_next/static/') || event.request.url.includes('/icons/')) {
                    const cacheCopy = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, cacheCopy);
                    });
                }
                return fetchResponse;
            });
        }).catch(() => {
            // Fallback offline si no hay red ni cache
            if (event.request.mode === 'navigate') {
                return caches.match('/');
            }
        })
    );
});
