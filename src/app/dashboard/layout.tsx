import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: account } = await supabase
    .from('user_accounts')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--black-deep)' }}>
      <DashboardSidebar account={account} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
