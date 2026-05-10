import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Genera un signed JWT para obtener access token de Google OAuth2
function makeOAuthJWT(clientEmail: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const encode = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const input = `${encode(header)}.${encode(claim)}`
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(input)
  return `${input}.${sign.sign(privateKey, 'base64url')}`
}

export async function GET() {
  try {
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const saB64   = process.env.GOOGLE_WALLET_SA_JSON_B64

    if (!issuerId || !saB64) {
      return NextResponse.json({ ok: false, error: 'Env vars missing', issuerId: !!issuerId, saB64: !!saB64 })
    }

    const sa = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'))

    // 1 — obtener access token
    const oauthJwt = makeOAuthJWT(sa.client_email, sa.private_key)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: oauthJwt,
      }),
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.json({ ok: false, step: 'oauth', error: tokenData })
    }

    // 2 — consultar si el class existe en Google Wallet
    const classId = `${issuerId}.soy_card_pro_business_card`
    const classRes = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/genericClass/${encodeURIComponent(classId)}`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    )
    const classData = await classRes.json()

    return NextResponse.json({
      ok: classRes.ok,
      classId,
      issuerId,
      clientEmail: sa.client_email,
      classStatus: classRes.status,
      classExists: classRes.ok,
      classData: classRes.ok ? { id: classData.id, reviewStatus: classData.reviewStatus } : classData,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}
