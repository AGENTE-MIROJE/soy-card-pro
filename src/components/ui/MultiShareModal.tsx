'use client'
import { useState } from 'react'
import type { Profile } from '@/lib/supabase/types'

interface MiniProfile { id: string; display_name: string; slug: string; title?: string|null; company?: string|null; avatar_url?: string|null; is_active: boolean }

export default function MultiShareModal({ profiles, username }: { profiles: MiniProfile[]; username: string }) {
  const [selected, setSelected] = useState<string[]>(profiles.filter(p => p.is_active).map(p => p.id))
  const [copied, setCopied] = useState(false)
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://soycardpro.vercel.app'

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const selectAll = () => setSelected(profiles.map(p => p.id))
  const clearAll  = () => setSelected([])

  const getShareUrl = () => {
    if (selected.length === 1) {
      const p = profiles.find(x => x.id === selected[0])
      return p ? `${appUrl}/${username}/${p.slug}?via=link` : `${appUrl}/${username}`
    }
    return `${appUrl}/${username}?via=link`
  }

  const shareUrl = getShareUrl()

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const shareNative = async () => {
    if (navigator.share) { await navigator.share({ url: shareUrl }) } else copy()
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Selector */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted text-xs uppercase tracking-widest">Selecciona perfiles</span>
          <div className="flex gap-3">
            <button onClick={selectAll} className="text-gold text-xs">Todos</button>
            <button onClick={clearAll} className="text-subtle text-xs">Ninguno</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {profiles.map(p => (
            <button key={p.id} onClick={() => toggle(p.id)}
              className="flex items-center gap-4 p-3 rounded-xl text-left transition-all"
              style={{
                background: selected.includes(p.id) ? 'var(--gold-glass)' : 'var(--black-surface)',
                border: `1px solid ${selected.includes(p.id) ? 'var(--gold-border)' : 'var(--black-border)'}`,
              }}>
              {/* Checkbox */}
              <div className={`checkbox-gold flex-shrink-0 ${selected.includes(p.id) ? 'checked' : ''}`}>
                {selected.includes(p.id) && <span style={{ color: 'var(--black-deep)', fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              {/* Avatar */}
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={p.display_name}
                  className="rounded-full object-cover flex-shrink-0" style={{ width: 38, height: 38 }} />
              ) : (
                <div className="rounded-full flex items-center justify-center text-gold font-bold flex-shrink-0"
                  style={{ width: 38, height: 38, background: 'var(--black-card)', border: '1px solid var(--black-border)' }}>
                  {p.display_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-pearl text-sm font-medium truncate">{p.display_name}</div>
                {p.title && <div className="text-muted text-xs truncate">{p.title}{p.company ? ` · ${p.company}` : ''}</div>}
              </div>
              {!p.is_active && <span className="badge-link flex-shrink-0">inactivo</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Preview URL */}
      <div className="flex items-center gap-3 p-4 rounded-xl"
        style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)' }}>
        <span className="text-subtle text-xs truncate flex-1">{shareUrl}</span>
        <button onClick={copy} className="text-gold text-xs flex-shrink-0">{copied ? '✓ Copiado' : 'Copiar'}</button>
      </div>

      {/* Botones de compartir */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={shareNative} className="btn-gold py-3 text-sm">
          ↑ Compartir ahora
        </button>
        <button onClick={handleWhatsApp} className="btn-ghost-gold py-3 text-sm">
          💬 WhatsApp
        </button>
      </div>

      {/* QR del perfil seleccionado */}
      {selected.length === 1 && (
        <div className="surface-card p-5 flex flex-col items-center gap-3">
          <span className="text-muted text-xs uppercase tracking-widest">QR para este perfil</span>
          <div className="p-4 rounded-2xl" style={{ background: 'var(--black-deep)', border: '1px solid var(--gold-border)' }}>
            <img src={`/api/qr/${selected[0]}?via=qr`} alt="QR" width={180} height={180} className="rounded-xl" />
          </div>
          <p className="text-subtle text-xs">Muestra este QR para que te escaneen</p>
        </div>
      )}
    </div>
  )
}
