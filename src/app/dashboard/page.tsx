import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ScanNotifications from '@/components/lead/ScanNotifications'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: account } = await supabase
    .from('user_accounts').select('id, username, full_name').eq('auth_id', user!.id).single()

  // Stats
  const { data: profiles } = await supabase
    .from('profiles').select('id').eq('user_id', account!.id).eq('is_active', true)

  const profileIds = profiles?.map(p => p.id) ?? []

  const today = new Date(); today.setHours(0,0,0,0)

  const [{ count: totalScans }, { count: totalLeads }, { count: todayScans }] = await Promise.all([
    supabase.from('scan_events').select('*', { count: 'exact', head: true })
      .in('profile_id', profileIds),
    supabase.from('leads').select('*', { count: 'exact', head: true })
      .in('profile_id', profileIds),
    supabase.from('scan_events').select('*', { count: 'exact', head: true })
      .in('profile_id', profileIds).gte('created_at', today.toISOString()),
  ])

  // Últimos 5 leads
  const { data: recentLeads } = await supabase
    .from('leads').select('*')
    .in('profile_id', profileIds)
    .order('created_at', { ascending: false }).limit(5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const name = account?.full_name?.split(' ')[0] ?? 'Carlos'

  return (
    <div className="max-w-5xl mx-auto fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display text-pearl text-2xl">{greeting}, {name}.</h1>
        <p className="text-muted text-sm mt-1">
          {account?.username && (
            <span>Tu link: <a
              href={`/${account.username}`} target="_blank"
              className="text-gold-pearl hover:text-gold transition-colors">
              {(process.env.NEXT_PUBLIC_APP_URL ?? 'https://soy-card-pro.vercel.app').replace('https://', '')}/{account.username}
            </a></span>
          )}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="text-muted text-xs uppercase tracking-widest mb-2">Escaneos totales</div>
          <div className="stat-number glow-pulse">{totalScans ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="text-muted text-xs uppercase tracking-widest mb-2">Leads capturados</div>
          <div className="stat-number glow-pulse">{totalLeads ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="text-muted text-xs uppercase tracking-widest mb-2">Perfiles activos</div>
          <div className="stat-number glow-pulse">{profileIds.length}</div>
        </div>
      </div>

      {/* Notificaciones en tiempo real */}
      {profileIds.length > 0 && (
        <ScanNotifications profileIds={profileIds} />
      )}

      {/* Últimos leads */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gold text-sm font-semibold uppercase tracking-widest">Leads recientes</h2>
          <Link href="/dashboard/leads" className="text-gold-pearl text-xs hover:text-gold transition-colors">
            Ver todos →
          </Link>
        </div>
        {!recentLeads?.length ? (
          <p className="text-subtle text-sm py-4 text-center">Aún no hay leads. Comparte tu tarjeta para empezar.</p>
        ) : (
          <table className="table-premium">
            <thead>
              <tr><th>Nombre</th><th>Contacto</th><th>Tag</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead.id}>
                  <td className="text-pearl">{lead.name ?? '—'}</td>
                  <td className="text-muted text-xs">{lead.email ?? lead.phone ?? '—'}</td>
                  <td><span className="badge-nfc">{lead.tag}</span></td>
                  <td className="text-subtle text-xs">{new Date(lead.created_at).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick actions */}
      {profileIds.length === 0 && (
        <div className="mt-6 glass-card shimmer-border p-8 text-center">
          <p className="text-gold text-lg font-semibold mb-2">Crea tu primer perfil</p>
          <p className="text-muted text-sm mb-6">Define tu identidad digital en menos de 2 minutos.</p>
          <Link href="/dashboard/profiles/new" className="btn-gold" style={{ textDecoration: 'none' }}>
            + Crear perfil ahora
          </Link>
        </div>
      )}
    </div>
  )
}
