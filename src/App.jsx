import { Routes, Route, Link } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import Header from './components/Header'
import MessageForm from './components/MessageForm'
import PublicBoard from './components/PublicBoard'
import SecretCorner from './components/SecretCorner'
import Toast from './components/Toast'
import { isSupabaseConfigured } from './lib/supabase'

/* ───────── CẤU HÌNH DỄ SỬA ───────── */
export const APP_TITLE = 'Có điều muốn nói không?'
export const APP_DESC = 'Gửi lời nhắn, tâm sự, hay lời chúc dễ thương đến'
export const RECIPIENTS = ['Cả 3 thầy cô', 'Cô Nga', 'Cô Ngân', 'Thầy Hải']
export const PERSON_NAMES = ['Cô Nga', 'Cô Ngân', 'Thầy Hải']

export const CARD_COLORS = {
  cream:    { bg: '#FFF8F0', border: '#F0E6D6', label: 'Kem' },
  pink:     { bg: '#FFF0F3', border: '#F5D5DC', label: 'Hồng' },
  green:    { bg: '#F0FFF4', border: '#D5F0DB', label: 'Xanh' },
  lavender: { bg: '#F3F0FF', border: '#DDD5F0', label: 'Tím' },
}
/* ──────────────────────────────────── */

function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)
  const [messageCount, setMessageCount] = useState(0)

  const handleNewMessage = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {!isSupabaseConfigured && (
        <div className="bg-amber-50/95 border-b border-amber-200/80 px-4 py-2.5 text-center text-xs text-amber-800 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Chưa kết nối Supabase:</strong> Web cần 2 biến môi trường trên Vercel để lưu lời nhắn vào cơ sở dữ liệu.
          </span>
        </div>
      )}
      <Header messageCount={messageCount} />

      <main className="max-w-4xl mx-auto px-4 pb-24">
        <MessageForm onSuccess={handleNewMessage} showToast={showToast} />
        <PublicBoard refreshKey={refreshKey} onCountChange={setMessageCount} />
      </main>

      {/* Footer – nút vào Góc bí mật */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-cream/80 backdrop-blur-sm border-t border-wine/10">
        <div className="flex justify-center py-2.5">
          <Link
            to="/bi-mat"
            className="flex items-center gap-1.5 text-xs text-charcoal/30 hover:text-wine transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Góc bí mật
          </Link>
        </div>
      </footer>

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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bi-mat" element={<SecretCorner />} />
    </Routes>
  )
}
