import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createBooking, listenClientBookings, cancelBooking, stopRecurrence } from '../firebase/bookingService'
import { logoutUser } from '../firebase/authService'
import { Card, Button, Input, Select, SectionLabel, StatusTracker, Badge, Toast, Header, PriceTag, Divider } from '../components/ui'
import ChatDrawer from '../components/ChatDrawer'
import ReviewModal from '../components/ReviewModal'
import Lightbox from '../components/Lightbox'
import { useToast } from '../hooks/useToast'

const createCheckoutSession = () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1200))

const SIZES = [{ label:'Studio', price:109 }, { label:'3½', price:129 }, { label:'4½', price:149 }, { label:'5½', price:189 }]
const RECURRENCES = [
  { key:'once',      label:'Une seule fois', icon:'1️⃣', discount:0 },
  { key:'weekly',    label:'Toutes les semaines', icon:'🔄', discount:10 },
  { key:'biweekly',  label:'Toutes les 2 semaines', icon:'🔄', discount:7 },
  { key:'monthly',   label:'1x par mois', icon:'🔄', discount:5 },
]
const EXTRAS = [
  { key:'oven',     label:'Four',            icon:'🔥', price:20 },
  { key:'fridge',   label:'Frigo',           icon:'❄️', price:15 },
  { key:'windows',  label:'Fenêtres',        icon:'🪟', price:25 },
  { key:'petHair',  label:"Poils d'animaux", icon:'🐾', price:10 },
  { key:'sameDay',  label:'Même jour',       icon:'⚡', price:25 },
]
const STEPS = [
  { key:'Requested',  label:'Demande créée',      desc:"Recherche d'un prestataire..." },
  { key:'Assigned',   label:'Prestataire assigné', desc:'En route vers vous' },
  { key:'InProgress', label:'Ménage en cours',     desc:'Nettoyage en cours ✨' },
  { key:'Completed',  label:'Mission complétée',   desc:'Terminé! 🎉' },
]
const STATUS_BADGE = { Requested:'blue', Assigned:'gold', InProgress:'teal', Completed:'default', cancelled:'red' }

