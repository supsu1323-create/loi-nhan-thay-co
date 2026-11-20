import { Heart } from 'lucide-react'

export default function ThankYouModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-7 text-center max-w-xs w-full shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-wine/10 flex items-center justify-center">
            <Heart className="w-8 h-8 text-wine fill-wine/30" />
          </div>
        </div>
        <h3 className="font-display text-xl font-semibold text-wine mb-1.5">
          Cảm ơn bạn!
        </h3>
        <p className="text-sm text-charcoal/60 mb-5 leading-relaxed">
          Lời nhắn của bạn đã được gửi đi rồi.<br />Thật ấm áp quá 💕
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-wine text-white text-sm font-medium hover:bg-wine/90 transition-all active:scale-95"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}
