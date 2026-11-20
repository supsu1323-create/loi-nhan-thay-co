import { CheckCircle2, XCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up px-4 w-full max-w-sm">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
