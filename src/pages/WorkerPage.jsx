import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listenAvailableBookings, listenWorkerActiveBooking, listenWorkerCompletedBookings, acceptBooking, refuseBooking, startBooking, completeBooking, updateBookingPhotos, createNextRecurringBooking } from '../firebase/bookingService'
import { listenPrestataireReviews } from '../firebase/reviewService'
import { logoutUser } from '../firebase/authService'
import { requestNotificationPermission, onForegroundMessage } from '../firebase/notificationService'
import { Card, Button, Badge, SectionLabel, StatusTracker, Toast, Header, PriceTag } from '../components/ui'
import VestaMap from '../components/VestaMap'
import ChatDrawer from '../components/ChatDrawer'
import PhotoUploader from '../components/PhotoUploader'
import { Camera, List, Map } from 'lucide-react'

// Estimated hours per condo size
const SIZE_HOURS = { 'Studio': 1.5, '3½': 2, '4½': 2.5, '5½': 3 }
const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--brown-light)' : 'var(--bg-card)',
      border: `1px solid ${accent ? 'rgba(184,147,90,0.35)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)', padding: '14px 16px',
    }}>
      <p style={{ fontSize: 22, marginBottom: 4 }}>{icon}</p>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: accent ? 'var(--brown)' : 'var(--text)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--brown)', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

function StatsView({ completedBookings, reviews, profile }) {
  const now = new Date()
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const weekJobs = completedBookings.filter(b => b.date && new Date(b.date) >= startOfWeek)
  const monthJobs = completedBookings.filter(b => b.date && new Date(b.date) >= startOfMonth)

  const weekRevenue = Math.round(weekJobs.reduce((s, b) => s + (b.price || 0) * 0.8, 0))
  const monthRevenue = Math.round(monthJobs.reduce((s, b) => s + (b.price || 0) * 0.8, 0))
  const totalRevenue = Math.round(completedBookings.reduce((s, b) => s + (b.price || 0) * 0.8, 0))
  const weekHours = weekJobs.reduce((s, b) => s + (SIZE_HOURS[b.size] || 2), 0).toFixed(1)

  // Best day of week this month
  const dayCounts = Array(7).fill(0)
  monthJobs.forEach(b => { if (b.date) dayCounts[new Date(b.date).getDay()]++ })
  const bestDayIdx = dayCounts.indexOf(Math.max(...dayCounts))
  const bestDay = monthJobs.length > 0 ? DAY_NAMES[bestDayIdx] : '—'

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0
  const avgRatingStr = reviews.length > 0 ? avgRating.toFixed(1) : '—'

  // Account age in days
  const createdAt = profile?.onboardingCompletedAt ? new Date(profile.onboardingCompletedAt) : null
  const accountDays = createdAt ? Math.floor((now - createdAt) / 86400000) : 0

  const badges = [
    avgRating >= 4.8 && reviews.length >= 5 && { icon: '⭐', label: 'Top Prestataire', desc: 'Note ≥ 4.8' },
    weekJobs.length >= 5                      && { icon: '🔥', label: 'En feu',          desc: '5+ jobs cette semaine' },
    accountDays >= 30                         && { icon: '💎', label: 'Fidèle',           desc: 'Actif depuis 30+ jours' },
    profile?.status === 'active'              && { icon: '🏆', label: 'Vérifié',          desc: 'Dossier approuvé' },
  ].filter(Boolean)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Badges</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {badges.map(b => (
              <div key={b.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--brown-light)', border: '1px solid rgba(184,147,90,0.35)',
                borderRadius: 20, padding: '6px 12px',
              }}>
                <span style={{ fontSize: 16 }}>{b.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brown)', lineHeight: 1.2 }}>{b.label}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cette semaine */}
      <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Cette semaine</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <StatCard icon="✅" label="Jobs" value={weekJobs.length} accent />
        <StatCard icon="💰" label="Revenus" value={`${weekRevenue}$`} sub="80% des missions" accent />
        <StatCard icon="⏱️" label="Heures est." value={`${weekHours}h`} accent />
      </div>

      {/* Ce mois */}
      <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Ce mois</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <StatCard icon="📅" label="Jobs" value={monthJobs.length} />
        <StatCard icon="💵" label="Revenus" value={`${monthRevenue}$`} />
        <StatCard icon="🗓️" label="Meilleur jour" value={bestDay} />
      </div>

      {/* Depuis le début */}
      <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Depuis le début</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <StatCard icon="🏅" label="Total jobs" value={completedBookings.length} />
        <StatCard icon="🏦" label="Total revenus" value={`${totalRevenue}$`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        <StatCard icon="⭐" label="Note moyenne" value={avgRatingStr} sub={reviews.length > 0 ? `${reviews.length} avis` : ''} />
        <StatCard icon="💬" label="Avis reçus" value={reviews.length} />
      </div>

      {completedBookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
          Complétez votre première mission pour voir vos statistiques.
        </div>
      )}
    </div>
  )
}

const STEPS = [
  { key:'Assigned',     label:'Mission acceptée',  desc:"En route vers l'adresse" },
  { key:'started',      label:'Arrivé sur place',  desc:'Photos AVANT requises' },
  { key:'InProgress',   label:'Ménage en cours',   desc:'Nettoyage en cours...' },
  { key:'photos_after', label:'Photos APRÈS',      desc:'Documenter le résultat' },
  { key:'Completed',    label:'Mission terminée',  desc:'Paiement en cours 💰' },
]

export default function WorkerPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show:false, msg:'' })
  const [photoBefore, setPhotoBefore] = useState(0)
  const [photoAfter, setPhotoAfter] = useState(0)
  const [workerLocation, setWorkerLocation] = useState(null)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'map' | 'stats'
  const [showChat, setShowChat] = useState(false)
  const [reviews, setReviews] = useState([])
  const [completedBookings, setCompletedBookings] = useState([])

  function notify(msg) { setToast({ show:true, msg }); setTimeout(()=>setToast({ show:false, msg:'' }), 3000) }

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setWorkerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setWorkerLocation({ lat: 45.4909, lng: -73.5698 })
    )
  }, [])

  useEffect(() => {
    if (!profile) return
    const u1 = listenAvailableBookings(setJobs)
    const u2 = listenWorkerActiveBooking(profile.uid, setActiveJob)
    const u3 = listenPrestataireReviews(profile.uid, setReviews)
    const u4 = listenWorkerCompletedBookings(profile.uid, setCompletedBookings)
    return () => { u1(); u2(); u3(); u4() }
  }, [profile])

  useEffect(() => {
    if (!profile) return
    requestNotificationPermission(profile.uid)
    const unsub = onForegroundMessage((payload) => {
      notify(`🔔 ${payload.notification?.title || 'Nouvelle mission!'}`)
    })
    return unsub
  }, [profile])

  useEffect(() => {
    window.vestaTakeJob = (jobId) => handleAccept(jobId)
    return () => delete window.vestaTakeJob
  }, [jobs, profile])

  async function handleAccept(jobId) {
    setLoading(true)
    await acceptBooking(jobId, profile.uid)
    setSelectedJob(null)
    setMobileView('list')
    notify('Mission acceptée! 🎉')
    setLoading(false)
  }

  async function handleRefuse(jobId) {
    setLoading(true)
    await refuseBooking(jobId)
    setSelectedJob(null)
    setLoading(false)
  }

  async function handleStart() {
    setLoading(true)
    await startBooking(activeJob.id)
    notify('Ménage démarré!')
    setLoading(false)
  }



  async function handleComplete() {
    setLoading(true)
    await completeBooking(activeJob.id)
    const next = await createNextRecurringBooking(activeJob)
    setActiveJob(null); setPhotoBefore(0); setPhotoAfter(0)
    if (next) {
      notify(`Mission terminée! Prochain ménage créé le ${next.date} 🔄`)
    } else {
      notify('Mission terminée! 💰')
    }
    setLoading(false)
  }

  if (profile?.status === 'pending_verification') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <Card style={{ textAlign:'center', maxWidth:360, padding:'48px 24px' }}>
        <p style={{ fontSize:40, marginBottom:16 }}>⏳</p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:24, marginBottom:8 }}>Compte en attente</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>Votre profil est en cours de vérification.</p>
        <Button variant="ghost" onClick={logoutUser}>Se déconnecter</Button>
      </Card>
    </div>
  )

  const missionStatus = !activeJob ? null : activeJob.status==='InProgress' && photoAfter>0 ? 'photos_after' : activeJob.status

  return (
    <div style={{ height:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <Header userName={profile?.displayName} onLogout={logoutUser} onProfile={() => navigate('/profile')} role="Prestataire" />
      {reviews.length > 0 && (() => {
        const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        return (
          <div style={{ background: 'var(--brown-light)', borderBottom: '1px solid rgba(184,147,90,0.2)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--brown)', fontSize: 15 }}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brown)' }}>{avg}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({reviews.length} avis)</span>
          </div>
        )
      })()}

      {/* Mobile tab switcher — only shown when no active job */}
      {!activeJob && (
        <div style={{ display:'flex', background:'var(--bg-card)', borderBottom:'1px solid var(--border)', padding:'6px 12px', gap:8 }}>
          <button onClick={() => setMobileView('list')} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background: mobileView==='list' ? 'var(--brown)' : 'var(--bg-section)', color: mobileView==='list' ? 'white' : 'var(--text-muted)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <List size={14}/> Liste ({jobs.length})
          </button>
          <button onClick={() => setMobileView('map')} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background: mobileView==='map' ? 'var(--brown)' : 'var(--bg-section)', color: mobileView==='map' ? 'white' : 'var(--text-muted)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Map size={14}/> Carte
          </button>
          <button onClick={() => setMobileView('stats')} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background: mobileView==='stats' ? 'var(--brown)' : 'var(--bg-section)', color: mobileView==='stats' ? 'white' : 'var(--text-muted)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            📊 Stats
          </button>
        </div>
      )}

      {/* Active job panel */}
      {activeJob && (
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          <div style={{ background:'var(--brown-light)', border:'1px solid rgba(184,147,90,0.3)', borderRadius:'var(--radius)', padding:16, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:11, color:'var(--brown)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
                Mission active
              </span>
              <PriceTag amount={activeJob.price} size="md"/>
            </div>
            <p style={{ fontWeight:600, fontSize:15, color:'var(--text)' }}>{activeJob.address}</p>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{activeJob.size}</p>
          </div>

          <button
            onClick={() => setShowChat(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--bg-input)',
              color: 'var(--text)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 16, fontWeight: 500,
            }}>
            💬 Chat avec le client
          </button>

          <SectionLabel>Étapes</SectionLabel>
          <StatusTracker steps={STEPS} currentStatus={missionStatus}/>

          <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
            {activeJob.status==='Assigned' && <>
              <PhotoUploader
                label="Photos AVANT"
                photos={activeJob.photosBefore || []}
                onPhotosChange={async (urls) => {
                  await updateBookingPhotos(activeJob.id, 'photosBefore', urls)
                }}
              />
              {(activeJob.photosBefore?.length > 0) && (
                <Button onClick={handleStart} loading={loading}>🧹 Commencer le ménage</Button>
              )}
            </>}
            {activeJob.status==='InProgress' && <>
              <PhotoUploader
                label="Photos APRÈS"
                photos={activeJob.photosAfter || []}
                onPhotosChange={async (urls) => {
                  await updateBookingPhotos(activeJob.id, 'photosAfter', urls)
                }}
              />
              {(activeJob.photosAfter?.length > 0) && (
                <Button onClick={handleComplete} loading={loading}>✅ Terminer la mission</Button>
              )}
            </>}
          </div>
        </div>
      )}

      {/* List view */}
      {!activeJob && mobileView==='list' && (
        <div style={{ flex:1, overflowY:'auto', padding:12 }}>
          {jobs.length===0 ? (
            <div style={{ textAlign:'center', padding:'64px 16px' }}>
              <p style={{ fontSize:40, marginBottom:12 }}>🔍</p>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:22, marginBottom:6 }}>Aucune mission</p>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>Nouvelles demandes en temps réel</p>
            </div>
          ) : jobs.map((job) => (
            <Card key={job.id} onClick={()=>setSelectedJob(selectedJob?.id===job.id?null:job)} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <p style={{ fontWeight:600, fontSize:14 }}>{job.address}</p>
                <Badge variant="gold">Nouveau</Badge>
              </div>
              <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-muted)', marginBottom:10, flexWrap:'wrap' }}>
                <span>🏠 {job.size}</span><span>📅 {job.date}</span><span>⏰ {job.time}</span>
              </div>
              <PriceTag amount={job.price} size="md"/>
              {selectedJob?.id===job.id && (
                <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
                  <Button onClick={()=>handleAccept(job.id)} loading={loading}>✅ Accepter la mission</Button>
                  <Button variant="danger" onClick={()=>handleRefuse(job.id)} loading={loading}>✗ Refuser</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Stats view */}
      {!activeJob && mobileView==='stats' && (
        <StatsView completedBookings={completedBookings} reviews={reviews} profile={profile} />
      )}

      {/* Map view */}
      {!activeJob && mobileView==='map' && (
        <div style={{ flex:1, position:'relative' }}>
          <VestaMap
            jobs={jobs}
            onJobSelect={(job) => { setSelectedJob(job); setMobileView('list') }}
            selectedJob={selectedJob}
            workerLocation={workerLocation}
            onAccept={handleAccept}
          />
        </div>
      )}

      {showChat && activeJob && (
        <ChatDrawer
          bookingId={activeJob.id}
          profile={profile}
          onClose={() => setShowChat(false)}
        />
      )}

      <Toast message={toast.msg} show={toast.show}/>
    </div>
  )
}
