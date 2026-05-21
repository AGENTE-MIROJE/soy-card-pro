import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isSafeUrl } from '@/lib/rate-limit'
import QRCode from 'qrcode'
import sharp from 'sharp'

export async function GET(req: NextRequest, { params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params
  const { searchParams } = new URL(req.url)
  const via = searchParams.get('via') ?? 'qr'
  const format = searchParams.get('format') ?? 'svg'

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles').select('slug, user_id, avatar_url').eq('id', profileId).single()

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: account } = await supabase
    .from('user_accounts').select('username').eq('id', profile.user_id).single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soy-card-pro.vercel.app'
  const cardUrl = `${appUrl}/${account?.username}/${profile.slug}?via=${via}`

  if (format === 'png') {
    const qrSize = 600
    const qrBuffer = await QRCode.toBuffer(cardUrl, {
      type: 'png',
      width: qrSize,
      margin: 3,
      color: { dark: '#C9A84C', light: '#0D0D12' },
      errorCorrectionLevel: 'H',
    })

    let finalBuffer: Buffer = qrBuffer as unknown as Buffer

    // Composite avatar in center if available (solo URLs de dominios seguros)
    if (profile.avatar_url && isSafeUrl(profile.avatar_url)) {
      try {
        const avatarRes = await fetch(profile.avatar_url)
        if (avatarRes.ok) {
          const avatarRaw = Buffer.from(await avatarRes.arrayBuffer())
          const avatarSize = 120
          const circleRadius = avatarSize / 2

          // Create circular avatar with white border
          const borderSize = avatarSize + 12
          const circularAvatar = await sharp(avatarRaw)
            .resize(avatarSize, avatarSize, { fit: 'cover' })
            .composite([{
              input: Buffer.from(
                `<svg><circle cx="${circleRadius}" cy="${circleRadius}" r="${circleRadius}"/></svg>`
              ),
              blend: 'dest-in',
            }])
            .png()
            .toBuffer()

          // Add white background circle behind avatar
          const withBorder = await sharp({
            create: { width: borderSize, height: borderSize, channels: 4, background: { r: 13, g: 13, b: 18, alpha: 1 } }
          })
            .composite([
              { input: Buffer.from(`<svg><circle cx="${borderSize/2}" cy="${borderSize/2}" r="${borderSize/2}" fill="#C9A84C"/></svg>`), blend: 'over' },
              { input: circularAvatar, top: 6, left: 6 },
            ])
            .png()
            .toBuffer()

          const top = Math.floor((qrSize - borderSize) / 2)
          const left = Math.floor((qrSize - borderSize) / 2)
          finalBuffer = await sharp(qrBuffer as unknown as Buffer)
            .composite([{ input: withBorder, top, left }])
            .png()
            .toBuffer()
        }
      } catch {
        // If avatar compositing fails, return plain QR
      }
    }

    return new NextResponse(finalBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-${profile.slug}.png"`,
        'Cache-Control': 'public, max-age=300',
      },
    })
  }

  const svg = await QRCode.toString(cardUrl, {
    type: 'svg',
    width: 300,
    margin: 2,
    color: { dark: '#C9A84C', light: '#0D0D12' },
    errorCorrectionLevel: 'H',
  })

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
