'use client'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'

export default function ProfileCardDash({ profile, username }: { profile: Profile; username: string }) {
  const [active, setActive] = useState(profile.is_active)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://soy-card-pro.vercel.app'

  const toggle = async () => {
    setLoading(true)
    await supabase.from('profiles').update({ is_active: !active }).eq('id', profile.id)
    setActive(!active)
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setDeleting(true)
    // Borrar leads y escaneos del perfil primero, luego el perfil
    await supabase.from('leads').delete().eq('profile_id', profile.id)
    await supabase.from('scan_events').delete().eq('profile_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)
    router.refresh()
  }

  const profileUrl = `${appUrl}/${username}/${profile.slug}`

  return (
    <>
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
          <button onClick={() => setConfirmDelete(true)}
            className="btn-icon text-xs text-red-400 border-red-900"
            title="Eliminar perfil">
            <span>🗑</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setConfirmDelete(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm p-6 rounded-2xl flex flex-col gap-4"
              style={{ background: 'var(--black-card)', border: '1px solid var(--gold-border)' }}>
              <h3 className="text-pearl font-bold text-lg">¿Eliminar perfil?</h3>
              <p className="text-muted text-sm">
                Se eliminará <strong className="text-gold">{profile.display_name}</strong> y todos sus leads y escaneos. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors"
                  style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }}>
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 btn-ghost-gold py-3">
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
