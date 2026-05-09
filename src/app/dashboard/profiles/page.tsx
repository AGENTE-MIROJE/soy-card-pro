import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProfileCardDash from '@/components/dashboard/ProfileCardDash'

export default async function ProfilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: account } = await supabase.from('user_accounts').select('id, username').eq('auth_id', user!.id).single()
  const { data: profiles } = await supabase
    .from('profiles').select('*').eq('user_id', account!.id).order('sort_order')

  return (
    <div className="max-w-4xl mx-auto fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display text-pearl text-2xl">Mis Perfiles</h1>
          <p className="text-muted text-sm mt-1">Cada perfil es una tarjeta diferente que puedes compartir.</p>
        </div>
        <Link href="/dashboard/profiles/new" className="btn-gold" style={{ textDecoration: 'none' }}>
          + Nuevo perfil
        </Link>
      </div>

      {!profiles?.length ? (
        <div className="glass-card shimmer-border p-12 text-center">
          <div className="text-4xl mb-4">◈</div>
          <p className="text-pearl font-semibold mb-2">Sin perfiles aún</p>
          <p className="text-muted text-sm mb-6">Crea tu primer perfil para empezar a compartir tu identidad digital.</p>
          <Link href="/dashboard/profiles/new" className="btn-gold" style={{ textDecoration: 'none' }}>
            Crear primer perfil
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {profiles.map(profile => (
            <ProfileCardDash key={profile.id} profile={profile} username={account!.username} />
          ))}
        </div>
      )}
    </div>
  )
}
