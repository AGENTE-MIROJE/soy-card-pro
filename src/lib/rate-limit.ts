// In-memory rate limiter — funciona por instancia serverless
// Suficiente para disuadir abuso básico en Vercel
const store = new Map<string, { count: number; reset: number }>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function sanitize(v: unknown, maxLen = 300): string | null {
  if (typeof v !== 'string') return null
  return v.slice(0, maxLen).replace(/[<>"']/g, '').trim() || null
}

// Dominios permitidos para fetch de avatar (evita SSRF)
const SAFE_AVATAR_HOSTS = [
  'supabase.co',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
]

export function isSafeUrl(raw: string | null): boolean {
  if (!raw) return false
  try {
    const { protocol, hostname } = new URL(raw)
    return protocol === 'https:' && SAFE_AVATAR_HOSTS.some(h => hostname.endsWith(h))
  } catch {
    return false
  }
}
