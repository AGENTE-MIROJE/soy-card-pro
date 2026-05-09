import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateVCard } from '@/lib/vcard'

export async function GET(req: NextRequest, { params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params
  const supabase = createServiceClient()

  const { data: profile, error } = await supabase
    .from('profiles').select('*').eq('id', profileId).eq('is_active', true).single()

  if (error || !profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: account } = await supabase
    .from('user_accounts').select('username').eq('id', profile.user_id).single()

  const appUrl = account
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://soy-card-pro.vercel.app'}/${account.username}/${profile.slug}`
    : process.env.NEXT_PUBLIC_APP_URL ?? 'https://soy-card-pro.vercel.app'

  const vcf = await generateVCard(profile as any, appUrl)

  return new NextResponse(vcf, {
    headers: {
      'Content-Type': 'text/vcard;charset=utf-8',
      'Content-Disposition': `attachment; filename="${profile.slug}.vcf"`,
    },
  })
}
