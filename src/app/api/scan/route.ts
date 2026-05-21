import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashIP, getGeoFromIP, parseUserAgent, detectReferrerType, getRealIP } from '@/lib/scanner-fingerprint'
import { rateLimit, UUID_RE } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = getRealIP(req)

    // 30 scans por minuto por IP
    if (!rateLimit(`scan:${ip}`, 30, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const body = await req.json()
    const { profile_id, referrer, via, ua } = body

    if (!profile_id || !UUID_RE.test(profile_id)) {
      return NextResponse.json({ error: 'Invalid profile_id' }, { status: 400 })
    }

    const [geo, uaParsed] = await Promise.all([
      getGeoFromIP(ip),
      Promise.resolve(parseUserAgent(ua ?? req.headers.get('user-agent') ?? '')),
    ])

    const params = new URLSearchParams(via ? `via=${via}` : '')
    const referrer_type = detectReferrerType(referrer, params)

    const supabase = createServiceClient()

    // Verificar que el perfil existe antes de insertar
    const { data: profile } = await supabase
      .from('profiles').select('id, views_count').eq('id', profile_id).eq('is_active', true).single()

    if (!profile) return NextResponse.json({ ok: false }, { status: 404 })

    // Incrementar views_count (fire and forget)
    supabase.from('profiles')
      .update({ views_count: (profile.views_count ?? 0) + 1 })
      .eq('id', profile_id)

    const { data, error } = await supabase.from('scan_events').insert({
      profile_id,
      ip_hash: hashIP(ip),
      country: geo.country,
      city: geo.city,
      device_type: uaParsed.device_type,
      os: uaParsed.os,
      browser: uaParsed.browser,
      referrer_type,
      user_agent: (ua as string)?.slice(0, 200) ?? null,
      is_unique: true,
    }).select('id').single()

    if (error) console.error('scan_events insert error:', error)

    return NextResponse.json({ ok: true, scan_id: data?.id })
  } catch (e) {
    console.error('scan API error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
