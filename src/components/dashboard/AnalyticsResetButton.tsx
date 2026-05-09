'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyticsResetButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async () => {
    setLoading(true)
    await fetch('/api/analytics/reset', { method: 'DELETE' })
    setConfirm(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setConfirm(true)}
        className="text-xs py-2 px-4 rounded-xl font-semibold transition-colors flex-shrink-0"
        style={{ background: 'var(--black-surface)', color: '#f87171', border: '1px solid #991b1b' }}>
        Reiniciar estadísticas
      </button>

      {confirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm p-6 rounded-2xl flex flex-col gap-4"
              style={{ background: 'var(--black-card)', border: '1px solid var(--gold-border)' }}>
              <h3 className="text-pearl font-bold text-lg">¿Reiniciar analítica?</h3>
              <p className="text-muted text-sm">
                Se borrarán todos los escaneos y vistas. Los leads no se eliminarán. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button onClick={handleReset} disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }}>
                  {loading ? 'Reiniciando...' : 'Sí, reiniciar'}
                </button>
                <button onClick={() => setConfirm(false)} className="flex-1 btn-ghost-gold py-3">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
