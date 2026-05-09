'use client'
import { useState, useEffect } from 'react'
import type { Profile } from '@/lib/supabase/types'

interface Props { profile: Profile; username: string; appUrl: string; onClose: () => void }

export default function ShareModal({ profile, username, appUrl, onClose }: Props) {
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [nfcSupported, setNfcSupported] = useState(false)
  const [nfcWriting, setNfcWriting] = useState(false)
  const [nfcMsg, setNfcMsg] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setQrSrc(`/api/qr/${profile.id}?via=qr`)
    if (typeof window !== 'undefined' && 'NDEFReader' in window) setNfcSupported(true)
  }, [profile.id])

  const copyLink = async () => {
    await navigator.clipboard.writeText(appUrl + '?via=link')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title: profile.display_name, text: profile.bio ?? '', url: appUrl + '?via=link' })
    } else copyLink()
  }

  const downloadQR = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/qr/${profile.id}?format=png&via=qr`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${profile.slug}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const writeNFC = async () => {
    if (!('NDEFReader' in window)) return
    setNfcWriting(true); setNfcMsg('Acerca una etiqueta NFC...')
    try {
      const ndef = new (window as any).NDEFReader()
      await ndef.write({ records: [{ recordType: 'url', data: appUrl + '?via=nfc' }] })
      setNfcMsg('✓ NFC programado correctamente')
    } catch {
      setNfcMsg('✗ Error al escribir. Inténtalo de nuevo.')
    }
    setNfcWriting(false)
    setTimeout(() => setNfcMsg(''), 3000)
  }

  const addToWallet = () => {
    window.open(`/api/wallet/google/${profile.id}`, '_blank')
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
            <button onClick={downloadQR} disabled={downloading}
              className="btn-ghost-gold text-xs py-2 px-4 flex items-center gap-2">
              <span>⬇</span>
              <span>{downloading ? 'Descargando...' : 'Descargar QR (PNG)'}</span>
            </button>
          </div>
        )}

        {/* Opciones de compartir */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <button onClick={copyLink} className="btn-icon py-4">
            <span className="text-xl">{copied ? '✓' : '⎘'}</span>
            <span>{copied ? 'Copiado' : 'Copiar link'}</span>
          </button>

          <button onClick={shareNative} className="btn-icon py-4">
            <span className="text-xl">↑</span>
            <span>Compartir</span>
          </button>

          {profile.email && (
            <a href={`mailto:?subject=Mi tarjeta digital&body=${appUrl}?via=email`}
              className="btn-icon py-4" style={{ textDecoration: 'none' }}>
              <span className="text-xl">✉</span>
              <span>Email</span>
            </a>
          )}

          {profile.phone && (
            <a href={`https://wa.me/?text=${encodeURIComponent(`Mi tarjeta digital: ${appUrl}?via=link`)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-icon py-4" style={{ textDecoration: 'none' }}>
              <span className="text-xl">💬</span>
              <span>WhatsApp</span>
            </a>
          )}

          <button onClick={addToWallet} className="btn-icon py-4">
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
          <button onClick={copyLink} className="text-gold text-xs flex-shrink-0">
            {copied ? '✓' : 'Copiar'}
          </button>
        </div>

        <button onClick={onClose} className="btn-ghost-gold w-full py-3">
          Cerrar
        </button>
      </div>
    </>
  )
}
