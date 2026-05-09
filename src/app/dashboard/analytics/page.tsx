import { createClient } from '@/lib/supabase/server'
import AnalyticsResetButton from '@/components/dashboard/AnalyticsResetButton'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: account } = await supabase.from('user_accounts').select('id').eq('auth_id', user!.id).single()
  const { data: profiles } = await supabase.from('profiles').select('id, display_name').eq('user_id', account!.id)
  const profileIds = profiles?.map(p => p.id) ?? []

  // Escaneos por día (últimos 7 días)
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentScans } = await supabase
    .from('scan_events').select('created_at, referrer_type, country, city, device_type')
    .in('profile_id', profileIds).gte('created_at', since7).order('created_at', { ascending: false })

  // Agrupar por día
  const byDay: Record<string, number> = {}
  const bySource: Record<string, number> = {}
  const byDevice: Record<string, number> = {}
  const byCountry: Record<string, number> = {}

  recentScans?.forEach(s => {
    const day = s.created_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
    const src = s.referrer_type ?? 'direct'
    bySource[src] = (bySource[src] ?? 0) + 1
    const dev = s.device_type ?? 'unknown'
    byDevice[dev] = (byDevice[dev] ?? 0) + 1
    if (s.country) byCountry[s.country] = (byCountry[s.country] ?? 0) + 1
  })

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    return { label: d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }), count: byDay[key] ?? 0 }
  })
  const maxDay = Math.max(...days.map(d => d.count), 1)

  return (
    <div className="max-w-4xl mx-auto fade-in-up">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-display text-pearl text-2xl">Analítica</h1>
          <p className="text-muted text-sm mt-1">Últimos 7 días de actividad.</p>
        </div>
        <AnalyticsResetButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Escaneos por día */}
        <div className="surface-card p-6">
          <h2 className="text-gold text-sm font-semibold uppercase tracking-widest mb-5">Escaneos por día</h2>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="rounded-sm w-full transition-all" style={{
                  height: `${(d.count / maxDay) * 100}px`,
                  minHeight: d.count > 0 ? 4 : 2,
                  background: d.count > 0 ? 'var(--gold-matte)' : 'var(--black-border)',
                }} />
                <span className="text-subtle text-xs">{d.count}</span>
                <span className="text-subtle" style={{ fontSize: 9 }}>{d.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fuentes */}
        <div className="surface-card p-6">
          <h2 className="text-gold text-sm font-semibold uppercase tracking-widest mb-5">Por canal</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(bySource).sort((a,b)=>b[1]-a[1]).map(([src, count]) => {
              const total = recentScans?.length ?? 1
              return (
                <div key={src} className="flex items-center gap-3">
                  <span className={`badge-${src === 'nfc' ? 'nfc' : src === 'qr' ? 'qr' : 'link'} w-16 text-center`}>
                    {src.toUpperCase()}
                  </span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: 'var(--black-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(count/total)*100}%`, background: 'var(--gold-matte)' }} />
                  </div>
                  <span className="text-pearl text-sm w-8 text-right">{count}</span>
                </div>
              )
            })}
            {!Object.keys(bySource).length && <p className="text-subtle text-sm">Sin datos aún.</p>}
          </div>
        </div>

        {/* Dispositivos */}
        <div className="surface-card p-6">
          <h2 className="text-gold text-sm font-semibold uppercase tracking-widest mb-5">Dispositivos</h2>
          <div className="flex gap-4">
            {Object.entries(byDevice).map(([dev, count]) => (
              <div key={dev} className="text-center flex-1">
                <div className="text-2xl mb-1">{dev === 'mobile' ? '📱' : dev === 'tablet' ? '📟' : '💻'}</div>
                <div className="text-gold font-bold text-lg">{count}</div>
                <div className="text-subtle text-xs capitalize">{dev}</div>
              </div>
            ))}
            {!Object.keys(byDevice).length && <p className="text-subtle text-sm">Sin datos aún.</p>}
          </div>
        </div>

        {/* Países */}
        <div className="surface-card p-6">
          <h2 className="text-gold text-sm font-semibold uppercase tracking-widest mb-5">Top países</h2>
          <div className="flex flex-col gap-2">
            {Object.entries(byCountry).sort((a,b)=>b[1]-a[1]).slice(0, 5).map(([country, count]) => (
              <div key={country} className="flex justify-between items-center">
                <span className="text-pearl text-sm">{country}</span>
                <span className="text-gold font-semibold">{count}</span>
              </div>
            ))}
            {!Object.keys(byCountry).length && <p className="text-subtle text-sm">Sin datos de ubicación aún.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
