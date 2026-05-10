import { NextResponse } from 'next/server'
import crypto from 'crypto'

function makeOAuthJWT(clientEmail: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = { iss: clientEmail, scope: 'https://www.googleapis.com/auth/wallet_object.issuer', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }
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
    if (!issuerId || !saB64) return NextResponse.json({ ok: false, error: 'Env vars missing' })
    const sa = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'))
    const oauthJwt = makeOAuthJWT(sa.client_email, sa.private_key)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: oauthJwt }),
    })
    const { access_token } = await tokenRes.json()
    if (!access_token) return NextResponse.json({ ok: false, step: 'oauth_failed' })

    const classId = `${issuerId}.soy_card_pro_business_card`
    const headers = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' }

    // GET
    const getRes = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/genericClass/${encodeURIComponent(classId)}`, { headers })
    const getData = await getRes.json()
    if (getRes.ok) return NextResponse.json({ ok: true, step: 'class_exists', classId, reviewStatus: getData.reviewStatus })

    // CREATE
    const createRes = await fetch('https://walletobjects.googleapis.com/walletobjects/v1/genericClass', {
      method: 'POST', headers, body: JSON.stringify({ id: classId, issuerName: 'SOY_CARD_PRO', reviewStatus: 'UNDER_REVIEW' }),
    })
    const createData = await createRes.json()
    return NextResponse.json({ ok: createRes.ok, step: createRes.ok ? 'class_created' : 'class_create_failed', classId, issuerId, createStatus: createRes.status, createResult: createData })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}
