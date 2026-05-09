'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

const SOCIAL_PLATFORMS = ['linkedin','instagram','twitter','facebook','tiktok','youtube','github','telegram','whatsapp']

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
}

export default function ProfileForm({ userId, profile }: { userId: string; profile?: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!profile

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
  const [socials, setSocials] = useState<Array<{platform:string; url:string}>>(
    (profile?.social_links as any) ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleNameChange = (v: string) => {
    set('display_name', v)
    if (!isEdit) set('slug', slugify(v))
  }

  const addSocial = () => setSocials(s => [...s, { platform: 'linkedin', url: '' }])
  const removeSocial = (i: number) => setSocials(s => s.filter((_, idx) => idx !== i))
  const updateSocial = (i: number, k: string, v: string) =>
    setSocials(s => s.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.display_name.trim()) { setError('El nombre es requerido.'); return }
    if (!form.slug.trim()) { setError('El slug es requerido.'); return }
    setLoading(true); setError('')
    const payload = { ...form, user_id: userId, social_links: socials, custom_links: [], cover_color: '#C9A84C', is_active: true, sort_order: 0 }
    const { error: dbError } = isEdit
      ? await supabase.from('profiles').update(payload).eq('id', profile!.id)
      : await supabase.from('profiles').insert(payload)
    if (dbError) { setError(dbError.message); setLoading(false); return }
    router.push('/dashboard/profiles')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6 flex flex-col gap-5">
      {/* Nombre */}
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">Nombre visible *</label>
        <input className="input-gold" value={form.display_name}
          onChange={e => handleNameChange(e.target.value)} placeholder="Carlos Saavedra" required />
      </div>

      {/* Slug */}
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">Slug (URL) *</label>
        <div className="flex items-center gap-2">
          <span className="text-subtle text-sm">…/</span>
          <input className="input-gold flex-1" value={form.slug}
            onChange={e => set('slug', slugify(e.target.value))} placeholder="carlos-personal" required />
        </div>
      </div>

      {/* Fila title + company */}
      <div className="grid grid-cols-2 gap-4">
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
        <textarea className="input-gold" rows={3} value={form.bio}
          onChange={e => set('bio', e.target.value)}
          placeholder="Transformando ideas en negocios rentables..." />
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-2 gap-4">
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

      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">URL de foto de perfil</label>
        <input className="input-gold" value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} placeholder="https://..." />
      </div>

      {/* Redes sociales */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-muted text-xs uppercase tracking-widest">Redes sociales</label>
          <button type="button" onClick={addSocial} className="btn-ghost-gold text-xs py-1 px-3">+ Agregar</button>
        </div>
        {socials.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select className="input-gold w-36 flex-shrink-0" value={s.platform}
              onChange={e => updateSocial(i, 'platform', e.target.value)}
              style={{ background: 'var(--black-surface)', color: 'var(--pearl-white)' }}>
              {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input className="input-gold flex-1" value={s.url}
              onChange={e => updateSocial(i, 'url', e.target.value)} placeholder="https://..." />
            <button type="button" onClick={() => removeSocial(i)}
              className="text-subtle hover:text-pearl transition-colors px-2">✕</button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-gold flex-1">
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear perfil'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost-gold px-6">
          Cancelar
        </button>
      </div>
    </form>
  )
}
