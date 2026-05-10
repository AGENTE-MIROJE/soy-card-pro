import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import MobileBottomNav from '@/components/dashboard/MobileBottomNav'

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
      <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      <MobileBottomNav isAdmin={account?.is_admin ?? false} />
    </div>
  )
}
