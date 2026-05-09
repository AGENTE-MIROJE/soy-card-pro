import { createClient } from '@/lib/supabase/server'
import MultiShareModal from '@/components/ui/MultiShareModal'

export default async function SharePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: account } = await supabase.from('user_accounts').select('id, username').eq('auth_id', user!.id).single()
  const { data: profiles } = await supabase
    .from('profiles').select('id, display_name, slug, title, company, avatar_url, is_active')
    .eq('user_id', account!.id).order('sort_order')

  return (
    <div className="max-w-lg mx-auto fade-in-up">
      <div className="mb-8">
        <h1 className="text-display text-pearl text-2xl">Compartir</h1>
        <p className="text-muted text-sm mt-1">Elige qué perfil(es) compartir ahora.</p>
      </div>
      <MultiShareModal profiles={profiles ?? []} username={account!.username} />
    </div>
  )
}
