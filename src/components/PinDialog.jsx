import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

export default function PinDialog({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pin.trim() || loading) return
    setLoading(true)
    setError('')

    const success = await onUnlock(pin.trim())
    if (!success) {
      setError('Mã PIN không đúng, thử lại nhé!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-7 max-w-xs w-full shadow-sm border border-wine/10 text-center animate-scale-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-wine/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-wine" />
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold text-wine mb-1">Góc bí mật</h2>
        <p className="text-xs text-charcoal/50 mb-5">
          Nhập mã PIN chung của nhóm để xem tất cả lời nhắn
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setError('')
            }}
            placeholder="Nhập mã PIN..."
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl bg-cream border border-wine/10 text-center text-lg tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-wine/30 placeholder:text-charcoal/20 placeholder:tracking-normal mb-3 transition-all"
            autoFocus
          />

          {error && (
            <p className="text-red-500 text-xs mb-3 animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={!pin.trim() || loading}
            className="w-full py-3 rounded-xl bg-wine text-white font-medium text-sm hover:bg-wine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {loading ? 'Đang kiểm tra...' : 'Mở khóa'}
          </button>
        </form>

        <a
          href="/"
          className="inline-block mt-5 text-xs text-charcoal/40 hover:text-wine transition-colors"
        >
          ← Quay về trang chính
        </a>
      </div>
    </div>
  )
}
