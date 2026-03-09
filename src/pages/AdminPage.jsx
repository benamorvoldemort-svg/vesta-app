import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenAllBookings, adminUpdateStatus } from '../firebase/bookingService'
import { listenWorkers, updateWorkerApproval } from '../firebase/workerService'
import { logoutUser } from '../firebase/authService'
import { Card, Badge, SectionLabel, Toast, Header, PriceTag, Divider } from '../components/ui'
import { CheckCircle, XCircle } from 'lucide-react'

const STATUS_BADGE = { Requested:'blue', Assigned:'gold', InProgress:'teal', Completed:'default' }

export default function AdminPage() {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [workers, setWorkers] = useState([])
  const [tab, setTab] = useState('overview')
  const [toast, setToast] = useState({ show:false, msg:'' })

  function notify(msg) { setToast({ show:true, msg }); setTimeout(()=>setToast({ show:false, msg:'' }), 3000) }

  useEffect(() => {
    const u1 = listenAllBookings(setBookings)
    const u2 = listenWorkers(setWorkers)
    return () => { u1(); u2() }
  }, [])

  async function handleApproval(uid, status) {
    await updateWorkerApproval(uid, status)
    notify(status==='approved' ? 'Travailleur approuvé ✅' : 'Travailleur refusé')
  }

  const revenue = bookings.filter(b=>b.status==='Completed').reduce((s,b)=>s+(b.price||0), 0)
  const pendingW = workers.filter(w=>w.approvalStatus==='pending').length
  const TABS = [
    { k:'overview', l:"📊 Vue d'ensemble" },
    { k:'bookings', l:'📋 Réservations' },
    { k:'workers',  l:`🧹 Travailleurs${pendingW ? ` (${pendingW})` : ''}` }
  ]

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header userName={profile?.displayName} onLogout={logoutUser} role="Admin" />

      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 20px' }}>

        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:600, fontStyle:'italic' }}>Tableau de bord</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Vesta Home · Griffintown</p>
        </div>

        <div style={{ display:'flex', gap:4, background:'var(--bg-card)', borderRadius:'var(--radius-sm)', padding:4, marginBottom:24, border:'1px solid var(--border)', boxShadow:'var(--shadow)', width:'fit-content' }}>
          {TABS.map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              padding:'9px 16px', borderRadius:8, border:'none',
              background: tab===t.k ? 'var(--bg-section)' : 'transparent',
              color: tab===t.k ? 'var(--brown)' : 'var(--text-muted)',
              fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap',
            }}>
              {t.l}
            </button>
          ))}
        </div>

        {tab==='overview' && (
          <div className="animate-fade-up">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
              {[
                { l:'Revenus totaux', v:revenue, isPrice:true, i:'💰' },
                { l:'En cours',      v:bookings.filter(b=>b.status==='InProgress').length, i:'🔄' },
                { l:'En attente',    v:bookings.filter(b=>b.status==='Requested').length, i:'⏳' },
                { l:'Travailleurs',  v:workers.filter(w=>w.approvalStatus==='approved').length, i:'🧹' },
              ].map(s => (
                <Card key={s.l}>
                  <p style={{ fontSize:28, marginBottom:6 }}>{s.i}</p>
                  {s.isPrice
                    ? <PriceTag amount={s.v} size="lg"/>
                    : <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:600, color:'var(--brown)', lineHeight:1 }}>{s.v}</p>
                  }
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>{s.l}</p>
                </Card>
              ))}
            </div>

            {pendingW>0 && (
              <Card style={{ border:'1px solid rgba(184,147,90,0.35)', background:'var(--brown-light)', marginBottom:16 }}>
                <p style={{ fontWeight:700, color:'var(--brown)', marginBottom:6 }}>⚠️ {pendingW} travailleur{pendingW>1?'s':''} en attente d'approbation</p>
                <button onClick={()=>setTab('workers')} style={{ fontSize:12, color:'var(--brown)', border:'1px solid rgba(184,147,90,0.3)', borderRadius:8, padding:'5px 12px', background:'transparent', cursor:'pointer' }}>Gérer →</button>
              </Card>
            )}

            <SectionLabel>Réservations récentes</SectionLabel>
            {bookings.slice(0,5).map(b => (
              <Card key={b.id} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:14 }}>{b.address}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{b.size} · {b.date} {b.time}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <PriceTag amount={b.price} size="md"/>
                    <Badge variant={STATUS_BADGE[b.status]}>{b.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab==='bookings' && (
          <div className="animate-fade-up">
            {bookings.map(b => (
              <Card key={b.id} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <p style={{ fontWeight:600 }}>{b.address}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{b.size} · {b.date} {b.time}</p>
                    {b.extras?.length>0 && <p style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>{b.extras.join(' · ')}</p>}
                  </div>
                  <Badge variant={STATUS_BADGE[b.status]}>{b.status}</Badge>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: b.status!=='Completed' ? 12 : 0 }}>
                  <PriceTag amount={b.price} size="md"/>
                  <span style={{ fontSize:11, color:'var(--text-dim)' }}>ID: {b.id?.slice(-6)}</span>
                </div>
                {b.status!=='Completed' && (
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['Requested','Assigned','InProgress','Completed'].filter(s=>s!==b.status).map(s => (
                      <button key={s} onClick={()=>adminUpdateStatus(b.id, s)} style={{ padding:'5px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-input)', color:'var(--text-muted)', fontSize:12, cursor:'pointer', transition:'all 0.2s' }}
                        onMouseOver={e=>{ e.currentTarget.style.borderColor='var(--brown)'; e.currentTarget.style.color='var(--brown)' }}
                        onMouseOut={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)' }}>
                        → {s}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {tab==='workers' && (
          <div className="animate-fade-up">
            {workers.map(w => (
              <Card key={w.uid} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: w.approvalStatus==='pending' ? 12 : 0 }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:15 }}>{w.displayName}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{w.email}</p>
                  </div>
                  <Badge variant={w.approvalStatus==='approved'?'teal':w.approvalStatus==='rejected'?'red':'gold'}>{w.approvalStatus}</Badge>
                </div>
                {w.approvalStatus==='pending' && (
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>handleApproval(w.uid,'approved')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:'var(--radius-sm)', border:'1.5px solid rgba(107,158,120,0.4)', background:'var(--green-light)', color:'var(--green)', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.2s' }}
                      onMouseOver={e=>{ e.currentTarget.style.background='var(--green)'; e.currentTarget.style.color='white' }}
                      onMouseOut={e=>{ e.currentTarget.style.background='var(--green-light)'; e.currentTarget.style.color='var(--green)' }}>
                      <CheckCircle size={14}/>Approuver
                    </button>
                    <button onClick={()=>handleApproval(w.uid,'rejected')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:'var(--radius-sm)', border:'1px solid rgba(192,97,79,0.3)', background:'var(--red-light)', color:'var(--red)', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.2s' }}
                      onMouseOver={e=>{ e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='white' }}
                      onMouseOut={e=>{ e.currentTarget.style.background='var(--red-light)'; e.currentTarget.style.color='var(--red)' }}>
                      <XCircle size={14}/>Refuser
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

      </div>
      <Toast message={toast.msg} show={toast.show}/>
    </div>
  )
}
