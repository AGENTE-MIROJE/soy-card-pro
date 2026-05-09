import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/lib/supabase/types'

interface Props { params: Promise<{ username: string }> }

export default async function AllProfilesPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: account } = await supabase
    .from('user_accounts').select('id, username, full_name, avatar_url')
    .eq('username', username).single()
  if (!account) notFound()

  const { data: profiles } = await supabase
    .from('profiles').select('*').eq('user_id', account.id).eq('is_active', true).order('sort_order')
  if (!profiles?.length) notFound()

  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh' }}
      className="flex flex-col items-center justify-start pt-10 pb-10 px-4">
      <div className="w-full max-w-sm fade-in-up">
        {/* Header de usuario */}
        <div className="text-center mb-8">
          {account.avatar_url ? (
            <div className="avatar-gold-ring inline-block mb-4" style={{ width: 80, height: 80 }}>
              <img src={account.avatar_url} alt={account.full_name ?? username}
                className="rounded-full object-cover" style={{ width: 80, height: 80 }} />
            </div>
          ) : (
            <div className="avatar-gold-ring inline-flex items-center justify-center mb-4 text-gold font-bold text-2xl"
              style={{ width: 80, height: 80, background: 'var(--black-card)', borderRadius: '50%' }}>
              {(account.full_name ?? username)[0].toUpperCase()}
            </div>
          )}
          <h1 className="text-display text-pearl text-xl">{account.full_name ?? username}</h1>
          <p className="text-subtle text-sm">@{username}</p>
        </div>

        {/* Lista de perfiles */}
        <div className="flex flex-col gap-4 mb-6">
          {profiles.map((profile: Profile) => (
            <Link key={profile.id} href={`/${username}/${profile.slug}`}
              className="glass-card shimmer-border p-5 flex items-center gap-4 transition-all hover:border-gold-matte"
              style={{ textDecoration: 'none' }}>
              <div className="flex-1">
                <div className="text-pearl font-semibold">{profile.display_name}</div>
                {profile.title && <div className="text-gold-pearl text-sm">{profile.title}{profile.company ? ` · ${profile.company}` : ''}</div>}
              </div>
              <span className="text-gold-pearl text-lg">→</span>
            </Link>
          ))}
        </div>

        <p className="text-center text-subtle text-xs">
          Powered by <span className="text-gold">SOY_CARD_PRO</span>
        </p>
      </div>
    </main>
  )
}
