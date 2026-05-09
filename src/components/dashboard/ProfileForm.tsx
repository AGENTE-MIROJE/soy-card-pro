'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

const SOCIAL_PLATFORMS = [
  { value: 'linkedin',   label: 'LinkedIn' },
  { value: 'instagram',  label: 'Instagram' },
  { value: 'twitter',    label: 'X / Twitter' },
  { value: 'facebook',   label: 'Facebook' },
  { value: 'tiktok',     label: 'TikTok' },
  { value: 'youtube',    label: 'YouTube' },
  { value: 'github',     label: 'GitHub' },
  { value: 'telegram',   label: 'Telegram' },
  { value: 'whatsapp',   label: 'WhatsApp' },
  { value: 'snapchat',   label: 'Snapchat' },
  { value: 'pinterest',  label: 'Pinterest' },
  { value: 'spotify',    label: 'Spotify' },
  { value: 'threads',    label: 'Threads' },
  { value: 'bereal',     label: 'BeReal' },
  { value: 'twitch',     label: 'Twitch' },
  { value: 'discord',    label: 'Discord' },
]

const PLACEHOLDERS: Record<string, string> = {
  linkedin:  'https://linkedin.com/in/tu-perfil',
  instagram: 'https://instagram.com/tu-usuario',
  twitter:   'https://x.com/tu-usuario',
  facebook:  'https://facebook.com/tu-pagina',
  tiktok:    'https://tiktok.com/@tu-usuario',
  youtube:   'https://youtube.com/@tu-canal',
  github:    'https://github.com/tu-usuario',
  telegram:  'https://t.me/tu-usuario',
  whatsapp:  'https://wa.me/573000000000',
  snapchat:  'https://snapchat.com/add/tu-usuario',
  pinterest: 'https://pinterest.com/tu-usuario',
  spotify:   'https://open.spotify.com/user/tu-usuario',
  threads:   'https://threads.net/@tu-usuario',
  bereal:    'tu-usuario (nombre en BeReal)',
  twitch:    'https://twitch.tv/tu-usuario',
  discord:   'https://discord.gg/tu-servidor',
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
}

