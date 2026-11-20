import { useState, useRef, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'
import { APP_TITLE, PERSON_NAMES } from '../App'

/* ── Helper: vẽ hình chữ nhật bo góc (tương thích trình duyệt cũ) ── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/* ── Vẽ chấm nhỏ tạo hình trái tim bao quanh QR ── */
function drawHeartDots(ctx, cx, cy, safeHalf) {
  const scale = 23
  const rings = 5

  for (let ring = 0; ring < rings; ring++) {
    const ringScale = 1 + ring * 0.11
    const count = 100 + ring * 25

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2

      // Heart parametric: x = 16 sin³(t), y = -(13cos t - 5cos 2t - 2cos 3t - cos 4t)
      const hx = 16 * Math.pow(Math.sin(t), 3)
      const hy = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      )

      const x = cx + hx * scale * ringScale + (Math.random() - 0.5) * 16
      const y = cy + hy * scale * ringScale + (Math.random() - 0.5) * 16 - 25

      // Bỏ qua vùng QR (hình vuông an toàn)
      if (Math.abs(x - cx) < safeHalf && Math.abs(y - (cy - 25)) < safeHalf) continue

      const r = 2 + Math.random() * 4.5
      const alpha = 0.08 + Math.random() * 0.24

      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(181, 72, 93, ${alpha})`
      ctx.fill()
    }
  }
}

export default function StoryQRGenerator() {
  const canvasRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)

  const W = 1080
  const H = 1920

  useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generate = async () => {
    setGenerating(true)
    setReady(false)

    const canvas = canvasRef.current
    if (!canvas) {
      setGenerating(false)
      return
    }
    const ctx = canvas.getContext('2d')
    canvas.width = W
    canvas.height = H

    // Đảm bảo font đã load
    try {
      await Promise.all([
        document.fonts.load('bold 76px "Playfair Display"'),
        document.fonts.load('600 38px "Be Vietnam Pro"'),
        document.fonts.load('32px "Be Vietnam Pro"'),
      ])
    } catch {}

    // ── Background gradient ──
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#FFFBF7')
    grad.addColorStop(0.35, '#FFF6F0')
    grad.addColorStop(0.65, '#FFF0EB')
    grad.addColorStop(1, '#FFFBF7')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // ── Subtle decorative circles ──
    ctx.globalAlpha = 0.035
    for (let i = 0; i < 18; i++) {
      ctx.beginPath()
      ctx.arc(
        Math.random() * W,
        Math.random() * H,
        25 + Math.random() * 90,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = '#B5485D'
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // ── Top decorative line ──
    ctx.strokeStyle = 'rgba(181, 72, 93, 0.12)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(W / 2 - 120, 250)
    ctx.lineTo(W / 2 + 120, 250)
    ctx.stroke()

    // ── Title ──
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#B5485D'
    ctx.font = 'bold 76px "Playfair Display", Georgia, serif'

    // Split title into lines
    const titleLines = APP_TITLE.length > 14
      ? [APP_TITLE.slice(0, Math.ceil(APP_TITLE.length / 2)), APP_TITLE.slice(Math.ceil(APP_TITLE.length / 2))]
      : [APP_TITLE]

    titleLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, 340 + i * 95)
    })

    const titleBottom = 340 + (titleLines.length - 1) * 95 + 60

    // ── Subtitle ──
    ctx.fillStyle = '#5A4A42'
    ctx.globalAlpha = 0.6
    ctx.font = '32px "Be Vietnam Pro", sans-serif'
    const namesJoin =
      PERSON_NAMES.slice(0, -1).join(', ') + ' & ' + PERSON_NAMES.at(-1)
    ctx.fillText(`Gửi lời nhắn đến ${namesJoin}`, W / 2, titleBottom + 40)
    ctx.globalAlpha = 1

    // ── QR Code ──
    const qrSize = 380
    const qrCX = W / 2
    const qrCY = 900
    const qrX = qrCX - qrSize / 2
    const qrY = qrCY - qrSize / 2

    const siteUrl = window.location.origin

    try {
      const qrDataUrl = await QRCode.toDataURL(siteUrl, {
        width: qrSize,
        margin: 2,
        color: { dark: '#B5485D', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      })

      const qrImg = new Image()
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve
        qrImg.onerror = reject
        qrImg.src = qrDataUrl
      })

      // Heart dots (draw behind QR)
      drawHeartDots(ctx, qrCX, qrCY, qrSize / 2 + 35)

      // White card behind QR
      ctx.save()
      ctx.shadowColor = 'rgba(181, 72, 93, 0.12)'
      ctx.shadowBlur = 40
      ctx.shadowOffsetY = 8
      roundRect(ctx, qrX - 24, qrY - 24, qrSize + 48, qrSize + 48, 24)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.restore()

      // Card border
      roundRect(ctx, qrX - 24, qrY - 24, qrSize + 48, qrSize + 48, 24)
      ctx.strokeStyle = 'rgba(181, 72, 93, 0.12)'
      ctx.lineWidth = 2
      ctx.stroke()

      // QR image
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
    } catch (err) {
      console.error('QR generation error:', err)
    }

    // ── Pointing hand ──
    ctx.textAlign = 'center'
    ctx.font = '32px sans-serif'
    ctx.globalAlpha = 0.35
    ctx.fillText('☝️', W / 2, 1180)
    ctx.globalAlpha = 1

    // ── CTA ──
    ctx.fillStyle = '#B5485D'
    ctx.font = '600 38px "Be Vietnam Pro", sans-serif'
    ctx.fillText('Quét mã để gửi điều muốn nói', W / 2, 1250)

    // ── URL hint ──
    ctx.fillStyle = '#3D3D3D'
    ctx.globalAlpha = 0.22
    ctx.font = '24px "Be Vietnam Pro", sans-serif'
    ctx.fillText(siteUrl, W / 2, 1310)
    ctx.globalAlpha = 1

    // ── Decorative separator ──
    ctx.strokeStyle = 'rgba(181, 72, 93, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2 - 160, 1370)
    ctx.lineTo(W / 2 + 160, 1370)
    ctx.stroke()

    // ── Emoji row ──
    ctx.font = '44px serif'
    const emojis = ['💕', '✨', '💌', '✨', '💕']
    emojis.forEach((e, i) => {
      ctx.fillText(e, W / 2 - 180 + i * 90, 1440)
    })

    // ── Bottom instruction ──
    ctx.fillStyle = '#3D3D3D'
    ctx.globalAlpha = 0.2
    ctx.font = '22px "Be Vietnam Pro", sans-serif'
    ctx.fillText(
      'Mở camera điện thoại • Quét mã QR • Viết lời nhắn',
      W / 2,
      1550
    )
    ctx.globalAlpha = 1

    setReady(true)
    setGenerating(false)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'story-qr-loi-nhan.png'
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-2xl border border-wine/10 p-5 mb-5 animate-fade-in-up">
      <h3 className="font-display text-base font-semibold text-wine mb-1">
        📱 Tạo ảnh Story QR
      </h3>
      <p className="text-xs text-charcoal/50 mb-4">
        Tải ảnh về và đăng lên Story Instagram / Facebook / Zalo để bạn bè quét mã.
      </p>

      {/* Preview */}
      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-wine/10 shadow-sm bg-cream"
          style={{ width: '100%', maxWidth: 270, aspectRatio: '9/16' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={generate}
          disabled={generating}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cream text-charcoal/60 text-sm font-medium hover:bg-wine/10 transition-all disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔄'}
          Tạo lại
        </button>
        <button
          onClick={handleDownload}
          disabled={!ready || generating}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-wine text-white text-sm font-medium hover:bg-wine/90 disabled:opacity-50 transition-all"
        >
          <Download className="w-4 h-4" />
          Tải ảnh Story
        </button>
      </div>
    </div>
  )
}
