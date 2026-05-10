import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'hoy'
  if (d === 1) return 'ayer'
  return `hace ${d} días`
}

export default async function AdminPage() {
  // Auth check via session client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('user_accounts').select('is_admin').eq('auth_id', user.id).single()
  if (!me?.is_admin) redirect('/dashboard')

  // Data queries via service role (bypasses RLS)
  const svc = createServiceClient()

  const [
    { data: users },
    { count: totalUsers },
    { count: totalProfiles },
    { count: totalLeads },
    { count: totalScans },
  ] = await Promise.all([
    svc.from('user_accounts').select('id, username, full_name, plan, is_admin, created_at').order('created_at', { ascending: false }),
    svc.from('user_accounts').select('id', { count: 'exact', head: true }),
    svc.from('profiles').select('id', { count: 'exact', head: true }),
    svc.from('leads').select('id', { count: 'exact', head: true }),
    svc.from('scan_events').select('id', { count: 'exact', head: true }),
  ])

  // Users registered in last 7 and 30 days
  const now = Date.now()
  const week = 7 * 86400000
  const month = 30 * 86400000
  const newThisWeek = users?.filter(u => now - new Date(u.created_at).getTime() < week).length ?? 0
  const newThisMonth = users?.filter(u => now - new Date(u.created_at).getTime() < month).length ?? 0

  // Per-user profile counts
  const { data: profileCounts } = await svc
    .from('profiles').select('user_id')
  const pcMap: Record<string, number> = {}
  profileCounts?.forEach(p => { pcMap[p.user_id] = (pcMap[p.user_id] ?? 0) + 1 })

  const kpis = [
    { label: 'Usuarios totales', value: totalUsers ?? 0, sub: `+${newThisWeek} esta semana` },
    { label: 'Nuevos este mes', value: newThisMonth, sub: `últimos 30 días` },
    { label: 'Perfiles creados', value: totalProfiles ?? 0, sub: `promedio ${((totalProfiles ?? 0) / Math.max(totalUsers ?? 1, 1)).toFixed(1)} por usuario` },
    { label: 'Leads capturados', value: totalLeads ?? 0, sub: `${totalScans ?? 0} escaneos totales` },
  ]

  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh' }} className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="badge-nfc text-xs py-1 px-3">Admin</span>
              <span className="text-display text-gold text-xl tracking-widest">SOY_CARD_PRO</span>
            </div>
            <h1 className="text-pearl text-2xl font-semibold">Panel de Administración</h1>
            <p className="text-subtle text-sm mt-1">Base de datos del negocio · Actualizado en tiempo real</p>
          </div>
          <Link href="/dashboard" className="btn-ghost-gold text-xs py-2 px-4" style={{ textDecoration: 'none' }}>
            ← Mi dashboard
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {kpis.map((k, i) => (
            <div key={i} className="surface-card p-5" style={{ borderColor: 'var(--black-border)' }}>
              <div className="text-display text-gold text-3xl font-bold mb-1">{k.value}</div>
              <div className="text-pearl text-sm font-medium mb-1">{k.label}</div>
              <div className="text-subtle text-xs">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* User table */}
        <div className="surface-card" style={{ borderColor: 'var(--black-border)' }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--black-border)' }}>
            <h2 className="text-pearl font-semibold">Usuarios registrados</h2>
            <span className="text-subtle text-xs">{users?.length ?? 0} en total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--black-border)' }}>
                  {['Usuario', 'Nombre', 'Plan', 'Perfiles', 'Registrado', 'Hace'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-subtle text-xs uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users?.map((u, i) => (
                  <tr key={u.id}
                    style={{ borderBottom: i < (users.length - 1) ? '1px solid var(--black-border)' : 'none' }}
                    className="hover:bg-black-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-pearl font-medium">@{u.username}</span>
                        {u.is_admin && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'var(--gold-glass)', color: 'var(--gold-matte)', border: '1px solid var(--gold-border)', fontSize: 10 }}>
                            admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: u.plan === 'free' ? 'var(--black-surface)' : 'var(--gold-glass)',
                          color: u.plan === 'free' ? 'var(--pearl-muted)' : 'var(--gold-matte)',
                          border: `1px solid ${u.plan === 'free' ? 'var(--black-border)' : 'var(--gold-border)'}`,
                        }}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted">{pcMap[u.id] ?? 0}</td>
                    <td className="px-4 py-3 text-subtle text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-subtle text-xs">{daysAgo(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-subtle text-xs text-center mt-8">
          Panel de administración privado · Solo visible para admins · soy-card-pro.vercel.app/admin
        </p>
      </div>
    </main>
  )
}