export default function ClientPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [view, setView] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [step, setStep] = useState(1)
  const [size, setSize] = useState(SIZES[0])
  const [extras, setExtras] = useState({})
  const [form, setForm] = useState({ address:'', postalCode:'', date:'', time:'10:00' })
  const [paying, setPaying] = useState(false)
  const { toast, notify } = useToast()
  const [chatBookingId, setChatBookingId] = useState(null)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [confirmCancelId, setConfirmCancelId] = useState(null)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const [recurrence, setRecurrence] = useState(RECURRENCES[0])
  const [confirmStopId, setConfirmStopId] = useState(null)
  const baseTotal = size.price + EXTRAS.filter(e => extras[e.key]).reduce((s, e) => s + e.price, 0)
  const discount = recurrence.discount > 0 ? Math.round(baseTotal * recurrence.discount / 100) : 0
  const total = baseTotal - discount

  useEffect(() => { if (!profile) return; return listenClientBookings(profile.uid, setBookings) }, [profile])

  async function handleCancel(bookingId) {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking?.date && booking?.time) {
      const serviceTime = new Date(`${booking.date}T${booking.time}:00`)
      const hoursUntil = (serviceTime - Date.now()) / 3600000
      if (hoursUntil < 12) {
        notify('Annulation impossible — moins de 12h avant le service.')
        setConfirmCancelId(null)
        return
      }
      await cancelBooking(bookingId)
      setConfirmCancelId(null)
      if (hoursUntil < 24) {
        notify('Réservation annulée — remboursement 50%.')
      } else {
        notify('Réservation annulée — remboursement 100%.')
      }
    } else {
      await cancelBooking(bookingId)
      setConfirmCancelId(null)
      notify('Réservation annulée.')
    }
  }

  async function handlePay() {
    if (!form.address || !form.date) { notify('Remplis tous les champs'); return }
    setPaying(true)
    await createCheckoutSession()
    await createBooking(profile.uid, {
      address: form.address, postalCode: form.postalCode,
      size: size.label, extras: EXTRAS.filter(e => extras[e.key]).map(e => e.key),
      price: total, date: form.date, time: form.time,
      recurrence: recurrence.key,
      recurrenceDiscount: recurrence.discount,
      recurrenceActive: recurrence.key !== 'once',
    })
    setStep(3); notify('Réservation confirmée! ✨'); setPaying(false)
  }

  function reset() {
    setStep(1); setSize(SIZES[0]); setExtras({})
    setForm({ address:'', postalCode:'', date:'', time:'10:00' })
    setRecurrence(RECURRENCES[0]); setView('bookings')
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header userName={profile?.displayName} onLogout={logoutUser} onProfile={() => navigate('/profile')} />

      <div style={{ maxWidth:560, margin:'0 auto', padding:'28px 20px' }}>

        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:600, fontStyle:'italic', color:'var(--text)' }}>
            Bonjour, {profile?.displayName?.split(' ')[0]}!
          </h2>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Premium condo cleaning · Griffintown</p>
        </div>

        <button
          onClick={() => { setView('new'); setStep(1) }}
          style={{ width:'100%', padding:'16px', borderRadius:'var(--radius)', border:'none', background:'var(--brown)', color:'white', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(184,147,90,0.35)', transition:'all 0.2s', marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}
          onMouseOver={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseOut={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' }}>
          🧹 Réserver maintenant
        </button>

        <div style={{ display:'flex', gap:4, background:'var(--bg-card)', borderRadius:'var(--radius-sm)', padding:4, marginBottom:24, border:'1px solid var(--border)', boxShadow:'var(--shadow)' }}>
          {[{ k:'bookings', l:'Mes réservations' }, { k:'new', l:'+ Nouvelle demande' }].map(t => (
            <button key={t.k} onClick={() => { setView(t.k); setStep(1) }} style={{
              flex:1, padding:'10px', borderRadius:8, border:'none',
              background: view===t.k ? 'var(--bg-section)' : 'transparent',
              color: view===t.k ? 'var(--brown)' : 'var(--text-muted)',
              fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.2s',
            }}>
              {t.l}
            </button>
          ))}
        </div>

        {view==='bookings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }} className="animate-fade-up">
            {bookings.length===0 ? (
              <Card style={{ textAlign:'center', padding:'56px 24px' }}>
                <p style={{ fontSize:48, marginBottom:16 }}>🧹</p>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:24, marginBottom:8 }}>Aucune réservation</h3>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24 }}>Réservez votre premier ménage</p>
                <Button onClick={() => setView('new')}>Réserver maintenant</Button>
              </Card>
            ) : bookings.map((b, i) => (
              <Card key={b.id} className={`stagger-${Math.min(i+1,5)} animate-fade-up`}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:15 }}>{b.address}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{b.size} · {b.date} à {b.time}</p>
                    {b.recurrence && b.recurrence !== 'once' && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:4,
                          fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20,
                          background: b.recurrenceActive ? 'var(--brown-light)' : 'var(--bg-section)',
                          color: b.recurrenceActive ? 'var(--brown)' : 'var(--text-dim)',
                          border: `1px solid ${b.recurrenceActive ? 'rgba(184,147,90,0.35)' : 'var(--border)'}`,
                        }}>
                          🔄 {b.recurrenceActive ? 'Récurrent' : 'Récurrence arrêtée'}
                          {b.recurrenceDiscount > 0 && b.recurrenceActive && ` −${b.recurrenceDiscount}%`}
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge variant={STATUS_BADGE[b.status] ?? 'default'}>
                    {b.status === 'cancelled' ? 'Annulée' : b.status}
                  </Badge>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <PriceTag amount={b.price} size="md" />
                  {b.extras?.length>0 && <span style={{ fontSize:11, color:'var(--text-dim)' }}>{b.extras.join(' · ')}</span>}
                </div>
                {b.status !== 'Completed' && b.status !== 'cancelled' && <><Divider /><StatusTracker steps={STEPS} currentStatus={b.status} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setChatBookingId(b.id) }}
                    style={{
                      marginTop: 12, width: '100%', padding: '10px', borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--bg-input)',
                      color: 'var(--text)', fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brown)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    💬 Contacter le prestataire
                  </button>
                </>}
                {(b.status === 'Requested' || b.status === 'Assigned') && (
                  <div style={{ marginTop: 12, display:'flex', flexDirection:'column', gap:8 }}>
                    {confirmCancelId === b.id ? (
                      <div style={{ background:'var(--red-light)', border:'1px solid rgba(192,97,79,0.25)', borderRadius:'var(--radius-sm)', padding:'12px 14px' }}>
                        <p style={{ fontSize:13, color:'var(--red)', fontWeight:600, marginBottom:10 }}>
                          Êtes-vous sûr de vouloir annuler ?
                        </p>
                        <div style={{ display:'flex', gap:8 }}>
                          <Button variant="danger" size="sm" onClick={() => handleCancel(b.id)}>Oui, annuler</Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmCancelId(null)}>Non, garder</Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmCancelId(b.id) }}
                        style={{ width:'100%', padding:'10px', borderRadius:8, border:'1px solid rgba(192,97,79,0.35)', background:'transparent', color:'var(--red)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--red-light)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        Annuler la réservation
                      </button>
                    )}
                    {b.recurrence && b.recurrence !== 'once' && b.recurrenceActive && confirmStopId !== b.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmStopId(b.id) }}
                        style={{ width:'100%', padding:'10px', borderRadius:8, border:'1px solid rgba(184,147,90,0.35)', background:'transparent', color:'var(--brown)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--brown-light)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        Arrêter la récurrence
                      </button>
                    )}
                    {confirmStopId === b.id && (
                      <div style={{ background:'var(--brown-light)', border:'1px solid rgba(184,147,90,0.3)', borderRadius:'var(--radius-sm)', padding:'12px 14px' }}>
                        <p style={{ fontSize:13, color:'var(--brown)', fontWeight:600, marginBottom:10 }}>
                          Arrêter les prochaines réservations automatiques ?
                        </p>
                        <div style={{ display:'flex', gap:8 }}>
                          <Button size="sm" onClick={async () => { await stopRecurrence(b.id); setConfirmStopId(null); notify('Récurrence arrêtée.') }}>Oui, arrêter</Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmStopId(null)}>Non, garder</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {(b.photosBefore?.length > 0 || b.photosAfter?.length > 0) && (
                  <div style={{ marginTop: 12 }}>
                    {b.photosBefore?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                          Photos AVANT ({b.photosBefore.length})
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                          {b.photosBefore.map((url, i) => (
                            <div key={i} onClick={() => setLightboxUrl(url)} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in' }}>
                              <img src={url} alt={`avant-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {b.photosAfter?.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                          Photos APRÈS ({b.photosAfter.length})
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                          {b.photosAfter.map((url, i) => (
                            <div key={i} onClick={() => setLightboxUrl(url)} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in' }}>
                              <img src={url} alt={`après-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {b.status==='Completed' && (
                  <><Divider />
                    <div style={{ textAlign:'center' }}>
                      <p style={{ color:'var(--brown)', fontSize:18, letterSpacing:4 }}>★★★★★</p>
                      <p style={{ fontSize:11, color:'var(--text-dim)', marginTop:4 }}>Mission complétée avec succès</p>
                    </div>
                    {!b.reviewed && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          onClick={() => setReviewBooking(b)}
                          style={{
                            width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--brown)', background: 'var(--brown-light)',
                            color: 'var(--brown)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--brown)' || (e.currentTarget.style.color = 'white')}
                          onMouseOut={e => { e.currentTarget.style.background = 'var(--brown-light)'; e.currentTarget.style.color = 'var(--brown)' }}>
                          ★ Laisser un avis
                        </button>
                      </div>
                    )}
                  </>
                )}
              </Card>
            ))}
          </div>
        )}

        {view==='new' && (
          <div className="animate-fade-up">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ display:'flex', alignItems:'center', gap:8, flex: s<3 ? 1 : 'none' }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700,
                    background: step>s ? 'var(--brown)' : step===s ? 'var(--brown-light)' : 'var(--bg-section)',
                    color: step>s ? '#fff' : step===s ? 'var(--brown)' : 'var(--text-dim)',
                    border: `1.5px solid ${step>=s ? 'var(--brown)' : 'var(--border)'}`,
                    transition:'all 0.3s',
                  }}>
                    {step>s ? '✓' : s}
                  </div>
                  {s<3 && <div style={{ flex:1, height:1.5, background: step>s ? 'var(--brown)' : 'var(--border)', transition:'background 0.4s' }}/>}
                </div>
              ))}
            </div>

            {step===1 && (
              <Card>
                <SectionLabel>Adresse</SectionLabel>
                <Input label="Adresse" placeholder="400 rue des Seigneurs" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
                <Input label="Code postal" placeholder="H3J 1X8" value={form.postalCode} onChange={e=>setForm(f=>({...f,postalCode:e.target.value}))}/>
                <Divider/>
                <SectionLabel>Taille du logement</SectionLabel>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:20 }}>
                  {SIZES.map(s => (
                    <button key={s.label} onClick={()=>setSize(s)} style={{
                      padding:'14px 8px', borderRadius:'var(--radius-sm)', textAlign:'center',
                      border: `1.5px solid ${size.label===s.label ? 'var(--brown)' : 'var(--border)'}`,
                      background: size.label===s.label ? 'var(--brown-light)' : 'var(--bg-input)',
                      cursor:'pointer', transition:'all 0.2s',
                    }}>
                      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:18, color: size.label===s.label ? 'var(--brown)' : 'var(--text)' }}>{s.label}</p>
                      <p style={{ fontSize:11, color:'var(--brown)', marginTop:2 }}>{s.price}$</p>
                    </button>
                  ))}
                </div>
                <Divider/>
                <SectionLabel>Fréquence</SectionLabel>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {RECURRENCES.map(r => (
                    <button key={r.key} onClick={() => setRecurrence(r)} style={{
                      padding:'12px 14px', borderRadius:'var(--radius-sm)', textAlign:'left',
                      border: `1.5px solid ${recurrence.key===r.key ? 'var(--brown)' : 'var(--border)'}`,
                      background: recurrence.key===r.key ? 'var(--brown-light)' : 'var(--bg-input)',
                      cursor:'pointer', transition:'all 0.2s',
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                    }}>
                      <span style={{ fontSize:13, fontWeight:600, color: recurrence.key===r.key ? 'var(--brown)' : 'var(--text)' }}>
                        {r.icon} {r.label}
                      </span>
                      {r.discount > 0 && (
                        <span style={{
                          fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20,
                          background: recurrence.key===r.key ? 'var(--brown)' : 'var(--bg-section)',
                          color: recurrence.key===r.key ? 'white' : 'var(--text-muted)',
                        }}>
                          -{r.discount}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <Divider/>
                <SectionLabel>Options supplémentaires</SectionLabel>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                  {EXTRAS.map(o => (
                    <button key={o.key} onClick={()=>setExtras(e=>({...e,[o.key]:!e[o.key]}))} style={{
                      padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', transition:'all 0.2s',
                      border: `1.5px solid ${extras[o.key] ? 'var(--brown)' : 'var(--border)'}`,
                      background: extras[o.key] ? 'var(--brown-light)' : 'var(--bg-input)',
                      color: extras[o.key] ? 'var(--brown)' : 'var(--text-muted)',
                    }}>
                      {o.icon} {o.label} <span style={{ opacity:0.6, fontSize:11 }}>+{o.price}$</span>
                    </button>
                  ))}
                </div>
                <Divider/>
                <SectionLabel>Date et heure</SectionLabel>
                <Input label="Date" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
                <Select label="Heure" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}>
                  {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t=><option key={t}>{t}</option>)}
                </Select>
                <div style={{ background:'var(--bg-section)', border:`1px solid ${discount>0 ? 'rgba(107,158,120,0.35)' : 'var(--border)'}`, borderRadius:'var(--radius-sm)', padding:'16px 20px', margin:'8px 0 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>Total estimé</p>
                      <p style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>Taxes incluses</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      {discount > 0 && (
                        <p style={{ fontSize:11, color:'var(--text-dim)', textDecoration:'line-through', marginBottom:2 }}>{baseTotal}$</p>
                      )}
                      <PriceTag amount={total} size="xl"/>
                    </div>
                  </div>
                  {discount > 0 && (
                    <p style={{ fontSize:12, color:'var(--green)', fontWeight:700, marginTop:8 }}>
                      ✓ Vous économisez {discount}$ par visite ({recurrence.discount}% de rabais récurrence)
                    </p>
                  )}
                </div>
                <Button size="lg" onClick={()=>{ if(!form.address||!form.date){notify('Remplis tous les champs');return} setStep(2) }}>Continue →</Button>
              </Card>
            )}

            {step===2 && (
              <Card>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:22, marginBottom:18 }}>Confirmer la réservation</h3>
                {[
                  ['Adresse', form.address],
                  ['Code postal', form.postalCode||'—'],
                  ['Logement', size.label],
                  ['Options', EXTRAS.filter(e=>extras[e.key]).map(e=>`${e.icon} ${e.label}`).join(' · ')||'Aucune'],
                  ['Fréquence', recurrence.label],
                  ['Date', form.date],
                  ['Heure', form.time],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ background:'var(--bg-section)', borderRadius:'var(--radius-sm)', padding:'14px 18px', margin:'16px 0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>Total</span>
                    <div style={{ textAlign:'right' }}>
                      {discount > 0 && <p style={{ fontSize:11, color:'var(--text-dim)', textDecoration:'line-through' }}>{baseTotal}$</p>}
                      <PriceTag amount={total} size="xl"/>
                    </div>
                  </div>
                  {discount > 0 && (
                    <p style={{ fontSize:12, color:'var(--green)', fontWeight:700, marginTop:6 }}>
                      ✓ Économie de {discount}$ par visite
                    </p>
                  )}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <Button variant="ghost" onClick={()=>setStep(1)} className="flex-1">← Modifier</Button>
                  <Button onClick={handlePay} loading={paying} className="flex-1">💳 Payer {total}$</Button>
                </div>
              </Card>
            )}

            {step===3 && (
              <Card style={{ textAlign:'center', padding:'56px 24px', border:'1px solid rgba(184,147,90,0.3)' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--brown-light)', border:'1.5px solid var(--brown)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px' }}>✨</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:28, marginBottom:10 }}>Réservation confirmée!</h3>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom: recurrence.key !== 'once' ? 16 : 28, lineHeight:1.6 }}>
                  Votre demande est transmise aux prestataires disponibles à Griffintown.
                </p>
                {recurrence.key !== 'once' && (
                  <div style={{ background:'var(--bg-section)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:28, textAlign:'left' }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--brown)', marginBottom:4 }}>🔄 Récurrence activée</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
                      {recurrence.label} · Rabais {recurrence.discount}% appliqué automatiquement.
                      Le prochain ménage sera créé après chaque prestation complétée.
                    </p>
                  </div>
                )}
                <Button onClick={reset}>Voir mes réservations</Button>
              </Card>
            )}
          </div>
        )}
      </div>
      {chatBookingId && (
        <ChatDrawer
          bookingId={chatBookingId}
          profile={profile}
          onClose={() => setChatBookingId(null)}
        />
      )}
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          clientId={profile.uid}
          onClose={() => setReviewBooking(null)}
        />
      )}
      <Toast message={toast.msg} show={toast.show}/>
    </div>
  )
}
