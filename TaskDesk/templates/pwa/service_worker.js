{% load django_vite %}const TD_CACHE_NAME = 'taskdesk-cache-{% vite_asset_url 'css/main.sass' %}';
const cachableUrlPrefixes = ['/static'];

self.addEventListener('fetch', function(event) {
    if (cachableUrlPrefixes.some(function(url) { event.request.url.indexOf(url) >= 0 })) {
        event.respondWith(caches.match(event.request).then(function(response) {
            return response || fetch(event.request).then(function(response) {
                if (!response || response.status != 200) {
                    return response;
                }
                caches.open(TD_CACHE_NAME).then(function(cache) {
                    cache.put(event.request, response.clone());
                });
                return response;
            });
        }).catch(function() { return fetch(event.request); }));
    } else {
        event.respondWith(fetch(event.request));
    }
});

self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(cacheNames) {
        return Promise.all(cacheNames
            .filter(function(ck) { ck != TD_CACHE_NAME })
            .map(function(ck) { return caches.delete(ck) }));
    }));
});