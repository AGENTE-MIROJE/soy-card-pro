import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/ProfileForm'

export default async function NewProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: account } = await supabase.from('user_accounts').select('id').eq('auth_id', user!.id).single()

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
