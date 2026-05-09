'use client'
import { useEffect, useState } from 'react'
import type { Profile, SocialLink } from '@/lib/supabase/types'
import ShareModal from './ShareModal'
import LeadCaptureForm from '../lead/LeadCaptureForm'

// SVG icons per platform
function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    instagram: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    twitter:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    facebook: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    tiktok:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    youtube:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    github:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
    telegram: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    whatsapp: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    snapchat: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.017 0C8.396 0 8.025.015 6.785.073 5.548.131 4.67.333 3.9.63a5.945 5.945 0 00-2.15 1.4A5.95 5.95 0 00.352 4.18C.054 4.951-.147 5.83-.205 7.067-.263 8.307-.278 8.678-.278 12.3c0 3.621.015 3.992.073 5.232.058 1.237.26 2.116.557 2.887a5.945 5.945 0 001.4 2.15 5.95 5.95 0 002.15 1.397c.771.298 1.65.499 2.887.557C7.027 24.58 7.398 24.595 11.02 24.595c3.621 0 3.992-.015 5.232-.073 1.237-.058 2.116-.26 2.887-.557a5.945 5.945 0 002.15-1.397 5.95 5.95 0 001.397-2.15c.298-.771.499-1.65.557-2.887.058-1.24.073-1.611.073-5.232 0-3.622-.015-3.993-.073-5.233-.058-1.237-.26-2.116-.557-2.887A5.95 5.95 0 0021.289 2.03 5.945 5.945 0 0019.139.63C18.368.333 17.489.131 16.252.073 15.012.015 14.641 0 11.02 0h.997z"/></svg>,
    pinterest:<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
    spotify:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
    threads:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.893 1.761 1.024-.055 2.727-.396 3.042-3.815a11.65 11.65 0 0 0-2.28-.11z"/></svg>,
    twitch:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>,
    discord:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.112 18.102.13 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
  }
  return <span className="flex-shrink-0">{icons[platform] ?? <span className="text-sm">🔗</span>}</span>
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0077B5', instagram: '#E1306C', twitter: '#000000',
  facebook: '#1877F2', tiktok: '#010101',   youtube: '#FF0000',
  github:   '#333333', telegram: '#2AABEE', whatsapp: '#25D366',
  snapchat: '#FFFC00', pinterest: '#BD081C', spotify: '#1DB954',
  threads:  '#000000', twitch: '#9146FF',   discord: '#5865F2',
}

interface Props { profile: Profile; username: string; appUrl: string }

export default function PublicCardView({ profile, username, appUrl }: Props) {
  const [showShare, setShowShare] = useState(false)
  const [showLead, setShowLead]   = useState(false)
  const [scanned, setScanned]     = useState(false)

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

  const handleVCard    = () => { window.location.href = `/api/vcard/${profile.id}` }
  const handleWhatsApp = () => { const p = profile.phone?.replace(/\D/g, ''); if (p) window.open(`https://wa.me/${p}`) }
  const handleCall     = () => { if (profile.phone) window.location.href = `tel:${profile.phone}` }
  const handleEmail    = () => { if (profile.email) window.location.href = `mailto:${profile.email}` }

  const socials = Array.isArray(profile.social_links)
    ? (profile.social_links as SocialLink[]).filter(s => s.url?.trim())
    : []

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
            <h1 className="text-display text-gold text-2xl font-bold leading-tight mb-1">{profile.display_name}</h1>
            {profile.title   && <p className="text-gold-pearl text-sm font-medium">{profile.title}</p>}
            {profile.company && <p className="text-muted text-sm">{profile.company}</p>}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-muted text-sm text-center leading-relaxed mb-5 px-2">{profile.bio}</p>
          )}

          {/* Contacto */}
          <div className="flex flex-col gap-2 mb-5">
            {profile.phone && (
              <button onClick={handleCall} className="flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left"
                style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)' }}>
                <span className="text-gold text-lg">📞</span>
                <span className="text-pearl text-sm">{profile.phone}</span>
              </button>
            )}
            {profile.email && (
              <button onClick={handleEmail} className="flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left"
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
                <span className="text-pearl text-sm">{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Redes sociales — TODAS en grid */}
          {socials.length > 0 && (
            <div className="mb-5">
              <p className="text-muted text-xs uppercase tracking-widest text-center mb-3">Redes sociales</p>
              <div className="grid grid-cols-2 gap-2">
                {socials.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: 'var(--black-surface)',
                      border: `1px solid ${PLATFORM_COLORS[s.platform] ?? 'var(--black-border)'}22`,
                      textDecoration: 'none',
                    }}>
                    <span style={{ color: PLATFORM_COLORS[s.platform] ?? 'var(--gold-matte)' }}>
                      <SocialIcon platform={s.platform} />
                    </span>
                    <span className="text-pearl text-xs font-medium capitalize truncate">{s.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button onClick={handleVCard} className="btn-gold w-full py-3 text-sm">⭐ Guardar contacto</button>
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

        <p className="text-center text-subtle text-xs">Powered by <span className="text-gold">SOY_CARD_PRO</span></p>
      </div>

      {showShare && <ShareModal profile={profile} username={username} appUrl={appUrl} onClose={() => setShowShare(false)} />}
      {showLead  && <LeadCaptureForm profileId={profile.id} ownerName={profile.display_name} onClose={() => setShowLead(false)} />}
    </main>
  )
}
