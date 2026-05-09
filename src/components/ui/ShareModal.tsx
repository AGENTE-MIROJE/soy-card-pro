'use client'
import { useState, useEffect } from 'react'
import type { Profile } from '@/lib/supabase/types'

interface Props { profile: Profile; username: string; appUrl: string; onClose: () => void }

export default function ShareModal({ profile, username, appUrl, onClose }: Props) {
  const [qrSrc, setQrSrc]         = useState<string | null>(null)
  const [copied, setCopied]        = useState(false)
  const [nfcSupported, setNfc]     = useState(false)
  const [nfcWriting, setNfcWr]     = useState(false)
  const [nfcMsg, setNfcMsg]        = useState('')
  const [sharing, setSharing]      = useState(false)
  const [canShareFile, setCanShare] = useState(false)

  useEffect(() => {
    setQrSrc(`/api/qr/${profile.id}?via=qr`)
    if (typeof window !== 'undefined') {
      if ('NDEFReader' in window) setNfc(true)
      // Probar si el browser soporta compartir archivos
      if (navigator.canShare?.({ files: [new File([''], 'test.png', { type: 'image/png' })] })) {
        setCanShare(true)
      }
    }
  }, [profile.id])

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${appUrl}?via=link`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: profile.display_name, text: profile.bio ?? '', url: `${appUrl}?via=link` })
      } catch { /* user cancelled */ }
    } else {
      copyLink()
    }
  }

  // Descarga directa usando anchor DOM — funciona en todos los browsers incluyendo mobile
  const downloadQR = () => {
    const a = document.createElement('a')
    a.href = `/api/qr/${profile.id}?format=png`
    a.download = `qr-${profile.slug}.png`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => document.body.removeChild(a), 200)
  }

  // Compartir QR como imagen con Web Share API (solo mobile browsers con soporte)
  const shareQR = async () => {
    setSharing(true)
    try {
      const res = await fetch(`/api/qr/${profile.id}?format=png`)
      const blob = await res.blob()
      const file = new File([blob], `qr-${profile.slug}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `QR de ${profile.display_name}` })
      } else {
        downloadQR()
      }
    } catch {
      downloadQR()
    } finally {
      setSharing(false)
    }
  }

  const writeNFC = async () => {
    if (!('NDEFReader' in window)) return
    setNfcWr(true); setNfcMsg('Acerca una etiqueta NFC...')
    try {
      const ndef = new (window as any).NDEFReader()
      await ndef.write({ records: [{ recordType: 'url', data: `${appUrl}?via=nfc` }] })
      setNfcMsg('✓ NFC programado correctamente')
    } catch {
      setNfcMsg('✗ Error al escribir. Inténtalo de nuevo.')
    }
    setNfcWr(false)
    setTimeout(() => setNfcMsg(''), 3000)
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="bottom-sheet-handle" />

        <h2 className="text-pearl text-display text-lg font-bold text-center mb-5">
          Compartir Tarjeta
        </h2>

        {/* QR Code */}
        {qrSrc && (
          <div className="flex flex-col items-center mb-6 gap-3">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--black-surface)', border: '1px solid var(--gold-border)' }}>
              <img src={qrSrc} alt="QR Code" width={180} height={180}
                className="rounded-xl" style={{ imageRendering: 'pixelated' }} />
              <p className="text-center text-subtle text-xs mt-2">Escanea para abrir mi tarjeta</p>
            </div>
            {/* Botones QR: descargar + compartir como imagen */}
            <div className="flex gap-2 w-full">
              <button onClick={downloadQR}
                className="btn-ghost-gold text-xs py-2 flex-1 flex items-center justify-center gap-1.5">
                <span>⬇</span> Descargar PNG
              </button>
              {canShareFile && (
                <button onClick={shareQR} disabled={sharing}
                  className="btn-ghost-gold text-xs py-2 flex-1 flex items-center justify-center gap-1.5">
                  <span>↑</span> {sharing ? 'Compartiendo...' : 'Compartir imagen'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Opciones de compartir */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <button onClick={copyLink} className="btn-icon py-4">
            <span className="text-xl">{copied ? '✓' : '⎘'}</span>
            <span>{copied ? 'Copiado' : 'Copiar link'}</span>
          </button>

          <button onClick={shareLink} className="btn-icon py-4">
            <span className="text-xl">↑</span>
            <span>Compartir</span>
          </button>

          {profile.email && (
            <button onClick={() => window.location.href = `mailto:?subject=Mi tarjeta digital&body=${encodeURIComponent(appUrl)}`}
              className="btn-icon py-4">
              <span className="text-xl">✉</span>
              <span>Email</span>
            </button>
          )}

          {profile.phone && (
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Mi tarjeta digital: ${appUrl}?via=link`)}`, '_blank', 'noopener,noreferrer')}
              className="btn-icon py-4">
              <span className="text-xl">💬</span>
              <span>WhatsApp</span>
            </button>
          )}

          <button onClick={() => window.open(`/api/wallet/google/${profile.id}`, '_blank')}
            className="btn-icon py-4">
            <span className="text-xl">◳</span>
            <span>G. Wallet</span>
          </button>

          {nfcSupported && (
            <button onClick={writeNFC} disabled={nfcWriting} className="btn-icon py-4">
              <span className="text-xl">📡</span>
              <span>{nfcWriting ? '...' : 'Escribir NFC'}</span>
            </button>
          )}
        </div>

        {nfcMsg && (
          <p className="text-center text-sm mb-3"
            style={{ color: nfcMsg.startsWith('✓') ? 'var(--gold-matte)' : 'var(--pearl-muted)' }}>
            {nfcMsg}
          </p>
        )}

        {/* Link visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
          style={{ background: 'var(--black-surface)', border: '1px solid var(--black-border)' }}>
          <span className="text-subtle text-xs truncate flex-1">{appUrl}</span>
          <button onClick={copyLink} className="text-gold text-xs flex-shrink-0 flex-shrink-0">
            {copied ? '✓' : 'Copiar'}
          </button>
        </div>

        <button onClick={onClose} className="btn-ghost-gold w-full py-3">Cerrar</button>
      </div>
    </>
  )
}
