import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicCardView from '@/components/ui/PublicCardView'
import type { Metadata } from 'next'

interface Props { params: Promise<{ username: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params
  const svc = createServiceClient()
  const { data: account } = await svc.from('user_accounts').select('id').eq('username', username).single()
  if (!account) return { title: 'SOY_CARD_PRO' }
  const { data: profile } = await svc.from('profiles').select('display_name, title, company, bio, avatar_url')
    .eq('user_id', account.id).eq('slug', slug).eq('is_active', true).single()
  if (!profile) return { title: 'SOY_CARD_PRO' }
  return {
    title: `${profile.display_name} — SOY_CARD_PRO`,
    description: profile.bio ?? `${profile.title ?? ''} ${profile.company ? `en ${profile.company}` : ''}`.trim(),
    openGraph: { images: profile.avatar_url ? [profile.avatar_url] : [] },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username, slug } = await params
  const svc = createServiceClient()

  const { data: account } = await svc
    .from('user_accounts').select('id, username, full_name').eq('username', username).single()
  if (!account) notFound()

  const { data: profile } = await svc
    .from('profiles').select('*').eq('user_id', account.id).eq('slug', slug).eq('is_active', true).single()
  if (!profile) notFound()

  const appUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://soy-card-pro.vercel.app'}/${username}/${slug}`

  return <PublicCardView profile={profile} username={username} appUrl={appUrl} />
}
