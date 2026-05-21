import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { GoogleAuth } from 'google-auth-library'
import crypto from 'crypto'

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!
const SA_JSON_B64 = process.env.GOOGLE_WALLET_SA_JSON_B64!
const WALLET_API = 'https://walletobjects.googleapis.com/walletobjects/v1'
const SCOPES = ['https://www.googleapis.com/auth/wallet_object.issuer']

function signJWT(payload: object, privateKey: string, clientEmail: string): string {
  const header = { alg: 'RS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  const claims = { iss: clientEmail, aud: 'google', typ: 'savetowallet', iat, payload }
  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const signingInput = `${encode(header)}.${encode(claims)}`
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signingInput)
  return `${signingInput}.${sign.sign(privateKey, 'base64url')}`
}

async function getAccessToken(saJson: object): Promise<string> {
  const auth = new GoogleAuth({ credentials: saJson, scopes: SCOPES })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  if (!token.token) throw new Error('No access token')
  return token.token
}

async function upsertClass(classId: string, token: string): Promise<void> {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const check = await fetch(`${WALLET_API}/genericClass/${encodeURIComponent(classId)}`, { headers })
  if (check.ok) return

  const res = await fetch(`${WALLET_API}/genericClass`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: classId,
      issuerName: 'SOY_CARD_PRO',
      reviewStatus: 'UNDER_REVIEW',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create wallet class: ${err}`)
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params

    const supabase = await createServiceClient()
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', profileId).single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { data: account } = await supabase
      .from('user_accounts').select('username').eq('id', profile.user_id).single()

    const saJson = JSON.parse(Buffer.from(SA_JSON_B64, 'base64').toString('utf8'))
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const username = account?.username || 'user'
    const cardUrl = `${appUrl}/${username}/${profile.slug}`
    const classId = `${ISSUER_ID}.soy_card_pro_business_card`
    const objectId = `${ISSUER_ID}.profile_${profileId.replace(/-/g, '_')}`

    // Garantizar que la clase existe antes de emitir el pase
    const token = await getAccessToken(saJson)
    await upsertClass(classId, token)

    const genericObject = {
      id: objectId,
      classId,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      hexBackgroundColor: '#050507',
      logo: {
        sourceUri: { uri: `${appUrl}/icons/icon-192.png` },
        contentDescription: { defaultValue: { language: 'es', value: 'SOY_CARD_PRO' } },
      },
      cardTitle: { defaultValue: { language: 'es', value: 'SOY_CARD_PRO' } },
      subheader: {
        defaultValue: { language: 'es', value: profile.title || profile.company || 'Tarjeta Digital' },
      },
      header: { defaultValue: { language: 'es', value: profile.display_name } },
      textModulesData: [
        profile.phone && { id: 'phone', header: 'Teléfono', body: profile.phone },
        profile.email && { id: 'email', header: 'Email', body: profile.email },
        profile.company && { id: 'company', header: 'Empresa', body: profile.company },
      ].filter(Boolean),
      linksModuleData: {
        uris: [
          { uri: cardUrl, description: 'Ver tarjeta completa', id: 'card_url' },
          profile.website && { uri: profile.website, description: 'Sitio web', id: 'website' },
        ].filter(Boolean),
      },
      barcode: { type: 'QR_CODE', value: cardUrl, alternateText: cardUrl },
      heroImage: { sourceUri: { uri: `${appUrl}/icons/icon-512.png` } },
    }

    const jwt = signJWT({ genericObjects: [genericObject] }, saJson.private_key, saJson.client_email)
    return NextResponse.redirect(`https://pay.google.com/gp/v/save/${jwt}`)
  } catch (e: any) {
    console.error('Wallet error:', e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
