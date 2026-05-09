import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: account } = await supabase
    .from('user_accounts').select('id').eq('auth_id', user.id).single()
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profiles } = await supabase
    .from('profiles').select('id').eq('user_id', account.id)
  const profileIds = profiles?.map(p => p.id) ?? []
  if (!profileIds.length) return NextResponse.json({ ok: true })

  // Borrar scan_events
  await supabase.from('scan_events').delete().in('profile_id', profileIds)
  // Reiniciar views_count
  await supabase.from('profiles').update({ views_count: 0 }).in('id', profileIds)

  return NextResponse.json({ ok: true })
}
