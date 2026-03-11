import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenAvailableBookings, listenWorkerActiveBooking, acceptBooking, startBooking, completeBooking, updateBookingPhotos } from '../firebase/bookingService'
import { logoutUser } from '../firebase/authService'
import { requestNotificationPermission, onForegroundMessage } from '../firebase/notificationService'
import { Card, Button, Badge, SectionLabel, StatusTracker, Toast, Header, PriceTag } from '../components/ui'
import VestaMap from '../components/VestaMap'
import ChatDrawer from '../components/ChatDrawer'
import PhotoUploader from '../components/PhotoUploader'
import { Camera, List, Map } from 'lucide-react'

const STEPS = [
  { key:'Assigned',     label:'Mission acceptée',  desc:"En route vers l'adresse" },
  { key:'started',      label:'Arrivé sur place',  desc:'Photos AVANT requises' },
  { key:'InProgress',   label:'Ménage en cours',   desc:'Nettoyage en cours...' },
  { key:'photos_after', label:'Photos APRÈS',      desc:'Documenter le résultat' },
  { key:'Completed',    label:'Mission terminée',  desc:'Paiement en cours 💰' },
]

export default function WorkerPage() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show:false, msg:'' })
  const [photoBefore, setPhotoBefore] = useState(0)
  const [photoAfter, setPhotoAfter] = useState(0)
  const [workerLocation, setWorkerLocation] = useState(null)
  const [mobileView, setMobileView] = useState('list') // 'list' or 'map'
  const [showChat, setShowChat] = useState(false)

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
    return () => { u1(); u2() }
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

  async function handleStart() {
    setLoading(true)
    await startBooking(activeJob.id)
    notify('Ménage démarré!')
    setLoading(false)
  }



  async function handleComplete() {
    setLoading(true)
    await completeBooking(activeJob.id)
    setActiveJob(null); setPhotoBefore(0); setPhotoAfter(0)
    notify('Mission terminée! 💰')
    setLoading(false)
  }

  if (profile?.approvalStatus === 'pending') return (
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
      <Header userName={profile?.displayName} onLogout={logoutUser} role="Travailleur" />

      {/* Mobile tab switcher — only shown when no active job */}
      {!activeJob && (
        <div style={{ display:'flex', background:'var(--bg-card)', borderBottom:'1px solid var(--border)', padding:'6px 12px', gap:8 }}>
          <button onClick={() => setMobileView('list')} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background: mobileView==='list' ? 'var(--brown)' : 'var(--bg-section)', color: mobileView==='list' ? 'white' : 'var(--text-muted)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <List size={14}/> Liste ({jobs.length})
          </button>
          <button onClick={() => setMobileView('map')} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background: mobileView==='map' ? 'var(--brown)' : 'var(--bg-section)', color: mobileView==='map' ? 'white' : 'var(--text-muted)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Map size={14}/> Carte
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
                <div style={{ marginTop:12 }}>
                  <Button onClick={()=>handleAccept(job.id)} loading={loading}>✅ Accepter la mission</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
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
