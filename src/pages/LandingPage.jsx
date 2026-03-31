import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const SERVICES = [
  { icon: '🏠', title: 'Ménage régulier', desc: 'Nettoyage complet de votre condo chaque semaine ou aux deux semaines.' },
  { icon: '✨', title: 'Grand ménage', desc: 'Nettoyage en profondeur de printemps ou avant un déménagement.' },
  { icon: '🛋️', title: 'Post-construction', desc: 'Nettoyage après rénovations pour un condo impeccable.' },
]

const STEPS_HOW = [
  { num: '01', title: 'Réservez en ligne', desc: 'Choisissez votre logement, vos options et votre date en 2 minutes.' },
  { num: '02', title: 'On envoie un pro', desc: 'Un travailleur vérifié de Griffintown arrive à l\'heure convenue.' },
  { num: '03', title: 'Profitez', desc: 'Votre condo est impeccable. Photos avant/après incluses.' },
]

const REVIEWS = [
  { name: 'Julie M.', hood: 'Griffintown', text: 'Service impeccable! Mon condo n\'a jamais été aussi propre. Je recommande à 100%.', stars: 5 },
  { name: 'Marc T.', hood: 'Saint-Henri', text: 'Rapide, professionnel et abordable. Le travailleur est arrivé à l\'heure exacte.', stars: 5 },
  { name: 'Sophie L.', hood: 'Pointe-Saint-Charles', text: 'J\'utilise Vesta toutes les deux semaines. La qualité est toujours au rendez-vous.', stars: 5 },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(250,246,241,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, fontStyle: 'italic', color: 'var(--brown)' }}>
          Vesta Home
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brown)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            Connexion
          </button>
          <button onClick={() => navigate('/login')} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--brown)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 10px rgba(184,147,90,0.3)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Réserver maintenant
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FAF6F1 0%, #F3EDE5 50%, #EDE6DC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(184,147,90,0.06)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '5%', left: '2%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(184,147,90,0.04)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: 720, textAlign: 'center' }} className="animate-fade-up">
          <div style={{ display: 'inline-block', background: 'var(--brown-light)', border: '1px solid rgba(184,147,90,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: 'var(--brown)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
            ✨ Griffintown · Montréal
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 24, color: 'var(--text)' }}>
            Un condo propre,<br/>
            <span style={{ color: 'var(--brown)' }}>sans effort.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Réservez un ménage professionnel en 2 minutes. Des travailleurs vérifiés de votre quartier, disponibles 7 jours sur 7.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{ padding: '16px 36px', borderRadius: 12, border: 'none', background: 'var(--brown)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(184,147,90,0.35)', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(184,147,90,0.4)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(184,147,90,0.35)' }}>
              Réserver maintenant →
            </button>
            <button onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '16px 36px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brown)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              Comment ça marche
            </button>
          </div>
          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 48 }}>
            <div style={{ display: 'flex' }}>
              {['👩', '👨', '👩🦱', '👨🦳', '👩🦰'].map((e, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${30 + i * 15}, 40%, ${75 - i * 5}%)`, border: '2px solid var(--bg)', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{e}</div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>⭐⭐⭐⭐⭐ <span style={{ color: 'var(--brown)' }}>4.9/5</span></p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>+200 ménages à Griffintown</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING BANNER */}
      <section style={{ background: 'var(--brown)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[{ size: 'Studio', price: '89$' }, { size: '3½', price: '109$' }, { size: '4½', price: '139$' }, { size: '5½', price: '169$' }].map(p => (
            <div key={p.size} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: 'white', lineHeight: 1 }}>{p.price}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{p.size}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '96px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Simple et rapide</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 52px)', fontStyle: 'italic', fontWeight: 600 }}>Comment ça marche</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {STEPS_HOW.map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px', boxShadow: '0 2px 12px rgba(61,44,30,0.07)' }} className={`animate-fade-up stagger-${i + 1}`}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, color: 'var(--brown)', opacity: 0.3, lineHeight: 1, marginBottom: 16 }}>{s.num}</p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: '96px 24px', background: 'var(--bg-section)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Nos services</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 52px)', fontStyle: 'italic', fontWeight: 600 }}>Tout ce dont vous avez besoin</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {SERVICES.map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px', boxShadow: '0 2px 12px rgba(61,44,30,0.07)', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(61,44,30,0.12)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(61,44,30,0.07)' }}>
                <p style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding: '96px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Témoignages</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 52px)', fontStyle: 'italic', fontWeight: 600 }}>Ce que disent nos clients</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px', boxShadow: '0 2px 12px rgba(61,44,30,0.07)' }}>
                <p style={{ color: 'var(--brown)', fontSize: 18, letterSpacing: 3, marginBottom: 16 }}>{'★'.repeat(r.stars)}</p>
                <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{r.text}"</p>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.hood}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(135deg, #F3EDE5, #EDE6DC)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 56px)', fontStyle: 'italic', fontWeight: 600, marginBottom: 20 }}>
            Prêt pour un condo<br/><span style={{ color: 'var(--brown)' }}>impeccable?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            Rejoignez +200 résidents de Griffintown qui font confiance à Vesta.
          </p>
          <button onClick={() => navigate('/login')} style={{ padding: '18px 48px', borderRadius: 12, border: 'none', background: 'var(--brown)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(184,147,90,0.35)', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(184,147,90,0.4)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(184,147,90,0.35)' }}>
            Réserver mon premier ménage →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--text)', color: 'rgba(255,255,255,0.6)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: 'italic', color: 'var(--brown)', marginBottom: 8 }}>Vesta Home</p>
        <p style={{ fontSize: 13 }}>Griffintown, Montréal · © 2026 Vesta Home</p>
      </footer>

    </div>
  )
}
