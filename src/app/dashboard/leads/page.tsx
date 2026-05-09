import { createClient } from '@/lib/supabase/server'
import LeadsTable from '@/components/dashboard/LeadsTable'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: account } = await supabase.from('user_accounts').select('id').eq('auth_id', user!.id).single()
  const { data: profiles } = await supabase.from('profiles').select('id, display_name').eq('user_id', account!.id)
  const profileIds = profiles?.map(p => p.id) ?? []

  const { data: leads } = await supabase
    .from('leads').select('*, profiles(display_name, slug)')
    .in('profile_id', profileIds)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto fade-in-up">
      <div className="mb-8">
        <h1 className="text-display text-pearl text-2xl">Leads</h1>
        <p className="text-muted text-sm mt-1">{leads?.length ?? 0} contactos capturados.</p>
      </div>
      <div className="surface-card p-0 overflow-hidden">
        <LeadsTable leads={leads ?? []} />
      </div>
    </div>
  )
}
