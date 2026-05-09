'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ScanEvent } from '@/lib/supabase/types'

interface ScanWithSave extends ScanEvent { saving?: boolean; saved?: boolean }

export default function ScanNotifications({ profileIds }: { profileIds: string[] }) {
  const [scans, setScans] = useState<ScanWithSave[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!profileIds.length) return

    const channel = supabase
      .channel('scan_events_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'scan_events',
        filter: `profile_id=in.(${profileIds.join(',')})`,
      }, (payload) => {
        setScans(prev => [payload.new as ScanWithSave, ...prev].slice(0, 5))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profileIds.join(',')])

  const saveLead = async (scan: ScanWithSave) => {
    setScans(prev => prev.map(s => s.id === scan.id ? { ...s, saving: true } : s))
    await supabase.from('leads').insert({
      profile_id: scan.profile_id,
      scan_event_id: scan.id,
      saved_by_owner: true,
      tag: 'nuevo',
      name: null, email: null, phone: null, company: null, notes: null, consent: false,
    })
    setScans(prev => prev.map(s => s.id === scan.id ? { ...s, saving: false, saved: true } : s))
  }

  const dismiss = (id: string) => setScans(prev => prev.filter(s => s.id !== id))

  if (!scans.length) return (
    <div className="surface-card p-4 mb-6 text-center">
      <p className="text-subtle text-sm">Las notificaciones de escaneo en tiempo real aparecerán aquí.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-3 mb-6">
      {scans.map(scan => (
        <div key={scan.id} className="notification-scan flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {scan.referrer_type === 'nfc' ? '📡' : scan.referrer_type === 'qr' ? '◱' : '🔗'}
            </span>
            <div>
              <p className="text-pearl text-sm font-medium">
                {scan.city ? `📍 ${scan.city}` : '📍 Ubicación desconocida'}
                {scan.os && ` · ${scan.os}`}
                {scan.referrer_type && <span className="badge-nfc ml-2">{scan.referrer_type.toUpperCase()}</span>}
              </p>
              <p className="text-subtle text-xs">
                {new Date(scan.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          {scan.saved ? (
            <span className="text-gold text-xs">✓ Guardado</span>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => saveLead(scan)} disabled={scan.saving}
                className="btn-gold text-xs py-1 px-3">
                {scan.saving ? '...' : 'Guardar lead'}
              </button>
              <button onClick={() => dismiss(scan.id)}
                className="btn-ghost-gold text-xs py-1 px-3">
                Ignorar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
