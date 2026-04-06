import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../firebase/authService'
import { Button } from '../components/ui'

export default function PendingVerification() {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />
  const isRejected = profile?.status === 'rejected'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>

        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, fontStyle: 'italic', color: 'var(--brown)', marginBottom: 32 }}>
          Vesta Home
        </p>

        {isRejected ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
              Dossier non retenu
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              Nous avons examiné votre dossier et ne sommes pas en mesure de vous intégrer à l'équipe Vesta pour le moment.
            </p>
            {profile?.rejectionReason && (
              <div style={{ background: 'var(--red-light)', border: '1px solid rgba(192,97,79,0.2)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 24, textAlign: 'left' }}>
                <p style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>Raison :</p>
                <p style={{ fontSize: 13, color: 'var(--text)' }}>{profile.rejectionReason}</p>
              </div>
            )}
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
              Pour toute question, contactez-nous à <span style={{ color: 'var(--brown)' }}>support@vestahome.ca</span>
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>⏳</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
              Dossier en cours de vérification
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Votre dossier est en cours de vérification. Nous vous contacterons dans <strong>24-48h</strong> à l'adresse <span style={{ color: 'var(--brown)' }}>{profile?.email}</span>.
            </p>
            <div style={{ background: 'var(--brown-light)', border: '1px solid rgba(184,147,90,0.3)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 28, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: 'var(--brown)', fontWeight: 600, marginBottom: 6 }}>Prochaines étapes :</p>
              {['Vérification de votre identité', 'Examen de votre expérience', 'Activation de votre compte'].map((s, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--brown)', fontWeight: 700 }}>{i + 1}.</span> {s}
                </p>
              ))}
            </div>
          </>
        )}

        <Button variant="ghost" onClick={logoutUser}>Se déconnecter</Button>
      </div>
    </div>
  )
}
