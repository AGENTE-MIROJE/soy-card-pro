import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, UUID_RE, sanitize } from '@/lib/rate-limit'
import { getRealIP } from '@/lib/scanner-fingerprint'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+\d\s\-().]{5,25}$/

export async function POST(req: NextRequest) {
  try {
    const ip = getRealIP(req)

    // 10 leads por 10 minutos por IP
    if (!rateLimit(`lead:${ip}`, 10, 600_000)) {
      return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
    }

    const body = await req.json()
    const raw = Array.isArray(body) ? body : [body]

    // Máximo 20 leads por batch (offline sync)
    if (raw.length > 20) {
      return NextResponse.json({ error: 'Batch too large' }, { status: 400 })
    }

    const toInsert = raw
      .filter((lead: any) => lead?.profile_id && UUID_RE.test(lead.profile_id))
      .map((lead: any) => {
        const email = sanitize(lead.email, 200)
        const phone = sanitize(lead.phone, 50)
        return {
          profile_id: lead.profile_id,
          name:    sanitize(lead.name, 150),
          email:   email && EMAIL_RE.test(email) ? email : null,
          phone:   phone && PHONE_RE.test(phone) ? phone : null,
          company: sanitize(lead.company, 150),
          notes:   sanitize(lead.message ?? lead.notes, 500),
          scan_event_id: null,
          consent: lead.consent === true,
          saved_by_owner: false,
          tag: 'nuevo' as const,
        }
      })

    if (!toInsert.length) {
      return NextResponse.json({ error: 'No valid leads' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('leads').insert(toInsert)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, synced: toInsert.length })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
