/**
 * Construye la URL absoluta correcta para cada red social.
 * Maneja: @usuario, usuario, t.me/usuario, https://..., etc.
 */
export function buildSocialUrl(platform: string, raw: string): string {
  const s = raw.trim()
  if (!s) return ''

  // Si ya tiene protocolo completo, devolver tal cual
  if (/^https?:\/\//i.test(s)) return s

  // Extraer la parte útil (sin @ inicial)
  const noAt = s.replace(/^@/, '')

  // Detectar si es solo un nombre de usuario (sin puntos de dominio ni barras dobles)
  const isUsername = !noAt.includes('://') && !noAt.includes(' ')

  switch (platform) {
    case 'telegram':
      // @usuario, usuario, t.me/usuario → https://t.me/usuario
      if (isUsername) {
        const user = noAt.replace(/^t\.me\//i, '').replace(/^telegram\.me\//i, '')
        return `https://t.me/${user}`
      }
      break

    case 'whatsapp':
      // número de teléfono → https://wa.me/número
      const digits = noAt.replace(/[\s\-\(\)\+]/g, '')
      if (/^\d{7,15}$/.test(digits)) return `https://wa.me/${digits}`
      if (/^wa\.me\//i.test(noAt)) return `https://${noAt}`
      break

    case 'instagram':
      // @usuario, usuario → https://instagram.com/usuario
      if (isUsername && !noAt.includes('.')) return `https://instagram.com/${noAt}`
      break

    case 'twitter':
      // @usuario, usuario → https://x.com/usuario
      if (isUsername && !noAt.includes('.')) return `https://x.com/${noAt}`
      break

    case 'tiktok':
      // @usuario, usuario → https://tiktok.com/@usuario
      if (isUsername && !noAt.includes('.')) return `https://tiktok.com/@${noAt}`
      break

    case 'github':
      if (isUsername && !noAt.includes('.')) return `https://github.com/${noAt}`
      break

    case 'youtube':
      if (isUsername && !noAt.includes('.')) return `https://youtube.com/@${noAt}`
      break

    case 'discord':
      // código de invitación
      if (isUsername && !noAt.includes('.')) return `https://discord.gg/${noAt}`
      break

    case 'twitch':
      if (isUsername && !noAt.includes('.')) return `https://twitch.tv/${noAt}`
      break

    case 'spotify':
      if (noAt.startsWith('open.spotify.com')) return `https://${noAt}`
      break

    case 'threads':
      if (isUsername && !noAt.includes('.')) return `https://threads.net/@${noAt}`
      break

    case 'pinterest':
      if (isUsername && !noAt.includes('.')) return `https://pinterest.com/${noAt}`
      break

    case 'snapchat':
      if (isUsername && !noAt.includes('.')) return `https://snapchat.com/add/${noAt}`
      break

    case 'facebook':
      if (isUsername && !noAt.includes('.')) return `https://facebook.com/${noAt}`
      break

    case 'linkedin':
      // in/usuario → https://linkedin.com/in/usuario
      if (noAt.startsWith('in/')) return `https://linkedin.com/${noAt}`
      if (isUsername && !noAt.includes('.')) return `https://linkedin.com/in/${noAt}`
      break
  }

  // Fallback genérico: agregar https://
  return `https://${s}`
}
