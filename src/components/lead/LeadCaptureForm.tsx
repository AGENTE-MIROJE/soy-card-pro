'use client'
import { useState } from 'react'

interface Props { profileId: string; onClose: () => void }

export default function LeadCaptureForm({ profileId, onClose }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, profile_id: profileId, consent: true }),
    })
    setDone(true)
    setLoading(false)
    setTimeout(onClose, 2000)
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="bottom-sheet-handle" />

        {done ? (
          <div className="text-center py-6">
            <div className="text-gold text-4xl mb-3">✓</div>
            <p className="text-pearl font-semibold">¡Contacto compartido!</p>
            <p className="text-muted text-sm mt-1">El dueño de esta tarjeta recibirá tu información.</p>
          </div>
        ) : (
          <>
            <h2 className="text-pearl text-display text-lg font-bold text-center mb-2">
              Compartir tu contacto
            </h2>
            <p className="text-muted text-sm text-center mb-5">
              Deja tus datos para que puedan comunicarse contigo.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input className="input-gold" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Tu nombre" required />
              <input className="input-gold" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="Tu email" />
              <input className="input-gold" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="Tu teléfono / WhatsApp" />
              <input className="input-gold" value={form.company} onChange={e => set('company', e.target.value)}
                placeholder="Tu empresa (opcional)" />

              <p className="text-subtle text-xs text-center">
                Al enviar, consientes que el titular de esta tarjeta guarde tu información de contacto.
              </p>

              <button type="submit" disabled={loading} className="btn-gold py-3 mt-1">
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
