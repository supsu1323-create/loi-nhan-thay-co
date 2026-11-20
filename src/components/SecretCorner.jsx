import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Eye, EyeOff, MessageSquare,
  Trash2, QrCode, RefreshCw, Loader2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { RECIPIENTS } from '../App'
import MessageCard from './MessageCard'
import PinDialog from './PinDialog'
import StoryQRGenerator from './StoryQRGenerator'
import Toast from './Toast'

export default function SecretCorner() {
  const [pin, setPin] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('all')               // all | secret | public
  const [recipientFilter, setRecipientFilter] = useState('Tất cả')
  const [toast, setToast] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  /* ── Fetch ALL messages via RPC ── */
  const fetchMessages = useCallback(async (currentPin) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_secret_messages', {
      input_pin: currentPin,
    })
    if (error) {
      showToast('Lỗi tải tin nhắn', 'error')
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }, [showToast])

  /* ── Unlock ── */
  const handleUnlock = async (inputPin) => {
    const { data, error } = await supabase.rpc('get_secret_messages', {
      input_pin: inputPin,
    })
    if (error) return false
    setPin(inputPin)
    setMessages(data || [])
    return true
  }

  /* ── Delete ── */
  const handleDelete = async (id) => {
    setDeleting(true)
    const { error } = await supabase.rpc('delete_secret_message', {
      target_id: id,
      input_pin: pin,
    })
    if (error) {
      showToast('Xóa thất bại', 'error')
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id))
      showToast('Đã xóa tin nhắn')
    }
    setDeleteTarget(null)
    setDeleting(false)
  }

  /* ── Gate ── */
  if (!pin) return <PinDialog onUnlock={handleUnlock} />

  /* ── Stats ── */
  const totalCount = messages.length
  const publicCount = messages.filter((m) => m.is_public).length
  const secretCount = messages.filter((m) => !m.is_public).length

  /* ── Filter ── */
  let filtered = messages
  if (tab === 'secret') filtered = filtered.filter((m) => !m.is_public)
  if (tab === 'public') filtered = filtered.filter((m) => m.is_public)
  if (recipientFilter !== 'Tất cả')
    filtered = filtered.filter((m) => m.recipient === recipientFilter)

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Sticky header ── */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-wine/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-charcoal/50 hover:text-wine transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trang chính</span>
        </Link>
        <h1 className="font-display text-lg font-semibold text-wine">
          Góc bí mật 🔒
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => fetchMessages(pin)}
            title="Tải lại"
            className="text-charcoal/40 hover:text-wine transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            title="Tạo ảnh Story QR"
            className={`transition-colors ${
              showQR ? 'text-wine' : 'text-charcoal/40 hover:text-wine'
            }`}
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-5">
        {/* ── Stats cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Tổng', value: totalCount, Icon: MessageSquare, cls: 'text-wine' },
            { label: 'Công khai', value: publicCount, Icon: Eye, cls: 'text-green-600' },
            { label: 'Âm thầm', value: secretCount, Icon: EyeOff, cls: 'text-purple-600' },
          ].map(({ label, value, Icon, cls }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-3 text-center border border-wine/10 shadow-sm"
            >
              <Icon className={`w-4 h-4 mx-auto mb-1 ${cls}`} />
              <div className="text-xl font-bold text-charcoal">{value}</div>
              <div className="text-[11px] text-charcoal/40">{label}</div>
            </div>
          ))}
        </div>

        {/* ── QR Story generator (toggle) ── */}
        {showQR && <StoryQRGenerator />}

        {/* ── Tab filter: all / secret / public ── */}
        <div className="flex gap-2 mb-3">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'secret', label: '🔒 Âm thầm' },
            { key: 'public', label: 'Công khai' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === t.key
                  ? t.key === 'secret'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-wine text-white shadow-sm'
                  : 'bg-white border border-wine/15 text-charcoal/50 hover:border-wine/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Recipient filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {['Tất cả', ...RECIPIENTS].map((f) => (
            <button
              key={f}
              onClick={() => setRecipientFilter(f)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-all flex-shrink-0 ${
                recipientFilter === f
                  ? 'bg-dusty text-white'
                  : 'bg-cream text-charcoal/40 hover:bg-wine/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Message list ── */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-wine/30 border-t-wine rounded-full animate-spin mb-3" />
            <p className="text-charcoal/30 text-sm">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-charcoal/30 text-sm">
            Không có tin nhắn nào.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 gap-3">
            {filtered.map((msg) => (
              <div key={msg.id} className="relative break-inside-avoid mb-3">
                <MessageCard message={msg} />
                {/* Delete button overlay */}
                <button
                  onClick={() => setDeleteTarget(msg.id)}
                  title="Xóa"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 text-red-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
                  style={{ opacity: undefined }}
                  onPointerEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onPointerLeave={(e) => (e.currentTarget.style.opacity = '')}
                  onFocus={(e) => (e.currentTarget.style.opacity = 1)}
                  onBlur={(e) => (e.currentTarget.style.opacity = '')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Delete confirmation dialog ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-medium text-charcoal mb-1">Xóa tin nhắn này?</h3>
            <p className="text-xs text-charcoal/50 mb-5">
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-cream text-charcoal/60 text-sm font-medium hover:bg-charcoal/5 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
