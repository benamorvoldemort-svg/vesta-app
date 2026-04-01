import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createBooking, listenClientBookings } from '../firebase/bookingService'
import { logoutUser } from '../firebase/authService'
const createCheckoutSession = () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1200))
import { Card, Button, Input, Select, SectionLabel, StatusTracker, Badge, Toast, Header, PriceTag, Divider } from '../components/ui'
import ChatDrawer from '../components/ChatDrawer'
import ReviewModal from '../components/ReviewModal'

const SIZES = [{ label:'Studio', price:89 }, { label:'3½', price:109 }, { label:'4½', price:139 }, { label:'5½', price:169 }]
const EXTRAS = [
  { key:'oven',    label:'Four',            icon:'🔥', price:20 },
  { key:'fridge',  label:'Frigo',           icon:'❄️', price:15 },
  { key:'windows', label:'Fenêtres',        icon:'🪟', price:25 },
  { key:'petHair', label:"Poils d'animaux", icon:'🐾', price:10 },
]
const STEPS = [
  { key:'Requested',  label:'Demande créée',      desc:"Recherche d'un prestataire..." },
  { key:'Assigned',   label:'Prestataire assigné', desc:'En route vers vous' },
  { key:'InProgress', label:'Ménage en cours',     desc:'Nettoyage en cours ✨' },
  { key:'Completed',  label:'Mission complétée',   desc:'Terminé! 🎉' },
]
const STATUS_BADGE = { Requested:'blue', Assigned:'gold', InProgress:'teal', Completed:'default' }

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
  const [toast, setToast] = useState({ show:false, msg:'' })
  const [chatBookingId, setChatBookingId] = useState(null)
  const [reviewBooking, setReviewBooking] = useState(null)
  const total = size.price + EXTRAS.filter(e => extras[e.key]).reduce((s, e) => s + e.price, 0)

  useEffect(() => { if (!profile) return; return listenClientBookings(profile.uid, setBookings) }, [profile])
  function notify(msg) { setToast({ show:true, msg }); setTimeout(() => setToast({ show:false, msg:'' }), 3000) }

  async function handlePay() {
    if (!form.address || !form.date) { notify('Remplis tous les champs'); return }
    setPaying(true)
    await createCheckoutSession()
    const booking = await createBooking(profile.uid, { address:form.address, postalCode:form.postalCode, size:size.label, extras:EXTRAS.filter(e=>extras[e.key]).map(e=>e.key), price:total, date:form.date, time:form.time })
    setStep(3); notify('Réservation confirmée! ✨'); setPaying(false)
  }

  function reset() { setStep(1); setSize(SIZES[0]); setExtras({}); setForm({ address:'', postalCode:'', date:'', time:'10:00' }); setView('bookings') }

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
          onClick={() => navigate('/booking')}
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
                <Button onClick={() => setView('new')}>Book Now</Button>
              </Card>
            ) : bookings.map((b, i) => (
              <Card key={b.id} className={`stagger-${Math.min(i+1,5)} animate-fade-up`}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:15 }}>{b.address}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{b.size} · {b.date} à {b.time}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[b.status]}>{b.status}</Badge>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <PriceTag amount={b.price} size="md" />
                  {b.extras?.length>0 && <span style={{ fontSize:11, color:'var(--text-dim)' }}>{b.extras.join(' · ')}</span>}
                </div>
                {b.status!=='Completed' && <><Divider /><StatusTracker steps={STEPS} currentStatus={b.status} />
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
                {(b.photosBefore?.length > 0 || b.photosAfter?.length > 0) && (
                  <div style={{ marginTop: 12 }}>
                    {b.photosBefore?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                          Photos AVANT ({b.photosBefore.length})
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                          {b.photosBefore.map((url, i) => (
                            <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
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
                            <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
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
                <div style={{ background:'var(--bg-section)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', margin:'8px 0 16px' }}>
                  <div>
                    <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>Total estimé</p>
                    <p style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>Taxes incluses</p>
                  </div>
                  <PriceTag amount={total} size="xl"/>
                </div>
                <Button size="lg" onClick={()=>{ if(!form.address||!form.date){notify('Remplis tous les champs');return} setStep(2) }}>Continue →</Button>
              </Card>
            )}

            {step===2 && (
              <Card>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:22, marginBottom:18 }}>Confirmer la réservation</h3>
                {[['Adresse',form.address],['Code postal',form.postalCode||'—'],['Logement',size.label],['Options',EXTRAS.filter(e=>extras[e.key]).map(e=>`${e.icon} ${e.label}`).join(' · ')||'Aucune'],['Date',form.date],['Heure',form.time]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ color:'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ background:'var(--bg-section)', borderRadius:'var(--radius-sm)', padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', margin:'16px 0' }}>
                  <span style={{ fontWeight:600, fontSize:14 }}>Total</span>
                  <PriceTag amount={total} size="xl"/>
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
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28, lineHeight:1.6 }}>Votre demande est transmise aux prestataires disponibles à Griffintown.</p>
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
