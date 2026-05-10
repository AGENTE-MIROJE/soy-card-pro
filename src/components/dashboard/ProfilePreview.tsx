'use client'

interface SocialLink { platform: string; url: string }

interface PreviewData {
  display_name: string
  title: string
  company: string
  bio: string
  phone: string
  email: string
  website: string
  avatar_url: string
  socials: SocialLink[]
}

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: 'in', instagram: '◎', twitter: '𝕏', facebook: 'f',
  tiktok: '♪', youtube: '▶', github: '⌥', telegram: '✈',
  whatsapp: '◉', snapchat: '👻', pinterest: '◈', spotify: '♫',
  threads: '@', bereal: '◌', twitch: '◈', discord: '◎',
}

export default function ProfilePreview({ data }: { data: PreviewData }) {
  const hasSocials = data.socials.filter(s => s.url.trim()).length > 0

  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="text-center text-subtle text-[10px] uppercase tracking-widest mb-3">Vista previa en vivo</p>

      {/* Card shell */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--black-card)', border: '1px solid var(--gold-border)' }}>

        {/* Cover gradient */}
        <div style={{ height: 80, background: 'linear-gradient(135deg, #0D0D12 0%, #1a1505 50%, #0D0D12 100%)' }}>
          <div style={{ height: '100%', background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(201,168,76,0.04) 10px, rgba(201,168,76,0.04) 11px)' }} />
        </div>

        {/* Avatar */}
        <div className="relative px-5 pb-0" style={{ marginTop: -36 }}>
          <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ width: 72, height: 72, border: '3px solid var(--gold-matte)', background: 'var(--black-surface)' }}>
            {data.avatar_url
              ? <img src={data.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-gold font-bold text-2xl">
                  {data.display_name ? data.display_name[0].toUpperCase() : '?'}
                </span>
            }
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-3 pb-4">
          <h2 className="text-pearl font-bold text-lg leading-tight">
            {data.display_name || <span className="text-subtle italic">Nombre visible</span>}
          </h2>

          {(data.title || data.company) && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--gold-matte)' }}>
              {[data.title, data.company].filter(Boolean).join(' · ')}
            </p>
          )}

          {data.bio && (
            <p className="text-muted text-sm mt-2 leading-relaxed line-clamp-3">{data.bio}</p>
          )}

          {/* Action buttons preview */}
          <div className="flex flex-wrap gap-2 mt-4">
            {data.phone && (
              <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'var(--gold-glass)', color: 'var(--gold-matte)', border: '1px solid var(--gold-border)' }}>
                Llamar
              </span>
            )}
            {data.phone && (
              <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'var(--gold-glass)', color: 'var(--gold-matte)', border: '1px solid var(--gold-border)' }}>
                WhatsApp
              </span>
            )}
            {data.email && (
              <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'var(--gold-glass)', color: 'var(--gold-matte)', border: '1px solid var(--gold-border)' }}>
                Email
              </span>
            )}
          </div>

          {/* Social icons */}
          {hasSocials && (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.socials.filter(s => s.url.trim()).map((s, i) => (
                <span key={i} className="text-xs w-8 h-8 flex items-center justify-center rounded-full font-bold"
                  style={{ background: 'var(--black-surface)', color: 'var(--gold-pearl)', border: '1px solid var(--black-border)' }}>
                  {PLATFORM_ICONS[s.platform] ?? s.platform[0].toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 flex justify-between items-center"
          style={{ borderTop: '1px solid var(--black-border)' }}>
          <span className="text-subtle text-[10px]">soy-card-pro.vercel.app</span>
          <span className="text-gold text-[10px] font-bold tracking-wider">SOY_CARD_PRO</span>
        </div>
      </div>
    </div>
  )
}
