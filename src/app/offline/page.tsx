'use client'

export default function OfflinePage() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      style={{ background: 'var(--black-deep)' }}>

      <div className="relative mb-8" style={{ width: 120, height: 120 }}>
        <div className="absolute inset-0 rounded-full opacity-20 blur-2xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{ background: 'var(--black-card)', border: '1px solid var(--gold-border)' }}>
          <span className="text-5xl">⚡</span>
        </div>
      </div>

      <p className="text-subtle text-xs uppercase tracking-widest mb-3">Sin conexión</p>
      <h1 className="text-display text-pearl text-3xl md:text-4xl mb-4 leading-tight">
        Modo offline
      </h1>
      <p className="text-muted max-w-sm leading-relaxed mb-8">
        No hay conexión a internet, pero tu tarjeta está guardada en este dispositivo.
        Tus tarjetas descargadas anteriormente seguirán disponibles.
      </p>

      <div className="space-y-3 w-full max-w-sm">
        <div className="p-4 rounded-xl" style={{ background: 'var(--black-card)', border: '1px solid var(--black-border)' }}>
          <p className="text-pearl text-sm font-semibold mb-2">✓ Disponible</p>
          <p className="text-subtle text-xs">Tu tarjeta pública, QR y datos guardados</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--black-card)', border: '1px solid var(--black-border)' }}>
          <p className="text-gold-pearl text-sm font-semibold mb-2">⟳ Pendiente</p>
          <p className="text-subtle text-xs">Los leads nuevos se guardarán cuando vuelva la conexión</p>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-8 btn-gold px-8 py-3">
        Reintentar conexión
      </button>

      <p className="mt-12 text-subtle text-xs">
        SOY_CARD_PRO funciona offline gracias a Service Worker
      </p>
    </main>
  )
}
