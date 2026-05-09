import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh' }}
      className="flex flex-col items-center justify-center p-6 text-center">
      <div className="fade-in-up max-w-md w-full">
        <div className="text-display text-gold text-4xl tracking-widest mb-2">SOY_CARD_PRO</div>
        <div className="divider-gold w-32 mx-auto" />
        <p className="text-muted text-base mb-8 mt-4">
          Tu tarjeta de visita digital premium.<br/>
          Multi-perfil · NFC inteligente · Captura de leads.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link href="/login" className="btn-gold px-10 py-3 text-center inline-block" style={{ textDecoration: 'none' }}>
            Comenzar gratis
          </Link>
          <Link href="/login" className="btn-ghost-gold px-10 py-3 text-center inline-block" style={{ textDecoration: 'none' }}>
            Ver demo →
          </Link>
        </div>
        <p className="text-subtle text-xs mt-8">Sin tarjeta física · Sin app · 100% digital</p>
      </div>
    </main>
  )
}
