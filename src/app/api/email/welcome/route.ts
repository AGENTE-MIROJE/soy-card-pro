import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

interface EmailContent {
  greeting: string
  subheading: string
  welcome: string
  description: string
  ctaButton: string
  featuresTitle: string
  features: string[]
  subject: string
  footerPrefix: string
}

const EMAILS: Record<string, EmailContent> = {
  es: {
    greeting: 'Hola',
    subheading: 'Tu tarjeta digital<br>ya está lista',
    welcome: 'Bienvenido a <strong style="color:#C9A84C;">SOY_CARD_PRO</strong> — la tarjeta de visita digital más premium del mercado.',
    description: 'Con tu cuenta puedes crear tu primer perfil, generar tu QR personalizado y compartir tu tarjeta por WhatsApp, NFC o simplemente enviando el enlace.',
    ctaButton: 'Crear mi primer perfil →',
    featuresTitle: 'Incluido en tu plan',
    features: [
      '1 perfil digital con QR personalizado',
      'Captura automática de leads',
      'Analítica de escaneos en tiempo real',
      'Compartir por WhatsApp, NFC y más',
    ],
    subject: 'tu tarjeta digital está lista ✦',
    footerPrefix: 'SOY_CARD_PRO',
  },
  en: {
    greeting: 'Hi',
    subheading: 'Your digital card<br>is ready',
    welcome: 'Welcome to <strong style="color:#C9A84C;">SOY_CARD_PRO</strong> — the most premium digital business card on the market.',
    description: 'With your account you can create your first profile, generate your personalized QR code, and share your card via WhatsApp, NFC, or simply by sending the link.',
    ctaButton: 'Create my first profile →',
    featuresTitle: 'Included in your plan',
    features: [
      '1 digital profile with personalized QR code',
      'Automatic lead capture',
      'Real-time scan analytics',
      'Share via WhatsApp, NFC and more',
    ],
    subject: 'your digital card is ready ✦',
    footerPrefix: 'SOY_CARD_PRO',
  },
}

function detectLanguage(req: NextRequest): string {
  const lang = req.headers.get('accept-language') || ''
  if (lang.includes('es')) return 'es'
  return 'en'
}

function generateHTML(email: EmailContent, firstName: string, appUrl: string, lang: string): string {
  const icons = ['◈', '◉', '◎', '⚡']
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050507;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050507;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0D0D12;border-radius:16px;border:1px solid rgba(201,168,76,0.3);overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0D0D12,#1a1505,#0D0D12);padding:32px 32px 24px;text-align:center;">
            <p style="margin:0 0 4px;color:#C9A84C;font-size:13px;letter-spacing:0.2em;font-weight:700;text-transform:uppercase;">SOY_CARD_PRO</p>
            <h1 style="margin:0;color:#E8D5A3;font-size:26px;font-weight:700;letter-spacing:-0.02em;">${email.subheading}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 16px;color:#A89B7A;font-size:15px;line-height:1.6;">
              ${email.greeting} <strong style="color:#E8D5A3;">${firstName}</strong>,
            </p>
            <p style="margin:0 0 16px;color:#A89B7A;font-size:15px;line-height:1.6;">
              ${email.welcome}
            </p>
            <p style="margin:0 0 24px;color:#A89B7A;font-size:15px;line-height:1.6;">
              ${email.description}
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center" style="padding:8px 0 24px;">
                <a href="${appUrl}/dashboard" style="display:inline-block;background:#C9A84C;color:#050507;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:14px;letter-spacing:0.05em;">
                  ${email.ctaButton}
                </a>
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#050507;border-radius:12px;border:1px solid rgba(201,168,76,0.15);">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;color:#C9A84C;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:700;">${email.featuresTitle}</p>
                ${email.features.map((f, i) => `<p style="margin:0 0 6px;color:#A89B7A;font-size:13px;">${icons[i]} &nbsp;${f}</p>`).join('')}
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
            <p style="margin:0;color:#4a4232;font-size:11px;">${email.footerPrefix} · <a href="${appUrl}" style="color:#4a4232;">${appUrl.replace('https://', '')}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const { email, name } = await req.json() as { email: string; name?: string }
  if (!email || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({ skipped: true })
  }

  const firstName = name?.split(' ')[0] ?? 'friend'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soy-card-pro.vercel.app'
  const lang = detectLanguage(req)
  const content = EMAILS[lang] || EMAILS.en
  const html = generateHTML(content, firstName, appUrl, lang)

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `${firstName}, ${content.subject}`,
      html,
    })
    return NextResponse.json({ sent: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
