import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/ProfileForm'
import { notFound } from 'next/navigation'

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: account } = await supabase.from('user_accounts').select('id').eq('auth_id', user!.id).single()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).eq('user_id', account!.id).single()
  if (!profile) notFound()

  return (
    <div className="max-w-2xl mx-auto fade-in-up">
      <div className="mb-8">
        <h1 className="text-display text-pearl text-2xl">Editar: {profile.display_name}</h1>
        <p className="text-muted text-sm mt-1">Los cambios se reflejan instantáneamente en tu tarjeta.</p>
      </div>
      <ProfileForm userId={account!.id} profile={profile} />
    </div>
  )
}
