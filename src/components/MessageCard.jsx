import { User, Tag } from 'lucide-react'
import { CARD_COLORS } from '../App'
import { timeAgo } from '../utils/timeAgo'

export default function MessageCard({ message, style }) {
  const color = CARD_COLORS[message.card_color] || CARD_COLORS.cream

  return (
    <div
      className="rounded-xl p-4 shadow-sm border animate-fade-in-up break-inside-avoid mb-3"
      style={{ backgroundColor: color.bg, borderColor: color.border, ...style }}
    >
      {/* Sender */}
      <div className="flex items-center gap-1.5 mb-2">
        <User className="w-3.5 h-3.5 text-charcoal/40" />
        <span className="text-xs font-medium text-charcoal/60">
          {message.sender_name}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap break-words mb-3">
        {message.content}
      </p>

      {/* Footer: tag + time */}
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
            message.recipient !== 'Cả 3 thầy cô' && message.recipient !== 'Cả 3 người'
              ? 'bg-wine text-white shadow-xs'
              : 'bg-wine/10 text-wine'
          }`}
        >
          <Tag className="w-3 h-3" />
          {message.recipient !== 'Cả 3 thầy cô' && message.recipient !== 'Cả 3 người'
            ? `Gửi riêng: ${message.recipient}`
            : message.recipient}
        </span>
        <span className="text-[11px] text-charcoal/30">
          {timeAgo(message.created_at)}
        </span>
      </div>

      {/* Secret badge */}
      {!message.is_public && (
        <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[11px] font-medium">
          🔒 Âm thầm
        </span>
      )}
    </div>
  )
}
