'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',           label: 'Inicio',    icon: '⬡' },
  { href: '/dashboard/profiles',  label: 'Perfiles',  icon: '◈' },
  { href: '/dashboard/leads',     label: 'Leads',     icon: '◉' },
  { href: '/dashboard/analytics', label: 'Analítica', icon: '◎' },
]

export default function MobileBottomNav({ isAdmin }: { isAdmin?: boolean }) {
  const path = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
      style={{
        background: 'var(--black-card)',
        borderTop: '1px solid var(--black-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}>
      {NAV.map(item => (
        <Link key={item.href} href={item.href}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
          style={{
            color: path === item.href ? 'var(--gold-matte)' : 'var(--pearl-muted)',
            background: path === item.href ? 'var(--gold-glass)' : 'transparent',
          }}>
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
      {isAdmin ? (
        <Link href="/admin"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
          style={{
            color: path === '/admin' ? 'var(--gold-matte)' : 'var(--pearl-muted)',
            background: path === '/admin' ? 'var(--gold-glass)' : 'transparent',
          }}>
          <span className="text-lg leading-none">✦</span>
          <span className="text-[10px] font-medium">Admin</span>
        </Link>
      ) : (
        <Link href="/dashboard/share"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg"
          style={{ color: 'var(--gold-matte)' }}>
          <span className="text-lg leading-none">⚡</span>
          <span className="text-[10px] font-medium">Compartir</span>
        </Link>
      )}
    </nav>
  )
}
