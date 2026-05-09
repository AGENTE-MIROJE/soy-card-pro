import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { profile_id, name, email, phone, company, consent } = body
    if (!profile_id) return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase.from('leads').insert({
      profile_id, name: name ?? null, email: email ?? null, phone: phone ?? null,
      company: company ?? null, notes: null, scan_event_id: null,
      consent: consent === true, saved_by_owner: false, tag: 'nuevo',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
