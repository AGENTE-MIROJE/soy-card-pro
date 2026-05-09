import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashIP, getGeoFromIP, parseUserAgent, detectReferrerType, getRealIP } from '@/lib/scanner-fingerprint'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { profile_id, referrer, via, ua } = body
    if (!profile_id) return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 })

    const ip = getRealIP(req)
    const [geo, uaParsed] = await Promise.all([
      getGeoFromIP(ip),
      Promise.resolve(parseUserAgent(ua ?? req.headers.get('user-agent') ?? '')),
    ])

    const params = new URLSearchParams(via ? `via=${via}` : '')
    const referrer_type = detectReferrerType(referrer, params)

    const supabase = createServiceClient()

    // Incrementar views_count del perfil (fire and forget)
    supabase.from('profiles').select('views_count').eq('id', profile_id).single()
      .then(({ data: p }) => p && supabase.from('profiles')
        .update({ views_count: (p.views_count ?? 0) + 1 }).eq('id', profile_id))

    // Insertar evento de escaneo
    const { data, error } = await supabase.from('scan_events').insert({
      profile_id,
      ip_hash: hashIP(ip),
      country: geo.country,
      city: geo.city,
      device_type: uaParsed.device_type,
      os: uaParsed.os,
      browser: uaParsed.browser,
      referrer_type,
      user_agent: ua?.slice(0, 200) ?? null,
      is_unique: true,
    }).select('id').single()

    if (error) console.error('scan_events insert error:', error)

    return NextResponse.json({ ok: true, scan_id: data?.id })
  } catch (e) {
    console.error('scan API error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
