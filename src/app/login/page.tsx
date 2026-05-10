'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
  }

  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh' }}
      className="flex items-center justify-center p-4">

      <div className="w-full max-w-sm fade-in-up">

        {/* Back to landing */}
        <div className="text-center mb-8">
          <Link href="/" className="text-subtle text-xs hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>

        <div className="glass-card shimmer-border p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-display text-gold text-2xl tracking-widest mb-2">SOY_CARD_PRO</div>
            <p className="text-muted text-sm">Tu identidad digital premium</p>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-pearl font-semibold text-xl mb-2">Crea tu cuenta gratis</h1>
            <p className="text-subtle text-sm">Sin tarjeta de crédito · Lista en 2 minutos</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="btn-gold w-full flex items-center justify-center gap-3 mb-4 py-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" opacity="0.9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" opacity="0.7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" opacity="0.5" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Apple — coming soon */}
          <button
            disabled
            className="btn-ghost-gold w-full flex items-center justify-center gap-3 py-4 opacity-50 cursor-not-allowed"
            title="Próximamente"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.42.07 2.41.74 3.23.8 1.23-.24 2.41-.93 3.73-.84 1.58.13 2.77.75 3.54 1.9-3.24 1.96-2.47 5.89.5 7.06-.6 1.53-1.37 3.03-3 3.94zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
            <span className="text-xs opacity-60 ml-1">(próximamente)</span>
          </button>

          {/* Divider */}
          <div className="my-6" style={{ borderTop: '1px solid var(--black-border)' }} />

          {/* Privacy */}
          <p className="text-subtle text-xs text-center leading-relaxed">
            Al continuar aceptas nuestros{' '}
            <span className="text-gold-pearl cursor-pointer">Términos de uso</span>{' '}
            y{' '}
            <span className="text-gold-pearl cursor-pointer">Política de privacidad</span>.
          </p>
        </div>

        {/* Already have account */}
        <p className="text-center text-subtle text-xs mt-6">
          ¿Ya tienes cuenta? Google te autenticará automáticamente.
        </p>
      </div>
    </main>
  )
}
