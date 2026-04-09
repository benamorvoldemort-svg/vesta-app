import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/config'
import { uploadPhoto } from '../firebase/photoService'
import { Card, Button, Input, SectionLabel, Divider, Toast } from '../components/ui'
import { useToast } from '../hooks/useToast'

export default function ProfilePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [nom, setNom]             = useState(profile?.displayName || profile?.nom || '')
  const [bio, setBio]             = useState(profile?.bio || '')
  const [disponible, setDisponible] = useState(profile?.disponible || false)
  const [photoURL, setPhotoURL]   = useState(profile?.photoURL || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { toast, notify } = useToast()
  const fileRef = useRef()

  const isPrestataire = profile?.role === 'prestataire' || profile?.role === 'worker'

  async function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPhoto(file)
      setPhotoURL(url)
    } catch {
      notify('Erreur lors du téléchargement de la photo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates = { displayName: nom, nom }
      if (isPrestataire) {
        updates.bio = bio
        updates.disponible = disponible
        updates.photoURL = photoURL
      }
      await updateDoc(doc(db, 'users', profile.uid), updates)
      notify('Profil mis à jour ✓')
    } catch {
      notify('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordReset() {
    try {
      await sendPasswordResetEmail(auth, profile.email)
      setResetSent(true)
      notify('Email de réinitialisation envoyé ✓')
    } catch {
      notify('Erreur lors de l\'envoi.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Retour
        </button>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, fontStyle: 'italic', color: 'var(--brown)', marginBottom: 4 }}>
            Mon profil
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {isPrestataire ? 'Prestataire' : 'Client'} · Griffintown
          </p>
        </div>

        {/* Photo — prestataire seulement */}
        {isPrestataire && (
          <Card style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                background: photoURL ? 'transparent' : 'var(--brown-light)',
                border: '2px solid var(--brown)', cursor: 'pointer', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                position: 'relative',
              }}>
              {photoURL
                ? <img src={photoURL} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🧹'}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(61,44,30,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                <span style={{ fontSize: 18 }}>📷</span>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{nom || 'Votre nom'}</p>
              <button
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                style={{ background: 'none', border: 'none', color: 'var(--brown)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                {uploading ? 'Téléchargement...' : 'Changer la photo'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </Card>
        )}

        {/* Infos générales */}
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel>Informations</SectionLabel>
          <Input
            label="Nom complet"
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Marie Dupont"
          />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
              Adresse email
            </label>
            <div style={{ padding: '12px 14px', background: 'var(--bg-section)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--text-muted)' }}>
              {profile?.email}
            </div>
          </div>

          {isPrestataire && (
            <>
              <Divider />
              <SectionLabel>Bio</SectionLabel>
              <div style={{ marginBottom: 14 }}>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Décrivez votre expérience et vos spécialités..."
                  rows={3}
                  style={{
                    width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text)',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
                    resize: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brown)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <Divider />
              <SectionLabel>Disponibilité</SectionLabel>
              <div
                onClick={() => setDisponible(d => !d)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: disponible ? 'var(--green-light)' : 'var(--bg-section)',
                  border: `1.5px solid ${disponible ? 'rgba(107,158,120,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.2s', marginBottom: 4,
                }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: disponible ? 'var(--green)' : 'var(--text-muted)' }}>
                    {disponible ? 'Disponible' : 'Non disponible'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {disponible ? 'Vous apparaissez dans les recherches' : 'Vous êtes masqué des clients'}
                  </p>
                </div>
                <div style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: disponible ? 'var(--green)' : 'var(--border)',
                  position: 'relative', transition: 'background 0.3s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: disponible ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Sécurité */}
        <Card style={{ marginBottom: 24 }}>
          <SectionLabel>Sécurité</SectionLabel>
          {resetSent ? (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--green-light)', border: '1px solid rgba(107,158,120,0.3)' }}>
              <p style={{ fontSize: 12, color: 'var(--green)' }}>Un lien de réinitialisation a été envoyé à votre adresse email.</p>
            </div>
          ) : (
            <Button variant="ghost" onClick={handlePasswordReset}>
              🔑 Changer mon mot de passe
            </Button>
          )}
        </Card>

        <Button onClick={handleSave} loading={saving} size="lg">
          Enregistrer les modifications
        </Button>

      </div>
      <Toast message={toast.msg} show={toast.show} />
    </div>
  )
}
