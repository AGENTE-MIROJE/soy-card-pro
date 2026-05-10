'use client'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  // Output a square 512×512
  const outputSize = 512
  canvas.width = outputSize
  canvas.height = outputSize

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0, outputSize, outputSize
  )

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')), 'image/jpeg', 0.88)
  )
}

interface AvatarCropperProps {
  imageSrc: string      // data URL from FileReader
  onComplete: (blob: Blob) => void
  onCancel: () => void
}

export default function AvatarCropper({ imageSrc, onComplete, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onComplete(blob)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'rgba(5,5,7,0.97)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--black-border)' }}>
        <button onClick={onCancel} className="text-subtle text-sm hover:text-pearl transition-colors">
          Cancelar
        </button>
        <span className="text-pearl font-semibold text-sm tracking-wide">Ajustar foto</span>
        <button onClick={handleConfirm} disabled={processing}
          className="text-sm font-bold transition-colors"
          style={{ color: 'var(--gold-matte)' }}>
          {processing ? 'Procesando...' : 'Aplicar'}
        </button>
      </div>

      {/* Crop area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#050507' },
            cropAreaStyle: {
              border: '2px solid #C9A84C',
              boxShadow: '0 0 0 9999px rgba(5,5,7,0.75)',
            },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex-shrink-0 px-6 py-4 flex items-center gap-4"
        style={{ borderTop: '1px solid var(--black-border)' }}>
        <span className="text-subtle text-xs w-4">⊖</span>
        <input
          type="range" min={1} max={3} step={0.01}
          value={zoom} onChange={e => setZoom(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--gold-matte)', background: 'var(--black-border)' }}
        />
        <span className="text-subtle text-xs w-4">⊕</span>
      </div>

      <p className="text-center text-subtle text-xs pb-4 flex-shrink-0">
        Arrastra para centrar · desliza para hacer zoom
      </p>
    </div>
  )
}
