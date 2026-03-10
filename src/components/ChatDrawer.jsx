import { useState, useEffect, useRef } from 'react'
import { listenMessages, sendMessage } from '../firebase/chatService'
import { X, Send } from 'lucide-react'

export default function ChatDrawer({ bookingId, profile, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!bookingId) return
    return listenMessages(bookingId, setMessages)
  }, [bookingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    await sendMessage(bookingId, {
      uid: profile.uid,
      displayName: profile.displayName,
      role: profile.role,
      text: text.trim()
    })
    setText('')
    setSending(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '0 16px', height: 52, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Chat</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Messagerie en temps réel</p>
          </div>
        </div>
        <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'var(--bg-section)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} color="var(--text-muted)" />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, color: 'var(--text-muted)' }}>
              Démarrez la conversation
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.uid === profile.uid
          return (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start',
            }}>
              {!isMe && (
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3, paddingLeft: 4 }}>
                  {msg.displayName} · {msg.role === 'worker' ? '🧹 Travailleur' : '🏠 Client'}
                </p>
              )}
              <div style={{
                maxWidth: '80%',
                background: isMe ? 'var(--brown)' : 'var(--bg-card)',
                color: isMe ? 'white' : 'var(--text)',
                border: isMe ? 'none' : '1px solid var(--border)',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 14px',
                fontSize: 14,
                lineHeight: 1.5,
                boxShadow: '0 1px 4px rgba(61,44,30,0.08)',
              }}>
                {msg.text}
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, paddingRight: isMe ? 4 : 0, paddingLeft: isMe ? 0 : 4 }}>
                {msg.createdAt?.toDate?.()?.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) || ''}
              </p>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
        padding: '12px 12px', display: 'flex', gap: 8, alignItems: 'flex-end',
      }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez un message..."
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12,
            border: '1px solid var(--border)', background: 'var(--bg-input)',
            color: 'var(--text)', fontSize: 14, resize: 'none',
            fontFamily: "'DM Sans', sans-serif", outline: 'none',
            lineHeight: 1.5,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--brown)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: 12, border: 'none',
            background: text.trim() ? 'var(--brown)' : 'var(--bg-section)',
            cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
          }}>
          <Send size={16} color={text.trim() ? 'white' : 'var(--text-dim)'} />
        </button>
      </div>
    </div>
  )
}
