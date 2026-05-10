import Link from 'next/link'

const FEATURES = [
  {
    icon: '◈',
    title: 'Multi-perfil',
    desc: 'CEO, consultor, creador. Un perfil por faceta. Un QR que lo agrupa todo.',
  },
  {
    icon: '📡',
    title: 'NFC Inteligente',
    desc: 'Acerca tu teléfono y comparte al instante. Sin apps, sin fricción.',
  },
  {
    icon: '◉',
    title: 'Captura de leads',
    desc: 'Quien escanea puede dejarte su contacto en segundos. CRM integrado.',
  },
  {
    icon: '◎',
    title: 'Analítica real',
    desc: 'Escaneos por canal, dispositivo y hora. Sabe quién te está buscando.',
  },
  {
    icon: '⬇',
    title: 'vCard automática',
    desc: 'Con foto y redes incluidas. Un toque y tu contacto queda guardado.',
  },
  {
    icon: '◳',
    title: 'Google Wallet',
    desc: 'Tu tarjeta en el monedero digital de tus contactos. Siempre a mano.',
  },
]

const STEPS = [
  { n: '01', title: 'Crea tu perfil', desc: 'Nombre, foto, cargo, empresa, redes sociales. Listo en 2 minutos.' },
  { n: '02', title: 'Comparte tu QR o link', desc: 'Muéstralo en pantalla, envíalo por WhatsApp o prográmalo en NFC.' },
  { n: '03', title: 'Captura contactos', desc: 'Quien lo escanea deja sus datos. Los ves en tiempo real en tu dashboard.' },
]

const TESTIMONIALS = [
  {
    text: '"Dejé de repartir tarjetas de papel en ferias. Ahora escanean mi QR y quedan en mi CRM automáticamente."',
    name: 'Laura M.', role: 'Consultora independiente',
  },
  {
    text: '"Tengo un perfil como CEO y otro como orador. Cada uno con su imagen. Una sola app."',
    name: 'Ricardo P.', role: 'Empresario · Bogotá',
  },
  {
    text: '"Lo mejor: el analítico. Sé cuándo y desde dónde me escanearon. Pura inteligencia comercial."',
    name: 'Valeria C.', role: 'Directora comercial',
  },
]

const PLANS = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    features: ['1 perfil activo', 'QR + link único', 'Captura de leads', 'Analítica básica'],
    cta: 'Comenzar gratis',
    href: '/login',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/ mes',
    features: ['Perfiles ilimitados', 'NFC + Google Wallet', 'CRM avanzado', 'Analítica detallada', 'Soporte prioritario'],
    cta: 'Ir a Pro',
    href: '/login',
    highlight: true,
  },
]

const STATS = [
  { n: '10K+', label: 'tarjetas compartidas' },
  { n: '98%', label: 'compatibilidad móvil' },
  { n: '2 min', label: 'para estar listo' },
]

