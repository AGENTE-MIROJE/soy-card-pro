'use client'
import { useState, useEffect } from 'react'
import { savePendingLead } from '@/lib/offline-db'

interface Props { profileId: string; ownerName?: string; onClose: () => void }

export default function LeadCaptureForm({ profileId, ownerName, onClose }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [offline, setOffline] = useState(false)
  const [contactPickerSupported, setContactPickerSupported] = useState(false)
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      setContactPickerSupported(true)
    }
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const importFromContacts = async () => {
    try {
      const contacts = await (navigator as any).contacts.select(
        ['name', 'email', 'tel', 'organization'],
        { multiple: false }
      )
      if (contacts?.length) {
        const c = contacts[0]
        setForm(f => ({
          ...f,
          name: c.name?.[0] ?? f.name,
          email: c.email?.[0] ?? f.email,
          phone: c.tel?.[0] ?? f.phone,
          company: c.organization?.[0] ?? f.company,
        }))
      }
    } catch {
      // User cancelled or permission denied — no action needed
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) return
    setLoading(true)

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, profile_id: profileId, consent: true }),
      })

      if (!res.ok) throw new Error('Network response was not ok')

      setDone(true)
      setLoading(false)
      setTimeout(onClose, 2500)
    } catch (err) {
      // Network error — save lead offline
      try {
        await savePendingLead({
          profile_id: profileId,
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          company: form.company || undefined,
          message: form.message || undefined,
          consent: true,
        })

        // Try to register background sync
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const reg = await navigator.serviceWorker.ready
          try {
            await (reg as any).sync.register('sync-leads')
          } catch {
            // Sync registration failed, but lead is saved locally
          }
        }

        setOffline(true)
        setDone(true)
        setLoading(false)
        setTimeout(onClose, 2500)
      } catch {
        setLoading(false)
        alert('Error al guardar. Por favor intenta nuevamente.')
      }
    }
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="bottom-sheet-handle" />

        {done ? (
          <div className="text-center py-8">
            <div className="text-gold text-5xl mb-4">✓</div>
            <p className="text-pearl font-semibold text-lg">
              {offline ? '¡Contacto guardado!' : '¡Contacto compartido!'}
            </p>
            <p className="text-muted text-sm mt-2">
              {offline
                ? 'Tu información se sincronizará cuando vuelva la conexión.'
                : ownerName
                  ? `${ownerName} recibirá tu información.`
                  : 'El titular recibirá tu información.'}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-pearl text-display text-lg font-bold text-center mb-1">
              Compartir tu contacto
            </h2>
            {ownerName && (
              <p className="text-gold text-sm text-center mb-4">con {ownerName}</p>
            )}

            {/* Botón Contact Picker (solo en Chrome Android / Safari iOS) */}
            {contactPickerSupported && (
              <button type="button" onClick={importFromContacts}
                className="w-full btn-ghost-gold text-sm py-3 mb-4 flex items-center justify-center gap-2">
                <span>📱</span>
                <span>Importar desde mis contactos</span>
              </button>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input className="input-gold" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Tu nombre completo" required
                autoComplete="name" />
              <input className="input-gold" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="Tu email"
                autoComplete="email" />
              <input className="input-gold" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="Tu teléfono / WhatsApp"
                autoComplete="tel" />
              <input className="input-gold" value={form.company} onChange={e => set('company', e.target.value)}
                placeholder="Tu empresa (opcional)"
                autoComplete="organization" />
              <textarea className="input-gold" rows={2} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Mensaje (opcional)" />

              {/* Consentimiento explícito */}
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ accentColor: 'var(--gold-matte)', width: 16, height: 16 }} />
                <span className="text-subtle text-xs leading-relaxed">
                  Consiento que {ownerName ?? 'el titular'} guarde mi información de contacto y me contacte.
                </span>
              </label>

              <button type="submit" disabled={loading || !consent || !form.name.trim()}
                className="btn-gold py-3 mt-1 disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'Enviando...' : 'Enviar mi contacto'}
              </button>
              <button type="button" onClick={onClose} className="btn-ghost-gold py-3">
                Cancelar
              </button>
            </form>
          </>
        )}
      </div>
    </>
  )
}
