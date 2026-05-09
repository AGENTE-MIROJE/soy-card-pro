import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

export async function GET(req: NextRequest, { params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params
  const { searchParams } = new URL(req.url)
  const via = searchParams.get('via') ?? 'qr'

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles').select('slug, user_id').eq('id', profileId).single()

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: account } = await supabase
    .from('user_accounts').select('username').eq('id', profile.user_id).single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soycardpro.vercel.app'
  const cardUrl = `${appUrl}/${account?.username}/${profile.slug}?via=${via}`

  const svg = await QRCode.toString(cardUrl, {
    type: 'svg',
    width: 300,
    margin: 2,
    color: { dark: '#C9A84C', light: '#0D0D12' },
    errorCorrectionLevel: 'M',
  })

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