export default function HomePage() {
  return (
    <main style={{ background: 'var(--black-deep)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-display text-gold text-xl tracking-widest">SOY_CARD_PRO</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost-gold text-xs py-2 px-5" style={{ textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
          <Link href="/login" className="btn-gold text-xs py-2 px-5" style={{ textDecoration: 'none' }}>
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="flex flex-col items-center text-center px-6 pt-12 pb-20 max-w-3xl mx-auto fade-in-up">
        <span className="badge-nfc mb-6 text-xs py-1.5 px-4">100% digital · Sin app · Sin papel</span>

        <h1 className="text-display text-pearl mb-5"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          La tarjeta de visita<br />
          <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            que trabaja por ti
          </span>
        </h1>

        <p className="text-muted text-lg mb-10 max-w-xl" style={{ lineHeight: 1.7 }}>
          Comparte tu identidad profesional con un QR, un link o un toque NFC.
          Captura contactos automáticamente y analiza quién te escanea.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-sm mx-auto">
          <Link href="/login" className="btn-gold px-10 py-4 text-sm w-full text-center" style={{ textDecoration: 'none' }}>
            Crear mi tarjeta gratis
          </Link>
          <Link href="/login"
            className="btn-ghost-gold px-10 py-4 text-sm w-full text-center" style={{ textDecoration: 'none' }}>
            Iniciar sesión →
          </Link>
        </div>

        {/* Social proof micro */}
        <p className="text-subtle text-xs mt-6">Sin tarjeta de crédito · Gratis para siempre en el plan básico</p>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-6 w-full max-w-md">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-display text-gold text-2xl font-bold">{s.n}</div>
              <div className="text-subtle text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mock card preview */}
        <div className="mt-16 w-full max-w-xs mx-auto">
          <div className="glass-card shimmer-border p-6 text-left" style={{ borderColor: 'var(--gold-border)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="avatar-gold-ring flex-shrink-0" style={{ width: 56, height: 56 }}>
                <div className="rounded-full flex items-center justify-center font-bold text-xl"
                  style={{ width: 56, height: 56, background: 'var(--gold-glass)', color: 'var(--gold-matte)' }}>
                  CS
                </div>
              </div>
              <div>
                <div className="text-pearl font-semibold text-display">Carlos Saavedra</div>
                <div className="text-gold text-sm">CEO · SOY_CARD_PRO</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['linkedin', 'instagram', 'github'].map(p => (
                <span key={p} className="badge-nfc text-xs capitalize">{p}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex-1 text-center py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--gold-glass)', color: 'var(--gold-matte)', border: '1px solid var(--gold-border)' }}>
                📞 Llamar
              </div>
              <div className="flex-1 text-center py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--gold-glass)', color: 'var(--gold-matte)', border: '1px solid var(--gold-border)' }}>
                💬 WhatsApp
              </div>
            </div>
          </div>
          <p className="text-subtle text-xs text-center mt-3">Así se ve tu tarjeta para quien la recibe</p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: 'var(--black-card)', borderTop: '1px solid var(--black-border)', borderBottom: '1px solid var(--black-border)' }}
        className="py-8 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-pearl font-semibold mb-1">Sin papel. Sin límites.</div>
            <div className="text-muted text-sm">Tu tarjeta siempre actualizada, en cualquier dispositivo.</div>
          </div>
          <div>
            <div className="text-pearl font-semibold mb-1">Captura leads 24/7</div>
            <div className="text-muted text-sm">Cada escaneo puede convertirse en un cliente potencial.</div>
          </div>
          <div>
            <div className="text-pearl font-semibold mb-1">Analítica de verdad</div>
            <div className="text-muted text-sm">Saber cuándo te buscaron vale más que repartir tarjetas a ciegas.</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-display text-pearl text-3xl mb-3">Todo lo que necesitas</h2>
          <p className="text-muted">Una sola plataforma para tu presencia digital profesional.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="surface-card p-6 flex flex-col gap-3 transition-all hover:border-gold-matte"
              style={{ borderColor: 'var(--black-border)' }}>
              <span className="text-3xl text-gold">{f.icon}</span>
              <h3 className="text-pearl font-semibold text-lg">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="px-6 py-20" style={{ background: 'var(--black-card)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-display text-pearl text-3xl mb-3">Cómo funciona</h2>
            <p className="text-muted">De cero a compartiendo en menos de 5 minutos.</p>
          </div>
          <div className="flex flex-col gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--gold-glass)', border: '1px solid var(--gold-border)', color: 'var(--gold-matte)' }}>
                  {s.n}
                </div>
                <div className="pt-1">
                  <h3 className="text-pearl font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/login" className="btn-gold px-10 py-4 text-sm inline-block" style={{ textDecoration: 'none' }}>
              Empezar ahora — es gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-display text-pearl text-3xl mb-3">Lo que dicen nuestros usuarios</h2>
          <p className="text-muted">Profesionales que ya dejaron el papel atrás.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="surface-card p-6 flex flex-col gap-4"
              style={{ borderColor: 'var(--black-border)' }}>
              <p className="text-muted text-sm leading-relaxed italic">{t.text}</p>
              <div className="mt-auto pt-2 border-t" style={{ borderColor: 'var(--black-border)' }}>
                <div className="text-pearl text-sm font-semibold">{t.name}</div>
                <div className="text-subtle text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-6 py-20" style={{ background: 'var(--black-card)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-display text-pearl text-3xl mb-3">Planes</h2>
            <p className="text-muted">Empieza gratis. Escala cuando crezcas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PLANS.map((plan, i) => (
              <div key={i} className={`p-8 rounded-2xl flex flex-col gap-5 ${plan.highlight ? 'shimmer-border' : ''}`}
                style={{
                  background: plan.highlight ? 'var(--black-surface)' : 'var(--black-surface)',
                  border: plan.highlight ? '1px solid var(--gold-border)' : '1px solid var(--black-border)',
                  boxShadow: plan.highlight ? 'var(--shadow-gold)' : 'var(--shadow-card)',
                }}>
                {plan.highlight && (
                  <span className="badge-nfc self-start">Más popular</span>
                )}
                <div>
                  <div className="text-muted text-sm font-medium mb-1">{plan.name}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-display text-pearl text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted text-sm mb-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted">
                      <span className="text-gold text-xs">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}
                  className={plan.highlight ? 'btn-gold text-center text-sm py-3' : 'btn-ghost-gold text-center text-sm py-3'}
                  style={{ textDecoration: 'none', marginTop: 'auto' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto fade-in-up">
          <div className="divider-gold w-16 mx-auto mb-8" />
          <h2 className="text-display text-pearl text-3xl mb-4">
            Tu próxima conexión te está esperando
          </h2>
          <p className="text-muted text-lg mb-3">
            Crea tu tarjeta digital en 2 minutos.
          </p>
          <p className="text-subtle text-sm mb-10">Sin tarjeta de crédito. Sin fricción.</p>
          <Link href="/login" className="btn-gold px-12 py-4 text-base inline-block" style={{ textDecoration: 'none' }}>
            Crear mi tarjeta gratis
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-8 text-center border-t" style={{ borderColor: 'var(--black-border)', background: 'var(--black-card)' }}>
        <p className="text-display text-gold text-sm tracking-widest mb-3">SOY_CARD_PRO</p>
        <p className="text-subtle text-xs">
          © 2026 SOY_CARD_PRO · Hecho en Colombia 🇨🇴
        </p>
      </footer>

    </main>
  )
}
