import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  const { email, name } = await req.json() as { email: string; name?: string }
  if (!email || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({ skipped: true })
  }

  const firstName = name?.split(' ')[0] ?? 'amigo'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soy-card-pro.vercel.app'

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050507;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050507;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0D0D12;border-radius:16px;border:1px solid rgba(201,168,76,0.3);overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D0D12,#1a1505,#0D0D12);padding:32px 32px 24px;text-align:center;">
            <p style="margin:0 0 4px;color:#C9A84C;font-size:13px;letter-spacing:0.2em;font-weight:700;text-transform:uppercase;">SOY_CARD_PRO</p>
            <h1 style="margin:0;color:#E8D5A3;font-size:26px;font-weight:700;letter-spacing:-0.02em;">Tu tarjeta digital<br>ya está lista</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 16px;color:#A89B7A;font-size:15px;line-height:1.6;">
              Hola <strong style="color:#E8D5A3;">${firstName}</strong>,
            </p>
            <p style="margin:0 0 16px;color:#A89B7A;font-size:15px;line-height:1.6;">
              Bienvenido a <strong style="color:#C9A84C;">SOY_CARD_PRO</strong> — la tarjeta de visita digital más premium del mercado.
            </p>
            <p style="margin:0 0 24px;color:#A89B7A;font-size:15px;line-height:1.6;">
              Con tu cuenta puedes crear tu primer perfil, generar tu QR personalizado y compartir tu tarjeta por WhatsApp, NFC o simplemente enviando el enlace.
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center" style="padding:8px 0 24px;">
                <a href="${appUrl}/dashboard" style="display:inline-block;background:#C9A84C;color:#050507;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:14px;letter-spacing:0.05em;">
                  Crear mi primer perfil →
                </a>
              </td></tr>
            </table>
            <!-- Features -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#050507;border-radius:12px;border:1px solid rgba(201,168,76,0.15);">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;color:#C9A84C;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:700;">Incluido en tu plan</p>
                <p style="margin:0 0 6px;color:#A89B7A;font-size:13px;">◈ &nbsp;1 perfil digital con QR personalizado</p>
                <p style="margin:0 0 6px;color:#A89B7A;font-size:13px;">◉ &nbsp;Captura automática de leads</p>
                <p style="margin:0 0 6px;color:#A89B7A;font-size:13px;">◎ &nbsp;Analítica de escaneos en tiempo real</p>
                <p style="margin:0;color:#A89B7A;font-size:13px;">⚡ &nbsp;Compartir por WhatsApp, NFC y más</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid rgba(201,168,76,0.1);">
            <p style="margin:0;color:#4a4232;font-size:11px;">SOY_CARD_PRO · <a href="${appUrl}" style="color:#4a4232;">${appUrl.replace('https://', '')}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `${firstName}, tu tarjeta digital está lista ✦`,
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
