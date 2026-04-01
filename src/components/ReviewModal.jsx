import { useState } from 'react'
import { submitReview } from '../firebase/reviewService'
import { Button } from './ui'

export default function ReviewModal({ booking, clientId, onClose }) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setLoading(true)
    await submitReview({
      bookingId:      booking.id,
      clientId,
      prestataireId:  booking.workerId || booking.prestataireId,
      rating,
      comment,
    })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(61,44,30,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 24px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--bg-card)', borderRadius: '20px 20px 16px 16px',
        padding: '28px 24px', boxShadow: '0 -8px 40px rgba(61,44,30,0.18)',
        border: '1px solid var(--border)',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }}/>

        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 26, fontWeight: 600, marginBottom: 4 }}>
          Laisser un avis
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          {booking.address} · {booking.date}
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                fontSize: 40, lineHeight: 1, transition: 'transform 0.15s',
                transform: (hovered || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                filter: (hovered || rating) >= star ? 'none' : 'grayscale(1) opacity(0.3)',
              }}>
              ★
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--brown)', fontWeight: 600, marginBottom: 20 }}>
            {['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent !'][rating]}
          </p>
        )}

        {/* Comment */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
            Commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Décrivez votre expérience..."
            rows={3}
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
              resize: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brown)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '13px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-section)',
              color: 'var(--text-muted)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
            Annuler
          </button>
          <div style={{ flex: 2 }}>
            <Button onClick={handleSubmit} loading={loading} disabled={!rating}>
              Envoyer l'avis ★
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
