import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenAvailableBookings, listenWorkerActiveBooking, acceptBooking, startBooking, completeBooking, updateBookingPhotos } from '../firebase/bookingService'
import { logoutUser } from '../firebase/authService'
import { requestNotificationPermission, onForegroundMessage } from '../firebase/notificationService'
import { Card, Button, Badge, SectionLabel, StatusTracker, Toast, Header, PriceTag, Divider } from '../components/ui'
import { Camera } from 'lucide-react'

const STEPS = [
  { key:'Assigned',    label:'Mission acceptée',  desc:"En route vers l'adresse" },
  { key:'started',     label:'Arrivé sur place',  desc:'Photos AVANT requises' },
  { key:'InProgress',  label:'Ménage en cours',   desc:'Nettoyage en cours...' },
  { key:'photos_after',label:'Photos APRÈS',      desc:'Documenter le résultat' },
  { key:'Completed',   label:'Mission terminée',  desc:'Paiement en cours 💰' },
]

const JOB_POSITIONS = [{ x:260,y:275 },{ x:480,y:230 },{ x:320,y:415 },{ x:550,y:380 }]

export default function WorkerPage() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [popupJob, setPopupJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show:false, msg:'' })
  const [photoBefore, setPhotoBefore] = useState(0)
  const [photoAfter, setPhotoAfter] = useState(0)

  function notify(msg) { setToast({ show:true, msg }); setTimeout(()=>setToast({ show:false, msg:'' }), 3000) }

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

  async function handleAccept(jobId) { setLoading(true); await acceptBooking(jobId, profile.uid); setPopupJob(null); notify('Mission acceptée! 🎉'); setLoading(false) }
  async function handleStart() { setLoading(true); await startBooking(activeJob.id); notify('Ménage démarré!'); setLoading(false) }
  async function handlePhotoBefore() { const n=photoBefore+1; setPhotoBefore(n); await updateBookingPhotos(activeJob.id,'photosBefore',Array(n).fill('mock')); notify(`Photo AVANT ajoutée (${n}) 📸`) }
  async function handlePhotoAfter() { const n=photoAfter+1; setPhotoAfter(n); await updateBookingPhotos(activeJob.id,'photosAfter',Array(n).fill('mock')); notify(`Photo APRÈS ajoutée (${n}) 📸`) }
  async function handleComplete() { setLoading(true); await completeBooking(activeJob.id); setActiveJob(null); setPhotoBefore(0); setPhotoAfter(0); notify('Mission terminée! 💰'); setLoading(false) }

  if (profile?.approvalStatus==='pending') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <Card style={{ textAlign:'center', maxWidth:360, padding:'48px 24px' }}>
        <p style={{ fontSize:40, marginBottom:16 }}>⏳</p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:24, marginBottom:8 }}>Compte en attente</h2>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>Votre profil est en cours de vérification. Vous serez notifié sous 24h.</p>
        <Button variant="ghost" onClick={logoutUser}>Se déconnecter</Button>
      </Card>
    </div>
  )

  const missionStatus = !activeJob ? null : activeJob.status==='InProgress'&&photoAfter>0 ? 'photos_after' : activeJob.status

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
                <p style={{ fontSize:11, color:'var(--brown)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>{jobs.length} mission{jobs.length!==1?'s':''} disponible{jobs.length!==1?'s':''}</p>
                <p style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>Clique sur un marqueur ou une carte</p>
              </div>
              <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                {jobs.length===0 ? (
                  <div style={{ textAlign:'center', padding:'48px 16px' }}>
                    <p style={{ fontSize:36, marginBottom:12 }}>🔍</p>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:20, marginBottom:4 }}>Aucune mission</p>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>Nouvelles demandes en temps réel</p>
                  </div>
                ) : jobs.map((job, i) => (
                  <Card key={job.id} onClick={()=>setPopupJob(popupJob?.id===job.id?null:job)}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <p style={{ fontWeight:600, fontSize:13 }}>{job.address}</p>
                      <Badge variant="gold">Nouveau</Badge>
                    </div>
                    <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>
                      <span>🏠 {job.size}</span><span>📅 {job.date}</span><span>⏰ {job.time}</span>
                    </div>
                    <PriceTag amount={job.price} size="md"/>
                    {popupJob?.id===job.id && <div style={{ marginTop:10 }}><Button onClick={()=>handleAccept(job.id)} loading={loading}>✅ Accepter la mission</Button></div>}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex:1, position:'relative', background:'#EDE6DC', overflow:'hidden' }}>
          <svg viewBox="0 0 800 600" style={{ width:'100%', height:'100%' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DDD4C4" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#mapbg)"/>
            <rect width="800" height="600" fill="url(#grid)"/>
            <path d="M0 335 Q200 315 400 308 Q600 298 800 285" stroke="#0a3d62" strokeWidth="16" fill="none" opacity=".7"/>
            <path d="M0 335 Q200 315 400 308 Q600 298 800 285" stroke="#1a6fa8" strokeWidth="5" fill="none" opacity=".3"/>
            <text x="60" y="352" fill="#1a6fa8" fontSize="11" fontFamily="DM Sans">Canal de Lachine</text>
            <line x1="0" y1="178" x2="800" y2="178" stroke="#1e3a55" strokeWidth="8"/>
            <text x="10" y="172" fill="#2a5070" fontSize="10" fontFamily="DM Sans">Rue Saint-Antoine O.</text>
            <line x1="0" y1="238" x2="800" y2="238" stroke="#1e3a55" strokeWidth="8"/>
            <text x="10" y="232" fill="#2a5070" fontSize="10" fontFamily="DM Sans">Rue Notre-Dame O.</text>
            <line x1="0" y1="288" x2="800" y2="288" stroke="#1e3a55" strokeWidth="6"/>
            <text x="10" y="282" fill="#2a5070" fontSize="10" fontFamily="DM Sans">Rue des Seigneurs</text>
            <line x1="0" y1="388" x2="800" y2="388" stroke="#1e3a55" strokeWidth="6"/>
            <text x="10" y="382" fill="#2a5070" fontSize="10" fontFamily="DM Sans">Rue Wellington O.</text>
            <line x1="150" y1="0" x2="150" y2="600" stroke="#1e3a55" strokeWidth="6"/>
            <line x1="300" y1="0" x2="300" y2="600" stroke="#1e3a55" strokeWidth="8"/>
            <text x="304" y="26" fill="#2a5070" fontSize="10" fontFamily="DM Sans">Av. Atwater</text>
            <line x1="450" y1="0" x2="450" y2="600" stroke="#1e3a55" strokeWidth="6"/>
            <line x1="600" y1="0" x2="600" y2="600" stroke="#1e3a55" strokeWidth="8"/>
            <text x="604" y="26" fill="#2a5070" fontSize="10" fontFamily="DM Sans">Rue Guy</text>
            {[[160,193,130,38],[160,248,130,32],[310,193,130,38],[310,248,130,32],[460,193,130,75],[160,298,130,82],[310,298,130,82],[460,298,130,82],[160,398,280,42],[460,398,130,42],[10,193,130,80],[610,193,80,80],[710,193,80,80],[610,298,175,82]].map(([x,y,w,h],i)=>(
              <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#142030" stroke="#1e3a55" strokeWidth="1"/>
            ))}
            <circle cx="390" cy="258" r="14" fill="#0d1b2a" stroke="#0abf8f" strokeWidth="2"/>
            <circle cx="390" cy="258" r="7" fill="#0abf8f" filter="url(#glow)"/>
            <circle cx="390" cy="258" r="3" fill="white"/>
            <text x="406" y="255" fill="#0abf8f" fontSize="9" fontFamily="Syne, sans-serif" fontWeight="700">Vous</text>
            {jobs.map((job,i)=>{
              const pos=JOB_POSITIONS[i%JOB_POSITIONS.length]
              const sel=popupJob?.id===job.id
              return (
                <g key={job.id} onClick={()=>setPopupJob(popupJob?.id===job.id?null:job)} style={{cursor:'pointer'}}>
                  {sel&&<circle cx={pos.x} cy={pos.y-20} r="14" fill={pos.color} opacity=".25"/>}
                  <polygon points={`${pos.x},${pos.y-35} ${pos.x+8},${pos.y-22} ${pos.x+4},${pos.y-22} ${pos.x+4},${pos.y-14} ${pos.x-4},${pos.y-14} ${pos.x-4},${pos.y-22} ${pos.x-8},${pos.y-22}`} fill={pos.color} filter="url(#glow)"/>
                  <circle cx={pos.x} cy={pos.y-35} r="9" fill={pos.color}/>
                  <text x={pos.x-4} y={pos.y-32} fill="white" fontSize="10" fontWeight="bold">$</text>
                  <text x={pos.x+12} y={pos.y-38} fill={pos.color} fontSize="10" fontFamily="Syne, sans-serif" fontWeight="700">{job.price}$</text>
                </g>
              )
            })}
            {popupJob&&(()=>{
              const idx=jobs.findIndex(j=>j.id===popupJob.id)
              const pos=JOB_POSITIONS[idx%JOB_POSITIONS.length]
              const px=Math.min(Math.max(pos.x-90,10),560),py=Math.max(pos.y-165,10)
              return (
                <g>
                  <rect x={px} y={py} width="220" height="130" rx="10" fill="#1a2d42" stroke="#0abf8f" strokeWidth="1.5"/>
                  <text x={px+12} y={py+22} fill="white" fontSize="12" fontWeight="bold" fontFamily="Syne, sans-serif">{popupJob.address.slice(0,24)}</text>
                  <text x={px+12} y={py+38} fill="#7a9ab8" fontSize="10" fontFamily="DM Sans">{popupJob.size} · {popupJob.time}</text>
                  <text x={px+12} y={py+60} fill="#0abf8f" fontSize="20" fontWeight="800" fontFamily="Syne, sans-serif">{popupJob.price}$</text>
                  <rect x={px+12} y={py+74} width="92" height="28" rx="7" fill="#0abf8f" style={{cursor:'pointer'}} onClick={()=>handleAccept(popupJob.id)}/>
                  <text x={px+58} y={py+92} fill="white" fontSize="11" fontWeight="700" fontFamily="Syne, sans-serif" textAnchor="middle" style={{cursor:'pointer'}} onClick={()=>handleAccept(popupJob.id)}>✅ Accepter</text>
                  <rect x={px+112} y={py+74} width="96" height="28" rx="7" fill="#1a2d42" stroke="#243a52" style={{cursor:'pointer'}} onClick={()=>setPopupJob(null)}/>
                  <text x={px+160} y={py+92} fill="#7a9ab8" fontSize="11" fontFamily="DM Sans" textAnchor="middle" style={{cursor:'pointer'}} onClick={()=>setPopupJob(null)}>Fermer</text>
                </g>
              )
            })()}
          </svg>
          <div style={{position:'absolute',top:16,left:16,background:'rgba(26,45,66,0.9)',backdropFilter:'blur(10px)',border:'1px solid #243a52',borderRadius:12,padding:'8px 14px',fontSize:13,display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#0abf8f',animation:'pulse 2s infinite'}}/>
            Griffintown, Montréal
          </div>
          {jobs.length>0&&!activeJob&&(
            <div style={{position:'absolute',top:16,right:16,background:'#0abf8f',color:'white',borderRadius:12,padding:'8px 14px',fontSize:13,fontFamily:'Syne,sans-serif',fontWeight:700}}>
              {jobs.length} job{jobs.length>1?'s':''} disponible{jobs.length>1?'s':''}
            </div>
          )}
        </div>
      </div>
      <Toast message={toast.msg} show={toast.show}/>
    </div>
  )
}
