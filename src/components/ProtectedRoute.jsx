import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
        <div style={{ width:32, height:32, border:'2px solid var(--border)', borderTop:'2px solid var(--brown)', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
      </div>
    )
  }

  if (!profile) return <Navigate to="/login" replace />

  if (requiredRole && profile.role !== requiredRole) {
    const home = profile.role === 'client' ? '/dashboard/client' : '/dashboard/prestataire'
    return <Navigate to={home} replace />
  }

  return children
}
