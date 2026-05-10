// IndexedDB utilities for offline support
const DB_NAME = 'soy-card-pro-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending-leads'

export interface OfflineLead {
  id: string
  profile_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  message?: string
  consent: boolean
  timestamp: number
}

let db: IDBDatabase | null = null

export async function initializeDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function savePendingLead(lead: Omit<OfflineLead, 'id' | 'timestamp'>): Promise<string> {
  const database = await initializeDB()
  const id = `${lead.profile_id}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const offlineLead: OfflineLead = {
    ...lead,
    id,
    timestamp: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.add(offlineLead)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(id)
  })
}

export async function getPendingLeads(): Promise<OfflineLead[]> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function deletePendingLead(id: string): Promise<void> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function clearPendingLeads(): Promise<void> {
  const database = await initializeDB()

  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
