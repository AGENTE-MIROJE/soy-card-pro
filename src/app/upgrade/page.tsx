import Link from 'next/link'

const FEATURES_PRO = [
  'Perfiles ilimitados',
  'NFC inteligente',
  'Google Wallet',
  'CRM avanzado — exportar leads',
  'Analítica detallada por canal',
  'Soporte prioritario',
  'Personalización de colores y foto de portada',
]

const FEATURES_FREE = [
  '1 perfil activo',
  'QR + link único',
  'Captura de leads (hasta 20)',
  'Analítica básica',
]

export default function UpgradePage() {
  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh' }} className="px-4 py-16">
      <div className="max-w-4xl mx-auto fade-in-up">

        <div className="text-center mb-14">
          <span className="badge-nfc text-xs py-1.5 px-4 mb-6 inline-block">✦ Upgrade</span>
          <h1 className="text-display text-pearl text-3xl sm:text-4xl mb-3">
            Elige tu plan
          </h1>
          <p className="text-muted">Empieza gratis. Escala cuando crezcas.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

          {/* Free */}
          <div className="p-8 rounded-2xl flex flex-col gap-5"
            style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)' }}>
            <div>
              <div className="text-muted text-sm font-medium mb-1">Gratis</div>
              <div className="flex items-end gap-1">
                <span className="text-display text-pearl text-4xl font-bold">$0</span>
                <span className="text-muted text-sm mb-1">para siempre</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {FEATURES_FREE.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-gold text-xs">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="btn-ghost-gold text-center text-sm py-3 mt-auto" style={{ textDecoration: 'none' }}>
              Tu plan actual
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-2xl flex flex-col gap-5 shimmer-border"
            style={{ background: 'var(--black-card)', border: '1px solid var(--gold-border)', boxShadow: 'var(--shadow-gold)' }}>
            <span className="badge-nfc self-start">Más popular</span>
            <div>
              <div className="text-muted text-sm font-medium mb-1">Pro</div>
              <div className="flex items-end gap-1">
                <span className="text-display text-pearl text-4xl font-bold">$9</span>
                <span className="text-muted text-sm mb-1">/ mes</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {FEATURES_PRO.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-gold text-xs">✓</span>{f}
                </li>
              ))}
            </ul>
            {/* Placeholder — real payment flow Sprint 2 */}
            <button disabled
              className="btn-gold text-center text-sm py-3 mt-auto opacity-70 cursor-not-allowed">
              Próximamente
            </button>
          </div>

        </div>

        <p className="text-subtle text-xs text-center mt-8">
          Pagos seguros · Cancela cuando quieras · Sin contratos
        </p>

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-subtle text-xs hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
