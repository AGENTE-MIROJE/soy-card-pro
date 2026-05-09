import type { Profile } from './supabase/types'

export async function generateVCard(profile: Profile, appUrl: string): Promise<string> {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.display_name}`,
  ]

  const nameParts = profile.display_name.trim().split(' ')
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
  const firstName = nameParts[0]
  lines.push(`N:${lastName};${firstName};;;`)

  if (profile.title && profile.company) {
    lines.push(`ORG:${profile.company}`)
    lines.push(`TITLE:${profile.title}`)
  } else if (profile.company) {
    lines.push(`ORG:${profile.company}`)
  } else if (profile.title) {
    lines.push(`TITLE:${profile.title}`)
  }

  if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`)
  if (profile.email) lines.push(`EMAIL:${profile.email}`)
  if (profile.website) lines.push(`URL:${profile.website}`)
  if (profile.bio) lines.push(`NOTE:${profile.bio.replace(/\n/g, '\\n')}`)

  // Foto embebida en base64 para máxima compatibilidad iOS/Android
  if (profile.avatar_url) {
    try {
      const res = await fetch(profile.avatar_url, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const buf = await res.arrayBuffer()
        const b64 = Buffer.from(buf).toString('base64')
        const mime = res.headers.get('content-type') ?? 'image/jpeg'
        const typeTag = mime.includes('png') ? 'PNG' : 'JPEG'
        // Partir en líneas de 75 chars (RFC 2426)
        const photoData = `PHOTO;ENCODING=BASE64;TYPE=${typeTag}:${b64}`
        const chunkSize = 75
        const firstLine = photoData.slice(0, chunkSize)
        let rest = photoData.slice(chunkSize)
        lines.push(firstLine)
        while (rest.length > 0) {
          lines.push(' ' + rest.slice(0, chunkSize - 1))
          rest = rest.slice(chunkSize - 1)
        }
      }
    } catch {
      // Si falla el fetch, incluir solo la URL como fallback
      lines.push(`PHOTO;VALUE=URI:${profile.avatar_url}`)
    }
  }

  // Enlace al perfil digital
  lines.push(`URL;TYPE=PROFILE:${appUrl}`)

  // Redes sociales como URLs estándar (compatibles con todos los contactos)
  const socials = profile.social_links as Array<{ platform: string; url: string }> | null
  socials?.filter(s => s.url?.trim()).forEach(s => {
    const label = s.platform.charAt(0).toUpperCase() + s.platform.slice(1)
    lines.push(`URL;TYPE=${label.toUpperCase()}:${s.url}`)
    lines.push(`X-SOCIALPROFILE;TYPE=${s.platform}:${s.url}`)
  })

  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}
