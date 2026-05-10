import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      style={{ background: 'var(--black-deep)' }}>

      {/* Decorative orb */}
      <div className="relative mb-8" style={{ width: 140, height: 140 }}>
        <div className="absolute inset-0 rounded-full opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{ background: 'var(--black-card)', border: '1px solid var(--gold-border)' }}>
          <span className="text-display font-bold" style={{ fontSize: 56, color: 'var(--gold-matte)', lineHeight: 1 }}>
            ◈
          </span>
        </div>
      </div>

      <p className="text-subtle text-xs uppercase tracking-widest mb-3">Error 404</p>
      <h1 className="text-display text-pearl text-3xl md:text-4xl mb-4 leading-tight">
        Tarjeta no encontrada
      </h1>
      <p className="text-muted max-w-sm leading-relaxed mb-8">
        El perfil que buscas no existe o ya no está disponible.
        Puede que el enlace esté desactualizado.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-gold px-8 py-3" style={{ textDecoration: 'none' }}>
          Ir al inicio
        </Link>
        <Link href="/dashboard" className="btn-ghost-gold px-8 py-3" style={{ textDecoration: 'none' }}>
          Mi dashboard
        </Link>
      </div>

      <p className="mt-12 text-subtle text-xs">
        Powered by <span className="text-gold font-semibold">SOY_CARD_PRO</span>
      </p>
    </main>
  )
}
