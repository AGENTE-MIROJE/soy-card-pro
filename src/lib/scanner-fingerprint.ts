import { createHash } from 'crypto'

export interface ScannerInfo {
  ip_hash: string
  country: string | null
  city: string | null
  device_type: 'mobile' | 'tablet' | 'desktop'
  os: string | null
  browser: string | null
  referrer_type: 'nfc' | 'qr' | 'wallet' | 'link' | 'direct' | 'email'
}

export function parseUserAgent(ua: string): Pick<ScannerInfo, 'device_type' | 'os' | 'browser'> {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  const isTablet = /iPad|Tablet/i.test(ua)

  let os: string | null = null
  if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'
  else if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let browser: string | null = null
  if (/Chrome/i.test(ua) && !/Chromium|Edge/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Edge/i.test(ua)) browser = 'Edge'
  else if (/Samsung/i.test(ua)) browser = 'Samsung Internet'

  return {
    device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    os,
    browser,
  }
}

export function detectReferrerType(
  referrer: string | null,
  searchParams: URLSearchParams
): ScannerInfo['referrer_type'] {
  const via = searchParams.get('via')
  if (via === 'nfc') return 'nfc'
  if (via === 'qr') return 'qr'
  if (via === 'wallet') return 'wallet'
  if (via === 'email') return 'email'

  if (!referrer || referrer === '') return 'direct'
  return 'link'
}

export function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY!).digest('hex').slice(0, 32)
}

export async function getGeoFromIP(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return { country: null, city: null }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return { country: null, city: null }
    const data = await res.json()
    if (data.status !== 'success') return { country: null, city: null }
    return { country: data.country ?? null, city: data.city ?? null }
  } catch {
    return { country: null, city: null }
  }
}

export function getRealIP(request: Request): string {
  const headers = request.headers
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  )
}
