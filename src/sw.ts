/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST?: any[] }

cleanupOutdatedCaches()
precacheAndRoute(self.__SW_MANIFEST || [])

// Static assets — Cache First (images, fonts, CSS, JS)
registerRoute(
  ({ request }: any) =>
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Public tarjetas — Stale While Revalidate
registerRoute(
  ({ url }: any) =>
    url.pathname.match(/^\/[^/]+\/[^/]+$/) ||
    url.pathname === '/',
  new StaleWhileRevalidate({
    cacheName: 'public-cards',
  })
)

// API routes — Network Only
registerRoute(
  ({ url }: any) => url.pathname.startsWith('/api/'),
  new NetworkOnly({
    networkTimeoutSeconds: 3,
  })
)

// Navigation — Network First
registerRoute(
  ({ request }: any) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'navigate',
  })
)

// Default pages — Network First
registerRoute(
  ({ url }: any) => url.origin === self.location.origin,
  new NetworkFirst({
    cacheName: 'pages',
  })
)

// Offline fallback
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request).catch(async () => {
      const offline = await caches.match('/offline')
      return offline || new Response('Offline')
    })
  )
})

self.skipWaiting()
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim())
})