export default function ProfileForm({ userId, profile }: { userId: string; profile?: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!profile
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    display_name: profile?.display_name ?? '',
    slug:         profile?.slug ?? '',
    title:        profile?.title ?? '',
    company:      profile?.company ?? '',
    bio:          profile?.bio ?? '',
    phone:        profile?.phone ?? '',
    email:        profile?.email ?? '',
    website:      profile?.website ?? '',
    avatar_url:   profile?.avatar_url ?? '',
  })
  const [socials, setSocials] = useState<Array<{platform: string; url: string}>>(
    Array.isArray(profile?.social_links) ? (profile.social_links as any) : []
  )
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleNameChange = (v: string) => {
    set('display_name', v)
    if (!isEdit) set('slug', slugify(v))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user!.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars').upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) { setError(`Upload: ${upErr.message}`); return }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      set('avatar_url', publicUrl)
    } finally {
      setUploading(false)
    }
  }

  const addSocial = () => setSocials(s => [...s, { platform: 'linkedin', url: '' }])
  const removeSocial = (i: number) => setSocials(s => s.filter((_, idx) => idx !== i))
  const updateSocial = (i: number, field: 'platform' | 'url', v: string) =>
    setSocials(s => s.map((item, idx) => idx === i ? { ...item, [field]: v } : item))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.display_name.trim()) { setError('El nombre es requerido.'); return }
    if (!form.slug.trim()) { setError('El slug es requerido.'); return }
    setLoading(true); setError('')

    // Only save socials that have a URL filled in
    const validSocials = socials.filter(s => s.url.trim().length > 0)

    const payload = {
      ...form,
      user_id: userId,
      social_links: validSocials,
      custom_links: [],
      cover_color: '#C9A84C',
      is_active: true,
      sort_order: 0,
    }
    const { error: dbError } = isEdit
      ? await supabase.from('profiles').update(payload).eq('id', profile!.id)
      : await supabase.from('profiles').insert(payload)
    if (dbError) { setError(dbError.message); setLoading(false); return }
    router.push('/dashboard/profiles')
    router.refresh()
  }

  const savedCount = socials.filter(s => s.url.trim()).length

  return (
    <form onSubmit={handleSubmit} className="surface-card p-4 md:p-6 flex flex-col gap-5">

      {/* Foto */}
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-3">Foto de perfil</label>
        <div className="flex items-center gap-4">
          <div onClick={() => fileRef.current?.click()} className="cursor-pointer flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
            style={{ width: 72, height: 72, background: 'var(--black-surface)', border: '2px dashed var(--gold-border)' }}>
            {avatarPreview
              ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
              : <span className="text-2xl">📷</span>}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-ghost-gold text-sm py-2 w-full">
              {uploading ? 'Subiendo...' : avatarPreview ? 'Cambiar foto' : 'Subir foto'}
            </button>
            <p className="text-subtle text-xs">JPG, PNG, WEBP, HEIC — máx 5MB</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Nombre */}
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">Nombre visible *</label>
        <input className="input-gold" value={form.display_name} onChange={e => handleNameChange(e.target.value)} placeholder="Carlos Saavedra" required />
      </div>

      {/* Slug */}
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">Slug (URL) *</label>
        <div className="flex items-center gap-2">
          <span className="text-subtle text-sm flex-shrink-0">…/</span>
          <input className="input-gold flex-1" value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="carlos-personal" required />
        </div>
      </div>

      {/* Cargo + empresa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-muted text-xs uppercase tracking-widest block mb-2">Cargo</label>
          <input className="input-gold" value={form.title} onChange={e => set('title', e.target.value)} placeholder="CEO & Fundador" />
        </div>
        <div>
          <label className="text-muted text-xs uppercase tracking-widest block mb-2">Empresa</label>
          <input className="input-gold" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Mi Empresa S.A.S" />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">Descripción</label>
        <textarea className="input-gold" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Transformando ideas en negocios rentables..." />
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-muted text-xs uppercase tracking-widest block mb-2">Teléfono / WhatsApp</label>
          <input className="input-gold" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+57 300 000 0000" />
        </div>
        <div>
          <label className="text-muted text-xs uppercase tracking-widest block mb-2">Email</label>
          <input className="input-gold" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@correo.com" />
        </div>
      </div>

      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">Sitio web</label>
        <input className="input-gold" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://tusitio.com" />
      </div>

      {/* Redes sociales */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <label className="text-muted text-xs uppercase tracking-widest">Redes sociales</label>
            {savedCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--gold-glass)', color: 'var(--gold-matte)', border: '1px solid var(--gold-border)' }}>
                {savedCount} {savedCount === 1 ? 'red' : 'redes'}
              </span>
            )}
          </div>
          <button type="button" onClick={addSocial} className="btn-ghost-gold text-xs py-1 px-3">+ Agregar red</button>
        </div>

        <div className="flex flex-col gap-3">
          {socials.length === 0 && (
            <p className="text-subtle text-xs text-center py-3 rounded-lg" style={{ border: '1px dashed var(--black-border)' }}>
              Haz clic en "+ Agregar red" para añadir LinkedIn, Instagram, etc.
            </p>
          )}
          {socials.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)' }}>
              {/* Header fila: plataforma + eliminar */}
              <div className="flex items-center gap-2">
                <select
                  value={s.platform}
                  onChange={e => updateSocial(i, 'platform', e.target.value)}
                  style={{ background: 'var(--black-hover)', border: '1px solid var(--gold-border)', color: 'var(--gold-matte)', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1, outline: 'none' }}>
                  {SOCIAL_PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <button type="button" onClick={() => removeSocial(i)}
                  className="flex-shrink-0 text-subtle hover:text-red-400 transition-colors text-xl leading-none px-1">✕</button>
              </div>
              {/* URL */}
              <input
                className="input-gold"
                value={s.url}
                onChange={e => updateSocial(i, 'url', e.target.value)}
                placeholder={PLACEHOLDERS[s.platform] ?? 'https://...'}
                type="url"
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-950 p-3 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading || uploading} className="btn-gold flex-1">
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear perfil'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost-gold px-6">Cancelar</button>
      </div>
    </form>
  )
}
