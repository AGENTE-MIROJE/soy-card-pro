'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Profile, SocialLink } from '@/lib/supabase/types'
import ShareModal from './ShareModal'
import LeadCaptureForm from '../lead/LeadCaptureForm'

const SOCIAL_ICONS: Record<string, string> = {
  linkedin: '💼', instagram: '📸', twitter: '𝕏', facebook: '𝑓',
  tiktok: '♪', youtube: '▶', github: '⌨', telegram: '✈', whatsapp: '💬',
}

interface Props { profile: Profile; username: string; appUrl: string }

export default function PublicCardView({ profile, username, appUrl }: Props) {
  const [showShare, setShowShare]   = useState(false)
  const [showLead, setShowLead]     = useState(false)
  const [scanned, setScanned]       = useState(false)

  // Registrar el escaneo al cargar
  useEffect(() => {
    if (scanned) return
    setScanned(true)
    const params = new URLSearchParams(window.location.search)
    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profile.id,
        referrer: document.referrer,
        via: params.get('via') ?? 'direct',
        ua: navigator.userAgent,
      }),
    }).catch(() => {})
  }, [])

  const handleVCard = () => {
    window.location.href = `/api/vcard/${profile.id}`
  }

  const handleWhatsApp = () => {
    const phone = profile.phone?.replace(/\D/g, '')
    if (phone) window.open(`https://wa.me/${phone}`)
  }

  const handleCall = () => {
    if (profile.phone) window.location.href = `tel:${profile.phone}`
  }

  const handleEmail = () => {
    if (profile.email) window.location.href = `mailto:${profile.email}`
  }

  const socials = (profile.social_links as SocialLink[]) ?? []

  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh' }}
      className="flex flex-col items-center justify-start pt-8 pb-16 px-4">
      <div className="w-full max-w-sm fade-in-up">

        {/* Card principal */}
        <div className="glass-card shimmer-border p-7 mb-5" style={{ borderColor: 'var(--gold-border)' }}>

          {/* Avatar */}
          <div className="flex justify-center mb-5">
            <div className="avatar-gold-ring" style={{ width: 90, height: 90 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name}
                  className="rounded-full object-cover" style={{ width: 90, height: 90 }} />
              ) : (
                <div className="rounded-full flex items-center justify-center text-gold font-bold text-3xl"
                  style={{ width: 90, height: 90, background: 'var(--black-surface)' }}>
                  {profile.display_name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Nombre + cargo */}
          <div className="text-center mb-5">
            <h1 className="text-display text-gold text-2xl font-bold leading-tight mb-1">
              {profile.display_name}
            </h1>
            {profile.title && (
              <p className="text-gold-pearl text-sm font-medium">{profile.title}</p>
            )}
            {profile.company && (
              <p className="text-muted text-sm">{profile.company}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-muted text-sm text-center leading-relaxed mb-5 px-2">
              {profile.bio}
            </p>
          )}

          {/* Datos de contacto */}
          <div className="flex flex-col gap-2 mb-5">
            {profile.phone && (
              <button onClick={handleCall}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)' }}>
                <span className="text-gold text-lg">📞</span>
                <span className="text-pearl text-sm">{profile.phone}</span>
              </button>
            )}
            {profile.email && (
              <button onClick={handleEmail}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)' }}>
                <span className="text-gold text-lg">✉</span>
                <span className="text-pearl text-sm">{profile.email}</span>
              </button>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)', textDecoration: 'none' }}>
                <span className="text-gold text-lg">🔗</span>
                <span className="text-pearl text-sm">{profile.website.replace('https://', '').replace('http://', '')}</span>
              </a>
            )}
          </div>

          {/* Redes sociales */}
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="btn-icon px-4 py-2 text-sm" style={{ textDecoration: 'none' }}>
                  <span>{SOCIAL_ICONS[s.platform] ?? '🔗'}</span>
                  <span className="capitalize">{s.platform}</span>
                </a>
              ))}
            </div>
          )}

          {/* CTAs principales */}
          <div className="flex flex-col gap-3">
            <button onClick={handleVCard} className="btn-gold w-full py-3 text-sm">
              ⭐ Guardar contacto
            </button>
            {profile.phone && (
              <button onClick={handleWhatsApp} className="btn-icon w-full py-3 text-sm"
                style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                <span>💬</span> Escribir por WhatsApp
              </button>
            )}
            <button onClick={() => setShowLead(true)} className="btn-ghost-gold w-full py-3 text-sm">
              📤 Compartir mi contacto también
            </button>
          </div>
        </div>

        {/* Botones secundarios */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => setShowShare(true)}
            className="btn-icon flex-1 py-3 text-xs" style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
            <span>◱</span> QR / Compartir
          </button>
          <a href={`/${username}`} className="btn-icon flex-1 py-3 text-xs"
            style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', textDecoration: 'none' }}>
            <span>◈</span> Más perfiles
          </a>
        </div>

        <p className="text-center text-subtle text-xs">
          Powered by <span className="text-gold">SOY_CARD_PRO</span>
        </p>
      </div>

      {/* Modals */}
      {showShare && (
        <ShareModal
          profile={profile}
          username={username}
          appUrl={appUrl}
          onClose={() => setShowShare(false)}
        />
      )}
      {showLead && (
        <LeadCaptureForm
          profileId={profile.id}
          onClose={() => setShowLead(false)}
        />
      )}
    </main>
  )
}
