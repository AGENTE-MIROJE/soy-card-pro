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

// Background Sync — sync pending leads when connection returns
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-leads') {
    event.waitUntil(syncPendingLeads())
  }
})

async function syncPendingLeads() {
  try {
    // Open IndexedDB to get pending leads
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('soy-card-pro-offline', 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result)
    })

    const tx = db.transaction(['pending-leads'], 'readonly')
    const store = tx.objectStore('pending-leads')
    const leads = await new Promise<any[]>((resolve, reject) => {
      const req = store.getAll()
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result)
    })

    if (!leads.length) return

    // Convert to format expected by API (omit id)
    const leadsToSync = leads.map(({ id, timestamp, ...rest }) => rest)

    // POST batch to API
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadsToSync),
    })

    if (res.ok) {
      // Delete synced leads from IndexedDB
      const txDelete = db.transaction(['pending-leads'], 'readwrite')
      const storeDelete = txDelete.objectStore('pending-leads')
      leads.forEach(lead => storeDelete.delete(lead.id))

      await new Promise<void>((resolve, reject) => {
        txDelete.onerror = () => reject(txDelete.error)
        txDelete.oncomplete = () => resolve()
      })
    }
  } catch (err) {
    // Sync failed — will retry on next connection
    console.error('Background sync failed:', err)
    throw err
  }
}

self.skipWaiting()
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim())
})
