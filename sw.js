const CACHE = 'still-point-v2';

// Exclude all API calls and Netlify functions from caching
function shouldBypass(url) {
    return url.includes('api.anthropic.com') ||
           url.includes('api.openai.com')    ||
           url.includes('supabase.co')       ||
           url.includes('/.netlify/functions/');
}

self.addEventListener('install', e => {
    // Skip waiting so new service worker activates immediately
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    // Delete all old caches on activation
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // Always bypass for API calls and functions
    if (shouldBypass(e.request.url)) return;

    // Network first for everything else — always gets latest code
    // Falls back to cache only if network fails (true offline support)
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Cache a copy of the fresh response
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
