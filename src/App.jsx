import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ClientPage from './pages/ClientPage'
import PrestatairePage from './pages/PrestatairePage'
import LandingPage from './pages/LandingPage'

function HomeRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (profile?.role === 'client') return <Navigate to="/dashboard/client" replace />
  if (profile?.role === 'prestataire') return <Navigate to="/dashboard/prestataire" replace />
  return <Navigate to="/home" replace />
}

function Router() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowInstall(false)
  }

  return (
    <>
      <Routes>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute requiredRole="client">
              <ClientPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/prestataire"
          element={
            <ProtectedRoute requiredRole="prestataire">
              <PrestatairePage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>

      {showInstall && (
        <div style={{
          position: 'fixed', bottom: 24, left: 16, right: 16, zIndex: 9999,
          background: '#FAF6F1', border: '1px solid #E8DDD2',
          borderRadius: 16, padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(61,44,30,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, fontWeight: 600, color: '#3D2C1E' }}>Installer Vesta</p>
            <p style={{ fontSize: 12, color: '#8C7B6B', marginTop: 2 }}>Ajouter à votre écran d'accueil</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowInstall(false)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E8DDD2', background: 'transparent', color: '#8C7B6B', fontSize: 13, cursor: 'pointer' }}>
              Plus tard
            </button>
            <button onClick={handleInstall} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#B8935A', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Installer
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  )
}
