import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Handle both single lead and batch sync (array of leads)
    const leads = Array.isArray(body) ? body : [body]

    const supabase = createServiceClient()
    const toInsert = leads.map((lead: any) => ({
      profile_id: lead.profile_id,
      name: lead.name ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      company: lead.company ?? null,
      notes: lead.message ?? null,
      scan_event_id: null,
      consent: lead.consent === true,
      saved_by_owner: false,
      tag: 'nuevo' as const,
    }))

    if (!toInsert.length) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
    }

    const { error } = await supabase.from('leads').insert(toInsert)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, synced: toInsert.length })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
