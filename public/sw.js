const CACHE_NAME = 'elysian-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Skip API routes, auth routes, and chrome extension schemes
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || !url.protocol.startsWith('http')) {
    return;
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to offline message for navigation HTML requests
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return new Response(
              `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline | Elysian Fabrics</title>
                <style>
                  body {
                    background-color: #fdfbf7;
                    color: #95545e;
                    font-family: system-ui, -apple-system, sans-serif;
                    text-align: center;
                    padding: 100px 20px;
                    margin: 0;
                  }
                  .container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(149, 84, 94, 0.05);
                    border: 1px solid rgba(183, 110, 121, 0.1);
                  }
                  h1 { font-family: serif; font-size: 2.25rem; margin-top: 0; margin-bottom: 16px; font-weight: 700; }
                  p { color: #6b7280; font-size: 1rem; line-height: 1.6; margin-bottom: 32px; }
                  button {
                    background-color: #b76e79;
                    color: white;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 9999px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(183, 110, 121, 0.2);
                    transition: all 0.2s;
                  }
                  button:hover {
                    background-color: #95545e;
                    transform: translateY(-1px);
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Connection Offline</h1>
                  <p>It seems you are currently disconnected from the internet. Please check your connection and try again to explore premium traditional outfits.</p>
                  <button onclick="window.location.reload()">Retry Connection</button>
                </div>
              </body>
              </html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
        });
      })
  );
});
