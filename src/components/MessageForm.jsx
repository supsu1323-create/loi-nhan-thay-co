import { useState } from 'react'
import { Send, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { RECIPIENTS, CARD_COLORS } from '../App'
import ThankYouModal from './ThankYouModal'

export default function MessageForm({ onSuccess, showToast }) {
  const [recipient, setRecipient] = useState(RECIPIENTS[0])
  const [senderName, setSenderName] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [cardColor, setCardColor] = useState('cream')
  const [loading, setLoading] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const MAX_CHARS = 1000

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || loading) return

    setLoading(true)
    try {
      const { error } = await supabase.from('messages').insert({
        sender_name: senderName.trim() || 'Ẩn danh',
        recipient,
        content: content.trim(),
        is_public: isPublic,
        card_color: cardColor,
      })

      if (error) throw error

      // Reset form
      setContent('')
      setSenderName('')
      setIsPublic(true)
      setCardColor('cream')
      setRecipient(RECIPIENTS[0])

      // Show thank-you popup
      setShowThankYou(true)

      // Refresh public board if the message was public
      if (isPublic) onSuccess()
    } catch (err) {
      console.error(err)
      const msg = err?.message || err?.error_description || 'Có lỗi xảy ra, thử lại nhé!'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-wine/10 p-5 sm:p-6 mb-8 animate-fade-in-up"
      >
        {/* ── Gửi tới ai ── */}
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-charcoal/70">
            Gửi tới ai?
          </label>
          {recipient !== RECIPIENTS[0] ? (
            <span className="text-[11px] font-medium text-wine bg-wine/10 px-2.5 py-0.5 rounded-full animate-fade-in">
              💌 Gửi riêng cho: <b>{recipient}</b>
            </span>
          ) : (
            <span className="text-[11px] text-charcoal/40">
              Gửi chung cả 3 thầy cô
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {RECIPIENTS.map((r, idx) => (
            <button
              key={r}
              type="button"
              onClick={() => setRecipient(r)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                recipient === r
                  ? 'bg-wine text-white shadow-sm scale-105'
                  : 'bg-cream text-charcoal/60 hover:bg-wine/10'
              }`}
            >
              {idx === 0 ? `✨ ${r}` : `🌸 Gửi riêng ${r}`}
            </button>
          ))}
        </div>

        {/* ── Tên người gửi ── */}
        <label className="block text-xs font-semibold text-charcoal/70 mb-1.5">
          Tên của bạn
        </label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="Để trống nếu muốn ẩn danh..."
          maxLength={50}
          className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-wine/10 text-sm
                     focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine/30
                     placeholder:text-charcoal/30 mb-5 transition-all"
        />

        {/* ── Nội dung ── */}
        <label className="block text-xs font-semibold text-charcoal/70 mb-1.5">
          Lời muốn nói
        </label>
        <div className="relative mb-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Viết gì đó dễ thương đi..."
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-wine/10 text-sm
                       focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine/30
                       placeholder:text-charcoal/30 resize-none transition-all"
          />
          <span
            className={`absolute bottom-2.5 right-3 text-[11px] ${
              content.length >= MAX_CHARS ? 'text-red-400' : 'text-charcoal/25'
            }`}
          >
            {content.length}/{MAX_CHARS}
          </span>
        </div>

        {/* ── Chế độ hiển thị ── */}
        <label className="block text-xs font-semibold text-charcoal/70 mb-2">
          Chế độ hiển thị
        </label>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              isPublic
                ? 'border-wine bg-wine/5 text-wine shadow-sm'
                : 'border-charcoal/10 text-charcoal/40 hover:border-wine/20'
            }`}
          >
            <Eye className="w-4 h-4" />
            Công khai
          </button>
          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              !isPublic
                ? 'border-wine bg-wine/5 text-wine shadow-sm'
                : 'border-charcoal/10 text-charcoal/40 hover:border-wine/20'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            Gửi âm thầm
          </button>
        </div>
        <p className="text-[11px] text-charcoal/35 -mt-3 mb-5 pl-1">
          {isPublic
            ? '✦ Hiện ngay trên bảng lời nhắn để mọi người cùng đọc.'
            : '✦ Chỉ 3 người nhận đọc được trong Góc bí mật.'}
        </p>

        {/* ── Màu giấy note ── */}
        <label className="block text-xs font-semibold text-charcoal/70 mb-2">
          Màu giấy note
        </label>
        <div className="flex gap-3 mb-6">
          {Object.entries(CARD_COLORS).map(([key, { bg, border, label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCardColor(key)}
              title={label}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                cardColor === key
                  ? 'ring-2 ring-wine ring-offset-2 ring-offset-cream scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: bg, borderColor: border }}
            />
          ))}
        </div>

        {/* ── Nút gửi ── */}
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                     bg-wine text-white font-semibold text-sm
                     hover:bg-wine/90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? 'Đang gửi...' : 'Gửi lời nhắn 💌'}
        </button>
      </form>

      {showThankYou && (
        <ThankYouModal onClose={() => setShowThankYou(false)} />
      )}
    </>
  )
}
