import type { Profile } from './supabase/types'

export function generateVCard(profile: Profile, appUrl: string): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.display_name}`,
  ]
  if (profile.title && profile.company) {
    lines.push(`ORG:${profile.company}`)
    lines.push(`TITLE:${profile.title}`)
  } else if (profile.company) {
    lines.push(`ORG:${profile.company}`)
  }
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`)
  if (profile.email) lines.push(`EMAIL:${profile.email}`)
  if (profile.website) lines.push(`URL:${profile.website}`)
  if (profile.bio) lines.push(`NOTE:${profile.bio.replace(/\n/g, '\\n')}`)
  if (profile.avatar_url) lines.push(`PHOTO;VALUE=URI:${profile.avatar_url}`)

  // Enlace al perfil digital
  lines.push(`URL;TYPE=profile:${appUrl}`)

  // Redes sociales
  const socials = profile.social_links as Array<{ platform: string; url: string }>
  socials?.forEach(s => {
    lines.push(`X-SOCIALPROFILE;TYPE=${s.platform}:${s.url}`)
  })

  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}
