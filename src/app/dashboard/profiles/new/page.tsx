import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileForm from '@/components/dashboard/ProfileForm'

export default async function NewProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: account } = await supabase
    .from('user_accounts').select('id, plan').eq('auth_id', user!.id).single()
  const { count } = await supabase
    .from('profiles').select('id', { count: 'exact', head: true }).eq('user_id', account!.id)

  const isFree = account?.plan === 'free'
  const profileCount = count ?? 0

  if (isFree && profileCount >= 1) {
    return (
      <div className="max-w-2xl mx-auto fade-in-up">
        <div className="glass-card shimmer-border p-10 text-center">
          <div className="text-5xl mb-5">✦</div>
          <h1 className="text-display text-pearl text-2xl mb-3">Perfil adicional bloqueado</h1>
          <p className="text-muted mb-6 leading-relaxed">
            Tu plan gratuito incluye <strong className="text-pearl">1 perfil</strong>.
            Actualiza a <strong className="text-gold">Pro</strong> para crear perfiles ilimitados
            y acceder a NFC, Google Wallet y CRM avanzado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/upgrade" className="btn-gold px-8 py-3" style={{ textDecoration: 'none' }}>
              Ver planes Pro
            </Link>
            <Link href="/dashboard/profiles" className="btn-ghost-gold px-8 py-3" style={{ textDecoration: 'none' }}>
              Mis perfiles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto fade-in-up">
      <div className="mb-8">
        <h1 className="text-display text-pearl text-2xl">Nuevo Perfil</h1>
        <p className="text-muted text-sm mt-1">Cada perfil es una tarjeta diferente que puedes compartir.</p>
      </div>
      <ProfileForm userId={account!.id} />
    </div>
  )
}
