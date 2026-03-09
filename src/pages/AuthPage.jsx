import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../firebase/authService'
import { Button, Input, Card } from '../components/ui'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('client')
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    setError(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const u = await registerUser(form.email, form.password, role, form.displayName)
        navigate(u.role === 'worker' ? '/worker' : u.role === 'admin' ? '/admin' : '/')
      } else {
        const u = await loginUser(form.email, form.password)
        navigate(u.role === 'worker' ? '/worker' : u.role === 'admin' ? '/admin' : '/')
      }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:600, fontStyle:'italic', color:'var(--brown)', letterSpacing:'-0.03em', lineHeight:1.1 }}>
            Vesta Home
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:14, marginTop:8 }}>
            Premium Condo Cleaning · Griffintown, Montréal
          </p>
        </div>

        <Card>
          <div style={{ display:'flex', background:'var(--bg-section)', borderRadius:'var(--radius-sm)', padding:3, marginBottom:20 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex:1, padding:'9px', borderRadius:8, border:'none',
                background: mode===m ? 'var(--bg-card)' : 'transparent',
                color: mode===m ? 'var(--text)' : 'var(--text-muted)',
                fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.2s',
                boxShadow: mode===m ? 'var(--shadow)' : 'none',
              }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                {[{ k:'client', l:'🏠 Client', d:'Je veux un ménage' }, { k:'worker', l:'🧹 Travailleur', d:'Je fais des ménages' }].map(r => (
                  <button key={r.k} onClick={() => setRole(r.k)} style={{
                    padding:12, borderRadius:'var(--radius-sm)', textAlign:'left',
                    border: `1.5px solid ${role===r.k ? 'var(--brown)' : 'var(--border)'}`,
                    background: role===r.k ? 'var(--brown-light)' : 'var(--bg-input)',
                    cursor:'pointer', transition:'all 0.2s',
                  }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'var(--text)' }}>{r.l}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{r.d}</div>
                  </button>
                ))}
              </div>
              <Input label="Nom complet" placeholder="Marie Dupont" value={form.displayName} onChange={e => set('displayName', e.target.value)} />
            </>
          )}

          <Input label="Courriel" type="email" placeholder="vous@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />

          {error && (
            <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--red-light)', border:'1px solid rgba(192,97,79,0.2)', marginBottom:14 }}>
              <p style={{ fontSize:12, color:'var(--red)' }}>{error}</p>
            </div>
          )}

          <Button onClick={handleSubmit} loading={loading}>
            {mode === 'login' ? 'Se connecter' : "Créer mon compte"}
          </Button>
        </Card>
      </div>
    </div>
  )
}
