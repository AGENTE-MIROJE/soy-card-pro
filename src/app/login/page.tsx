'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh' }}
      className="flex items-center justify-center p-4">
      <div className="glass-card shimmer-border w-full max-w-sm p-8 fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-display text-gold text-2xl tracking-widest mb-1">SOY_CARD_PRO</div>
          <p className="text-muted text-sm">Tu identidad digital premium</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-gold text-4xl mb-4">✉</div>
            <p className="text-pearl font-semibold mb-2">Revisa tu correo</p>
            <p className="text-muted text-sm">Hemos enviado el enlace de acceso a <span className="text-gold-pearl">{email}</span></p>
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-muted text-xs uppercase tracking-widest block mb-2">Correo electrónico</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-gold"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full">
                {loading ? 'Enviando...' : 'Ingresar con Magic Link'}
              </button>
            </form>

            <div className="divider-gold relative flex items-center justify-center">
              <span className="text-subtle text-xs px-3 absolute"
                style={{ background: 'var(--black-card)' }}>o continúa con</span>
            </div>

            <button onClick={handleGoogle} className="btn-ghost-gold w-full flex items-center justify-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#C9A84C" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#E8D5A3" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#F5E6C8" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#C9A84C" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </>
        )}
      </div>
    </main>
  )
}
