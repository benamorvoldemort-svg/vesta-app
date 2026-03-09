export function Card({ children, className = '', onClick, style = {} }) {
  return (
    <div onClick={onClick} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px', boxShadow:'var(--shadow)', cursor: onClick ? 'pointer' : 'default', transition:'all 0.2s ease', ...style }}
      onMouseOver={onClick ? e => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.borderColor='var(--border-dark)' } : undefined}
      onMouseOut={onClick ? e => { e.currentTarget.style.boxShadow='var(--shadow)'; e.currentTarget.style.borderColor='var(--border)' } : undefined}
      className={className}>
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: { background:'var(--bg-section)', color:'var(--text-muted)', border:'1px solid var(--border)' },
    gold:    { background:'var(--brown-light)', color:'var(--brown)', border:'1px solid rgba(184,147,90,0.3)' },
    teal:    { background:'var(--green-light)', color:'var(--green)', border:'1px solid rgba(107,158,120,0.3)' },
    red:     { background:'var(--red-light)', color:'var(--red)', border:'1px solid rgba(192,97,79,0.25)' },
    blue:    { background:'var(--blue-light)', color:'var(--blue)', border:'1px solid rgba(100,149,180,0.25)' },
  }
  return <span style={{ ...styles[variant]||styles.default, display:'inline-block', padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>{children}</span>
}

export function Button({ children, onClick, variant = 'primary', className = '', disabled = false, loading = false, size = 'md' }) {
  const pad = size==='sm' ? '9px 16px' : size==='lg' ? '16px 24px' : '13px 20px'
  const variants = {
    primary: { background:'var(--brown)', color:'#FFF', boxShadow:'0 2px 10px rgba(184,147,90,0.25)' },
    outline: { background:'transparent', color:'var(--brown)', border:'1.5px solid var(--brown)' },
    ghost:   { background:'var(--bg-section)', color:'var(--text-muted)', border:'1px solid var(--border)' },
    danger:  { background:'transparent', color:'var(--red)', border:'1px solid rgba(192,97,79,0.4)' },
    green:   { background:'var(--green)', color:'#FFF' },
  }
  return (
    <button onClick={onClick} disabled={disabled||loading}
      style={{ width:'100%', padding:pad, borderRadius:'var(--radius-sm)', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, cursor:disabled||loading?'not-allowed':'pointer', opacity:disabled||loading?0.6:1, transition:'all 0.2s ease', border:'none', ...variants[variant]||variants.primary }}
      onMouseOver={!disabled&&!loading ? e=>{ e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)' } : undefined}
      onMouseOut={!disabled&&!loading ? e=>{ e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' } : undefined}>
      {loading
        ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><span style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'}}/>Chargement...</span>
        : children}
    </button>
  )
}

export function Input({ label, hint, ...props }) {
  return (
    <div style={{marginBottom:14}}>
      {label && <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:6,fontWeight:500}}>{label}</label>}
      <input {...props} style={{width:'100%',background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'12px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:'none',transition:'all 0.2s'}}
        onFocus={e=>{e.target.style.borderColor='var(--brown)';e.target.style.background='#fff'}}
        onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.background='var(--bg-input)'}}/>
      {hint && <p style={{fontSize:11,color:'var(--text-dim)',marginTop:4}}>{hint}</p>}
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{marginBottom:14}}>
      {label && <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:6,fontWeight:500}}>{label}</label>}
      <select {...props} style={{width:'100%',background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'12px 14px',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:'none'}}>{children}</select>
    </div>
  )
}

export function SectionLabel({ children, className = '' }) {
  return <p style={{fontSize:11,fontWeight:600,color:'var(--brown)',textTransform:'uppercase',letterSpacing:'0.10em',marginBottom:12}} className={className}>{children}</p>
}

export function Divider() {
  return <div style={{height:1,background:'var(--border)',margin:'16px 0'}}/>
}

export function StatusTracker({ steps, currentStatus }) {
  const currentIdx = steps.findIndex(s => s.key === currentStatus)
  return (
    <div style={{display:'flex',flexDirection:'column'}}>
      {steps.map((step, i) => {
        const isDone = i < currentIdx, isCurrent = i === currentIdx
        return (
          <div key={step.key} style={{display:'flex',gap:14,position:'relative',paddingBottom:i<steps.length-1?20:0}}>
            {i<steps.length-1 && <div style={{position:'absolute',left:9,top:20,bottom:0,width:2,background:isDone?'var(--brown)':'var(--border)',borderRadius:1,transition:'background 0.4s'}}/>}
            <div style={{width:20,height:20,borderRadius:'50%',flexShrink:0,marginTop:2,background:isDone?'var(--brown)':isCurrent?'var(--brown-light)':'var(--bg-section)',border:`2px solid ${isDone||isCurrent?'var(--brown)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:isCurrent?'0 0 0 4px var(--brown-light)':'none',zIndex:1,transition:'all 0.3s'}}>
              {isDone && <span style={{fontSize:9,color:'#fff',fontWeight:900}}>✓</span>}
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:600,color:isCurrent?'var(--text)':isDone?'var(--brown)':'var(--text-dim)',transition:'color 0.3s'}}>{step.label}</p>
              <p style={{fontSize:11,color:'var(--text-dim)',marginTop:2}}>{isCurrent?step.desc:isDone?'✓ Complété':'—'}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function LiveDot() {
  return <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'var(--green)',animation:'pulse 2s infinite',flexShrink:0}}/>
}

export function PriceTag({ amount, size = 'lg' }) {
  const sizes = { sm:16, md:22, lg:30, xl:40 }
  return <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:sizes[size],color:'var(--brown)',letterSpacing:'-0.01em'}}>{amount}$</span>
}

export function Toast({ message, show }) {
  return (
    <div style={{position:'fixed',bottom:32,left:'50%',transform:`translateX(-50%) translateY(${show?0:80}px)`,background:'var(--text)',color:'var(--bg)',padding:'12px 24px',borderRadius:30,fontWeight:600,fontSize:13,boxShadow:'0 8px 32px rgba(61,44,30,0.2)',zIndex:9998,transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s',opacity:show?1:0,whiteSpace:'nowrap',pointerEvents:'none',display:'flex',alignItems:'center',gap:8}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:'var(--brown)',display:'inline-block'}}/>
      {message}
    </div>
  )
}

export function Header({ onLogout, userName, role }) {
  return (
    <header style={{background:'rgba(250,246,241,0.95)',backdropFilter:'blur(16px)',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:100,padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'baseline',gap:8}}>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,fontStyle:'italic',color:'var(--brown)',letterSpacing:'-0.02em'}}>Vesta Home</span>
        {role && <span style={{fontSize:11,color:'var(--text-dim)',fontWeight:500,letterSpacing:'0.06em',textTransform:'uppercase'}}>{role}</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        {userName && <span style={{fontSize:13,color:'var(--text-muted)'}}>{userName}</span>}
        <button onClick={onLogout} style={{background:'var(--bg-section)',border:'1px solid var(--border)',borderRadius:8,padding:'6px 14px',color:'var(--text-muted)',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}
          onMouseOver={e=>{e.currentTarget.style.borderColor='var(--brown)';e.currentTarget.style.color='var(--brown)'}}
          onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
          Déconnexion
        </button>
      </div>
    </header>
  )
}
