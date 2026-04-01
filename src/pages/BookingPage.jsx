import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Card, Button, Input, Select, SectionLabel } from '../components/ui'

const TYPES = [
  { key: 'standard',        label: 'Standard',          base: 80,  perRoom: 20, desc: 'Nettoyage complet des surfaces, sols et sanitaires' },
  { key: 'deep',            label: 'En profondeur',     base: 120, perRoom: 30, desc: 'Nettoyage intensif incluant intérieur appareils et armoires' },
  { key: 'post_demenagement', label: 'Post-déménagement', base: 150, perRoom: 35, desc: 'Nettoyage complet avant ou après emménagement' },
]

const ROOMS = [1, 2, 3, 4, '5+']

const HOURS = Array.from({ length: 11 }, (_, i) => {
  const h = 8 + i
  return { value: `${h}:00`, label: `${h}h00` }
})

function todayMin() {
  return new Date().toISOString().split('T')[0]
}

export default function BookingPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [type, setType]       = useState('standard')
  const [rooms, setRooms]     = useState(1)
  const [date, setDate]       = useState('')
  const [time, setTime]       = useState('9:00')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const selectedType = TYPES.find(t => t.key === type)
  const roomCount    = rooms === '5+' ? 5 : Number(rooms)
  const price        = selectedType.base + selectedType.perRoom * roomCount

  async function handleSubmit() {
    if (!date)    return setError('Veuillez sélectionner une date.')
    if (!address.trim()) return setError('Veuillez entrer une adresse.')
    setError('')
    setLoading(true)
    try {
      await addDoc(collection(db, 'bookings'), {
        clientId:  profile.uid,
        type,
        rooms,
        date,
        time,
        address:   address.trim(),
        price,
        status:    'pending',
        createdAt: serverTimestamp(),
      })
      navigate('/dashboard/client', { state: { booked: true } })
    } catch (e) {
      setError('Erreur lors de la réservation. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <button
          onClick={() => navigate('/dashboard/client')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Retour
        </button>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, fontStyle: 'italic', color: 'var(--brown)', marginBottom: 6 }}>
            Nouvelle réservation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Griffintown · Montréal</p>
        </div>

        <Card style={{ marginBottom: 16 }}>
          {/* Type de nettoyage */}
          <SectionLabel>Type de nettoyage</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-sm)', textAlign: 'left',
                  border: `1.5px solid ${type === t.key ? 'var(--brown)' : 'var(--border)'}`,
                  background: type === t.key ? 'var(--brown-light)' : 'var(--bg-input)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{t.label}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: 'var(--brown)' }}>
                    {t.base + t.perRoom * roomCount}$
                  </span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Nombre de pièces */}
          <SectionLabel>Nombre de pièces</SectionLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {ROOMS.map(r => (
              <button
                key={r}
                onClick={() => setRooms(r)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${rooms === r ? 'var(--brown)' : 'var(--border)'}`,
                  background: rooms === r ? 'var(--brown-light)' : 'var(--bg-input)',
                  color: rooms === r ? 'var(--brown)' : 'var(--text)',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {r}
              </button>
            ))}
          </div>

          {/* Date */}
          <Input
            label="Date"
            type="date"
            min={todayMin()}
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          {/* Heure */}
          <Select label="Heure" value={time} onChange={e => setTime(e.target.value)}>
            {HOURS.map(h => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </Select>

          {/* Adresse */}
          <Input
            label="Adresse"
            type="text"
            placeholder="123 rue Notre-Dame O, Griffintown"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </Card>

        {/* Prix récapitulatif */}
        <div style={{
          background: 'var(--brown-light)', border: '1px solid rgba(184,147,90,0.3)',
          borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--brown)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Total estimé</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {selectedType.label} · {rooms} pièce{roomCount > 1 ? 's' : ''} · {time}
            </p>
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 600, color: 'var(--brown)', lineHeight: 1 }}>
            {price}$
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--red-light)', border: '1px solid rgba(192,97,79,0.2)', marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>
          </div>
        )}

        <Button onClick={handleSubmit} loading={loading} size="lg">
          Confirmer la réservation →
        </Button>

      </div>
    </div>
  )
}
