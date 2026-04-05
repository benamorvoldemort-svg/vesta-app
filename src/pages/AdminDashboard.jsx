import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenAllBookings, adminUpdateStatus } from '../firebase/bookingService'
import { listenPrestataires, listenClients, updatePrestataire } from '../firebase/workerService'
import { listenAllReviews } from '../firebase/reviewService'
import { logoutUser } from '../firebase/authService'
import { Card, Badge, SectionLabel, Toast, Header, PriceTag, Divider } from '../components/ui'

const STATUS_BADGE = {
  Requested: 'blue', Assigned: 'gold', InProgress: 'teal',
  Completed: 'default', cancelled: 'red', refused: 'default',
}
const STATUS_LABEL = {
  Requested: 'En attente', Assigned: 'Assignée', InProgress: 'En cours',
  Completed: 'Terminée', cancelled: 'Annulée', refused: 'Refusée',
}
const ALL_STATUSES = ['Requested', 'Assigned', 'InProgress', 'Completed', 'cancelled', 'refused']

function KPI({ icon, label, value, isPrice }) {
  return (
    <Card>
      <p style={{ fontSize: 26, marginBottom: 4 }}>{icon}</p>
      {isPrice
        ? <PriceTag amount={value} size="lg" />
        : <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 600, color: 'var(--brown)', lineHeight: 1 }}>{value}</p>
      }
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{label}</p>
    </Card>
  )
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [bookings, setBookings]         = useState([])
  const [prestataires, setPrestataires] = useState([])
  const [clients, setClients]           = useState([])
  const [reviews, setReviews]           = useState([])
  const [tab, setTab]                   = useState('overview')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast]               = useState({ show: false, msg: '' })

  function notify(msg) { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 3000) }

  useEffect(() => {
    const u1 = listenAllBookings(setBookings)
    const u2 = listenPrestataires(setPrestataires)
    const u3 = listenClients(setClients)
    const u4 = listenAllReviews(setReviews)
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  // KPIs
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const todayStr = now.toISOString().split('T')[0]

  const completedBookings = bookings.filter(b => b.status === 'Completed')
  const revenueTotal      = completedBookings.reduce((s, b) => s + (b.price || 0), 0) * 0.2
  const revenueMonth      = completedBookings
    .filter(b => (b.date || '').startsWith(thisMonth))
    .reduce((s, b) => s + (b.price || 0), 0) * 0.2
  const todayActive = bookings.filter(b => b.date === todayStr && ['Assigned', 'InProgress'].includes(b.status)).length

  // Filtered bookings
  const filteredBookings = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter)

  // Client booking counts
  const clientBookingCount = {}
  bookings.forEach(b => { if (b.clientId) clientBookingCount[b.clientId] = (clientBookingCount[b.clientId] || 0) + 1 })
  const clientLastBooking = {}
  bookings.forEach(b => { if (b.clientId) { if (!clientLastBooking[b.clientId] || b.date > clientLastBooking[b.clientId]) clientLastBooking[b.clientId] = b.date } })

  // Prestataire ratings
  const prestataireRating = {}
  const prestataireJobCount = {}
  reviews.forEach(r => {
    if (!prestataireRating[r.prestataireId]) prestataireRating[r.prestataireId] = []
    prestataireRating[r.prestataireId].push(r.rating)
  })
  completedBookings.forEach(b => {
    const pid = b.workerId || b.prestataireId
    if (pid) prestataireJobCount[pid] = (prestataireJobCount[pid] || 0) + 1
  })

  const TABS = [
    { k: 'overview',     l: "📊 Vue d'ensemble" },
    { k: 'bookings',     l: `📋 Réservations (${bookings.length})` },
    { k: 'prestataires', l: `🧹 Prestataires (${prestataires.length})` },
    { k: 'clients',      l: `👤 Clients (${clients.length})` },
    { k: 'reviews',      l: `⭐ Avis (${reviews.length})` },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header userName={profile?.displayName} onLogout={logoutUser} role="Admin" />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, fontStyle: 'italic' }}>
            Tableau de bord
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Vesta Home · Griffintown</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 28, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: '9px 14px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
              background: tab === t.k ? 'var(--bg-section)' : 'transparent',
              color: tab === t.k ? 'var(--brown)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* ── SECTION 1 : Vue d'ensemble ── */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
              <KPI icon="📋" label="Total réservations"   value={bookings.length} />
              <KPI icon="🔄" label="En cours aujourd'hui" value={todayActive} />
              <KPI icon="💰" label="Revenu total (20%)"   value={Math.round(revenueTotal)} isPrice />
              <KPI icon="📅" label="Revenu ce mois"       value={Math.round(revenueMonth)} isPrice />
              <KPI icon="👤" label="Clients inscrits"     value={clients.length} />
              <KPI icon="🧹" label="Prestataires"         value={prestataires.length} />
            </div>

            <SectionLabel>Réservations récentes</SectionLabel>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Date', 'Adresse', 'Taille', 'Prix', 'Statut'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-section)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{b.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.address}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{b.size || b.type || '—'}</td>
                      <td style={{ padding: '10px 12px' }}><PriceTag amount={b.price} size="sm" /></td>
                      <td style={{ padding: '10px 12px' }}><Badge variant={STATUS_BADGE[b.status] ?? 'default'}>{STATUS_LABEL[b.status] ?? b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SECTION 2 : Réservations ── */}
        {tab === 'bookings' && (
          <div>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {['all', ...ALL_STATUSES].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  border: `1.5px solid ${statusFilter === s ? 'var(--brown)' : 'var(--border)'}`,
                  background: statusFilter === s ? 'var(--brown-light)' : 'var(--bg-input)',
                  color: statusFilter === s ? 'var(--brown)' : 'var(--text-muted)',
                }}>
                  {s === 'all' ? 'Tous' : (STATUS_LABEL[s] ?? s)}
                </button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Date', 'Adresse', 'ClientID', 'PrestataireID', 'Taille', 'Prix', 'Statut', 'Action'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-section)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{b.date} {b.time}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.address}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{b.clientId?.slice(-6)}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{(b.workerId || b.prestataireId)?.slice(-6) || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{b.size || b.type || '—'}</td>
                      <td style={{ padding: '10px 12px' }}><PriceTag amount={b.price} size="sm" /></td>
                      <td style={{ padding: '10px 12px' }}><Badge variant={STATUS_BADGE[b.status] ?? 'default'}>{STATUS_LABEL[b.status] ?? b.status}</Badge></td>
                      <td style={{ padding: '10px 12px' }}>
                        {b.status !== 'Completed' && b.status !== 'cancelled' && b.status !== 'refused' && (
                          <select
                            defaultValue=""
                            onChange={e => { if (e.target.value) { adminUpdateStatus(b.id, e.target.value); notify(`Statut → ${e.target.value}`); e.target.value = '' } }}
                            style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <option value="" disabled>Changer</option>
                            {ALL_STATUSES.filter(s => s !== b.status).map(s => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 14 }}>Aucune réservation pour ce filtre.</p>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 3 : Prestataires ── */}
        {tab === 'prestataires' && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['', 'Nom', 'Email', 'Rating', 'Jobs', 'Disponible', 'Action'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prestataires.map(p => {
                    const ratings = prestataireRating[p.uid] || []
                    const avg = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : '—'
                    const jobs = prestataireJobCount[p.uid] || 0
                    return (
                      <tr key={p.uid} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-section)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '10px 12px' }}>
                          {p.photoURL
                            ? <img src={p.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brown-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧹</div>
                          }
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{p.displayName || p.nom || '—'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.email}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {ratings.length > 0
                            ? <span style={{ color: 'var(--brown)', fontWeight: 700 }}>★ {avg} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({ratings.length})</span></span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{jobs}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <Badge variant={p.disponible ? 'teal' : 'default'}>{p.disponible ? 'ON' : 'OFF'}</Badge>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            onClick={async () => {
                              await updatePrestataire(p.uid, { disponible: !p.disponible })
                              notify(`${p.displayName || 'Prestataire'} → ${!p.disponible ? 'Actif' : 'Inactif'}`)
                            }}
                            style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                            {p.disponible ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {prestataires.length === 0 && (
                <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 14 }}>Aucun prestataire inscrit.</p>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 4 : Clients ── */}
        {tab === 'clients' && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Nom', 'Email', 'Réservations', 'Dernière réservation'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.uid} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-section)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.displayName || c.nom || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{c.email}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: 'var(--brown)' }}>
                          {clientBookingCount[c.uid] || 0}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{clientLastBooking[c.uid] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && (
                <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 14 }}>Aucun client inscrit.</p>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 5 : Reviews ── */}
        {tab === 'reviews' && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Client ID', 'Prestataire ID', 'Étoiles', 'Commentaire', 'Date'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-section)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{r.clientId?.slice(-6)}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{r.prestataireId?.slice(-6)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--brown)', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.comment || <em style={{ color: 'var(--text-muted)' }}>Sans commentaire</em>}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('fr-CA') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reviews.length === 0 && (
                <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 14 }}>Aucun avis pour l'instant.</p>
              )}
            </div>
          </div>
        )}

      </div>
      <Toast message={toast.msg} show={toast.show} />
    </div>
  )
}
