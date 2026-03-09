import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenAvailableBookings, listenWorkerActiveBooking, acceptBooking, startBooking, completeBooking, updateBookingPhotos } from '../firebase/bookingService'
import { logoutUser } from '../firebase/authService'
import { requestNotificationPermission, onForegroundMessage } from '../firebase/notificationService'
import { Card, Button, Badge, SectionLabel, StatusTracker, Toast, Header, PriceTag, Divider } from '../components/ui'
import VestaMap from '../components/VestaMap'
import { Camera } from 'lucide-react'

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

  function notify(msg) { setToast({ show:true, msg }); setTimeout(()=>setToast({ show:false, msg:'' }), 3000) }

  // Get worker GPS location
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
      notify(`🔔 ${payload.notification?.title || 'Nouvelle mission disponible!'}`)
    })
    return unsub
  }, [profile])

  // Allow map popup to trigger accept
  useEffect(() => {
    window.vestaTakeJob = (jobId) => handleAccept(jobId)
    return () => delete window.vestaTakeJob
  }, [jobs, profile])

  async function handleAccept(jobId) {
    setLoading(true)
    await acceptBooking(jobId, profile.uid)
    setSelectedJob(null)
    notify('Mission acceptée! 🎉')
    setLoading(false)
  }

  async function handleStart() {
    setLoading(true)
    await startBooking(activeJob.id)
    notify('Ménage démarré!')
    setLoading(false)
  }

  async function handlePhotoBefore() {
    const n = photoBefore + 1; setPhotoBefore(n)
    await updateBookingPhotos(activeJob.id, 'photosBefore', Array(n).fill('mock'))
    notify(`Photo AVANT ajoutée (${n}) 📸`)
  }

  async function handlePhotoAfter() {
    const n = photoAfter + 1; setPhotoAfter(n)
    await updateBookingPhotos(activeJob.id, 'photosAfter', Array(n).fill('mock'))
    notify(`Photo APRÈS ajoutée (${n}) 📸`)
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

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Sidebar */}
        <div style={{ width:320, flexShrink:0, background:'var(--bg-card)', borderRight:'1px solid var(--border)', overflowY:'auto', display:'flex', flexDirection:'column' }}>

          {activeJob && (
            <div style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
              <div style={{ background:'var(--brown-light)', border:'1px solid rgba(184,147,90,0.3)', borderRadius:'var(--radius)', padding:16, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:'var(--brown)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
                    Mission active
                  </span>
                  <PriceTag amount={activeJob.price} size="md"/>
                </div>
                <p style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{activeJob.address}</p>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{activeJob.size}</p>
              </div>
              <SectionLabel>Étapes</SectionLabel>
              <StatusTracker steps={STEPS} currentStatus={missionStatus}/>
              <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
                {activeJob.status==='Assigned' && <>
                  <button onClick={handlePhotoBefore} style={{ width:'100%', padding:'10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--bg-input)', color:'var(--text)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, transition:'all 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.borderColor='var(--brown)'}
                    onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <Camera size={14}/>Photos AVANT ({photoBefore} prises)
                  </button>
                  {photoBefore>0 && <Button onClick={handleStart} loading={loading}>🧹 Commencer le ménage</Button>}
                </>}
                {activeJob.status==='InProgress' && <>
                  <button onClick={handlePhotoAfter} style={{ width:'100%', padding:'10px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--bg-input)', color:'var(--text)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, transition:'all 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.borderColor='var(--brown)'}
                    onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <Camera size={14}/>Photos APRÈS ({photoAfter} prises)
                  </button>
                  {photoAfter>0 && <Button onClick={handleComplete} loading={loading}>✅ Terminer la mission</Button>}
                </>}
              </div>
            </div>
          )}

          {!activeJob && (
            <div style={{ flex:1 }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:11, color:'var(--brown)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  {jobs.length} mission{jobs.length!==1?'s':''} disponible{jobs.length!==1?'s':''}
                </p>
                <p style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>Clique sur un marqueur sur la carte</p>
              </div>
              <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                {jobs.length===0 ? (
                  <div style={{ textAlign:'center', padding:'48px 16px' }}>
                    <p style={{ fontSize:36, marginBottom:12 }}>🔍</p>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:20, marginBottom:4 }}>Aucune mission</p>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>Nouvelles demandes en temps réel</p>
                  </div>
                ) : jobs.map((job) => (
                  <Card key={job.id} onClick={()=>setSelectedJob(selectedJob?.id===job.id?null:job)}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <p style={{ fontWeight:600, fontSize:13 }}>{job.address}</p>
                      <Badge variant="gold">Nouveau</Badge>
                    </div>
                    <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>
                      <span>🏠 {job.size}</span><span>📅 {job.date}</span><span>⏰ {job.time}</span>
                    </div>
                    <PriceTag amount={job.price} size="md"/>
                    {selectedJob?.id===job.id && (
                      <div style={{ marginTop:10 }}>
                        <Button onClick={()=>handleAccept(job.id)} loading={loading}>✅ Accepter la mission</Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Google Map */}
        <div style={{ flex:1, position:'relative' }}>
          <VestaMap
            jobs={jobs}
            onJobSelect={setSelectedJob}
            selectedJob={selectedJob}
            workerLocation={workerLocation}
            onAccept={handleAccept}
          />
          <div style={{ position:'absolute', top:16, left:16, background:'rgba(250,246,241,0.95)', backdropFilter:'blur(10px)', border:'1px solid var(--border)', borderRadius:12, padding:'8px 14px', fontSize:13, display:'flex', alignItems:'center', gap:8, boxShadow:'var(--shadow)' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite', display:'inline-block' }}/>
            <span style={{ color:'var(--text-muted)', fontWeight:500 }}>Griffintown, Montréal</span>
          </div>
        </div>
      </div>
      <Toast message={toast.msg} show={toast.show}/>
    </div>
  )
}
