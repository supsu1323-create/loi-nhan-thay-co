import { useState, useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { RECIPIENTS } from '../App'
import MessageCard from './MessageCard'

export default function PublicBoard({ refreshKey, onCountChange }) {
  const [messages, setMessages] = useState([])
  const [filter, setFilter] = useState('Tất cả')
  const [loading, setLoading] = useState(true)
  const countRef = useRef(onCountChange)
  countRef.current = onCountChange

  /* ── Fetch public messages ── */
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setMessages(data)
      }
    } catch (err) {
      console.warn('Fetch messages error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [refreshKey])

  /* ── Sync count to parent ── */
  useEffect(() => {
    countRef.current(messages.length)
  }, [messages.length])

  /* ── Realtime subscription ── */
  useEffect(() => {
    try {
      const channel = supabase
        .channel('public-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            if (payload.new && payload.new.is_public) {
              setMessages((prev) => [payload.new, ...prev])
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (err) {
      console.warn('Realtime error:', err)
    }
  }, [])

  /* ── Filter logic ── */
  const filterOptions = ['Tất cả', ...RECIPIENTS]
  const filtered =
    filter === 'Tất cả'
      ? messages
      : messages.filter((m) => m.recipient === filter)

  return (
    <section>
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-wine" />
        <h2 className="font-display text-lg font-semibold text-charcoal">
          Bảng lời nhắn
        </h2>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
              filter === f
                ? 'bg-wine text-white shadow-sm'
                : 'bg-white border border-wine/15 text-charcoal/50 hover:border-wine/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Messages grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-6 h-6 border-2 border-wine/30 border-t-wine rounded-full animate-spin mb-3" />
          <p className="text-charcoal/30 text-sm">Đang tải...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-2">💌</p>
          <p className="text-charcoal/30 text-sm">
            {messages.length === 0
              ? 'Chưa có lời nhắn nào. Hãy là người đầu tiên!'
              : 'Không có lời nhắn nào cho bộ lọc này.'}
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
          {filtered.map((msg, i) => (
            <MessageCard
              key={msg.id}
              message={msg}
              style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
