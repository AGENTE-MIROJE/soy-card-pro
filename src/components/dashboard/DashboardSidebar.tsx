'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserAccount } from '@/lib/supabase/types'

const NAV = [
  { href: '/dashboard',           label: 'Inicio',    icon: '⬡' },
  { href: '/dashboard/profiles',  label: 'Perfiles',  icon: '◈' },
  { href: '/dashboard/leads',     label: 'Leads',     icon: '◉' },
  { href: '/dashboard/analytics', label: 'Analítica', icon: '◎' },
]

export default function DashboardSidebar({ account }: { account: UserAccount | null }) {
  const path = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="sidebar hidden md:flex flex-col" style={{ minWidth: 240 }}>
      {/* Logo */}
      <div className="mb-8 px-2">
        <div className="text-display text-gold text-lg tracking-widest">SOY_CARD_PRO</div>
        {account && (
          <p className="text-subtle text-xs mt-1">@{account.username}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={`sidebar-item ${path === item.href ? 'active' : ''}`}>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {account?.is_admin && (
          <Link href="/admin"
            className={`sidebar-item ${path === '/admin' ? 'active' : ''}`}
            style={{ color: 'var(--gold-matte)' }}>
            <span className="text-base">✦</span>
            Admin
          </Link>
        )}
      </nav>

      {/* Compartir rápido */}
      <Link href="/dashboard/share"
        className="btn-gold text-center text-xs py-2 mb-4" style={{ textDecoration: 'none' }}>
        ⚡ Compartir ahora
      </Link>

      {/* Logout */}
      <button onClick={handleLogout} className="sidebar-item text-left">
        <span>↗</span> Salir
      </button>
    </aside>
  )
}
