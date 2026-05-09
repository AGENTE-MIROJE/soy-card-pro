'use client'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'

export default function ProfileCardDash({ profile, username }: { profile: Profile; username: string }) {
  const [active, setActive] = useState(profile.is_active)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://soycardpro.vercel.app'

  const toggle = async () => {
    setLoading(true)
    await supabase.from('profiles').update({ is_active: !active }).eq('id', profile.id)
    setActive(!active)
    setLoading(false)
    router.refresh()
  }

  const profileUrl = `${appUrl}/${username}/${profile.slug}`

  return (
    <div className={`surface-card p-5 flex items-center gap-5 transition-all ${active ? '' : 'opacity-50'}`}>
      {/* Avatar */}
      <div className="avatar-gold-ring flex-shrink-0" style={{ width: 52, height: 52 }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.display_name}
            className="rounded-full object-cover" style={{ width: 52, height: 52 }} />
        ) : (
          <div className="rounded-full flex items-center justify-center text-gold font-bold text-xl"
            style={{ width: 52, height: 52, background: 'var(--black-surface)' }}>
            {profile.display_name[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-pearl font-semibold truncate">{profile.display_name}</span>
          {!active && <span className="badge-link">inactivo</span>}
        </div>
        {profile.title && <p className="text-gold-pearl text-sm truncate">{profile.title}{profile.company ? ` · ${profile.company}` : ''}</p>}
        <p className="text-subtle text-xs mt-1 truncate">/{username}/{profile.slug}</p>
      </div>

      {/* Stats */}
      <div className="text-center hidden sm:block px-4">
        <div className="text-gold font-bold text-lg">{profile.views_count}</div>
        <div className="text-subtle text-xs">vistas</div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <a href={profileUrl} target="_blank" className="btn-icon text-xs" title="Ver tarjeta">
          <span>↗</span>
        </a>
        <button onClick={toggle} disabled={loading}
          className={`btn-icon text-xs ${active ? 'border-green-800 text-green-400' : ''}`}
          title={active ? 'Desactivar' : 'Activar'}>
          <span>{active ? '●' : '○'}</span>
        </button>
        <Link href={`/dashboard/profiles/${profile.id}`} className="btn-ghost-gold text-xs py-2 px-4" style={{ textDecoration: 'none' }}>
          Editar
        </Link>
      </div>
    </div>
  )
}
