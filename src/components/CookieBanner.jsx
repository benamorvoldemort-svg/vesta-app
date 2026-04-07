import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'vesta_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function refuse() {
    localStorage.setItem(STORAGE_KEY, 'refused')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 10000,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(61,44,30,0.18)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
      maxWidth: 680, margin: '0 auto',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          🍪 Cookies
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Vesta utilise des cookies analytiques pour améliorer votre expérience. Conformément à la{' '}
          <strong>Loi 25 du Québec</strong>, votre consentement est requis.{' '}
          <Link to="/confidentialite" style={{ color: 'var(--brown)', fontWeight: 600, textDecoration: 'none' }}>
            En savoir plus
          </Link>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={refuse}
          style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
          }}>
          Refuser
        </button>
        <button
          onClick={accept}
          style={{
            padding: '8px 16px', borderRadius: 8,
            border: 'none',
            background: 'var(--brown)', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
          }}>
          Accepter
        </button>
      </div>
    </div>
  )
}
