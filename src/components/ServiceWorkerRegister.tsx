'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('✓ Service Worker registrado — soporte offline activo')
      }).catch((err) => {
        console.error('✗ Error registrando Service Worker:', err)
      })
    }
  }, [])

  return null
}
