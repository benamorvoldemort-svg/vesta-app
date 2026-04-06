import { useState, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { uploadPhoto } from '../firebase/photoService'
import { Card, Button, Input, SectionLabel, Divider } from '../components/ui'

const TYPES_NETTOYAGE = [
  'Résidentiel', 'Commercial', 'Post-déménagement', 'Post-construction', 'Bureaux', 'Airbnb / locations courte durée',
]
const EQUIPEMENTS = [
  'Aspirateur', 'Serpillière / vadrouille', 'Produits de nettoyage', 'Chiffons microfibre', 'Escabeau', 'Équipements industriels',
]

export default function PrestataireOnboarding() {
  const { profile, loading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Étape 1
  const [nom, setNom]           = useState(profile?.displayName || '')
  const [telephone, setTelephone] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [adresse, setAdresse]   = useState('')

  // Étape 2
  const [experience, setExperience] = useState('')
  const [typesNettoyage, setTypesNettoyage] = useState([])
  const [equipements, setEquipements] = useState([])
  const [references, setReferences] = useState('')
  const [motivation, setMotivation] = useState('')

  // Étape 3
  const [photoURL, setPhotoURL]     = useState('')
  const [idPhotoURL, setIdPhotoURL] = useState('')
  const [conditions, setConditions] = useState(false)
  const [uploadingPhoto, setUploadingPhoto]   = useState(false)
  const [uploadingId, setUploadingId]         = useState(false)

  const photoRef = useRef()
  const idRef    = useRef()

  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />

  function toggleArray(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  async function handleUploadPhoto(e, setter, setLoading) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try { setter(await uploadPhoto(file)) } finally { setLoading(false) }
  }

  function validateStep1() {
    return nom.trim() && telephone.trim() && dateNaissance && adresse.trim()
  }
  function validateStep2() {
    return experience && typesNettoyage.length > 0 && motivation.trim()
  }
  function validateStep3() {
    return photoURL && idPhotoURL && conditions
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        displayName: nom, nom,
        telephone, dateNaissance, adresse,
        experience, typesNettoyage, equipements, references, motivation,
        photoURL, idPhotoURL,
        status: 'pending_verification',
        onboardingCompletedAt: new Date().toISOString(),
      })
      navigate('/pending-verification')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { n: 1, label: 'Informations' },
    { n: 2, label: 'Expérience' },
    { n: 3, label: 'Documents' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 600, fontStyle: 'italic', color: 'var(--brown)', marginBottom: 6 }}>
            Vesta Home
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
            Rejoindre l'équipe Vesta
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Complétez votre dossier pour commencer à recevoir des missions
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step > s.n ? 'var(--brown)' : step === s.n ? 'var(--brown-light)' : 'var(--bg-section)',
                  border: `2px solid ${step >= s.n ? 'var(--brown)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  color: step > s.n ? 'white' : step === s.n ? 'var(--brown)' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 11, color: step >= s.n ? 'var(--brown)' : 'var(--text-muted)', fontWeight: step === s.n ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--brown)' : 'var(--border)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── ÉTAPE 1 ── */}
        {step === 1 && (
          <Card>
            <SectionLabel>Informations personnelles</SectionLabel>
            <Input label="Prénom et nom complet" placeholder="Marie Dupont" value={nom} onChange={e => setNom(e.target.value)} />
            <Input label="Numéro de téléphone" type="tel" placeholder="514-000-0000" value={telephone} onChange={e => setTelephone(e.target.value)} />
            <Input label="Date de naissance" type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} />
            <Input label="Adresse complète" placeholder="400 rue des Seigneurs, Montréal, H3J 1X8" value={adresse} onChange={e => setAdresse(e.target.value)} />
            <Button onClick={() => setStep(2)} disabled={!validateStep1()}>
              Continuer →
            </Button>
          </Card>
        )}

        {/* ── ÉTAPE 2 ── */}
        {step === 2 && (
          <Card>
            <SectionLabel>Expérience professionnelle</SectionLabel>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Années d'expérience</label>
              <select value={experience} onChange={e => setExperience(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none' }}>
                <option value="">Sélectionner</option>
                {['Moins de 1 an', '1-2 ans', '2-5 ans', '5-10 ans', 'Plus de 10 ans'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Types de nettoyage maîtrisés</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TYPES_NETTOYAGE.map(t => (
                  <button key={t} onClick={() => toggleArray(typesNettoyage, setTypesNettoyage, t)} style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    border: `1.5px solid ${typesNettoyage.includes(t) ? 'var(--brown)' : 'var(--border)'}`,
                    background: typesNettoyage.includes(t) ? 'var(--brown-light)' : 'var(--bg-input)',
                    color: typesNettoyage.includes(t) ? 'var(--brown)' : 'var(--text-muted)',
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Équipements possédés</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {EQUIPEMENTS.map(e => (
                  <button key={e} onClick={() => toggleArray(equipements, setEquipements, e)} style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    border: `1.5px solid ${equipements.includes(e) ? 'var(--brown)' : 'var(--border)'}`,
                    background: equipements.includes(e) ? 'var(--brown-light)' : 'var(--bg-input)',
                    color: equipements.includes(e) ? 'var(--brown)' : 'var(--text-muted)',
                  }}>{e}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Références (optionnel)</label>
              <textarea value={references} onChange={e => setReferences(e.target.value)} rows={3} placeholder="Nom et coordonnées d'anciens employeurs ou clients..."
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--brown)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Pourquoi voulez-vous rejoindre Vesta ? *</label>
              <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={4} placeholder="Parlez-nous de votre motivation et de ce qui vous distingue..."
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--brown)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setStep(1)}>← Retour</Button>
              <Button onClick={() => setStep(3)} disabled={!validateStep2()}>Continuer →</Button>
            </div>
          </Card>
        )}

        {/* ── ÉTAPE 3 ── */}
        {step === 3 && (
          <Card>
            <SectionLabel>Documents</SectionLabel>

            {/* Photo de profil */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Photo de profil *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                  {photoURL ? <img src={photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧹'}
                </div>
                <div>
                  <button onClick={() => photoRef.current.click()} disabled={uploadingPhoto}
                    style={{ padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--brown)', background: 'var(--brown-light)', color: 'var(--brown)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {uploadingPhoto ? 'Envoi...' : photoURL ? 'Changer' : 'Choisir une photo'}
                  </button>
                  {photoURL && <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>✓ Photo téléchargée</p>}
                </div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleUploadPhoto(e, setPhotoURL, setUploadingPhoto)} />
            </div>

            <Divider />

            {/* Pièce d'identité */}
            <div style={{ marginBottom: 20, marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Pièce d'identité *</label>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Passeport, permis de conduire ou carte d'identité (photo ou scan)</p>
              <button onClick={() => idRef.current.click()} disabled={uploadingId}
                style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: `1.5px dashed ${idPhotoURL ? 'var(--green)' : 'var(--border)'}`, background: idPhotoURL ? 'var(--green-light)' : 'var(--bg-input)', color: idPhotoURL ? 'var(--green)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {uploadingId ? '⏳ Envoi en cours...' : idPhotoURL ? '✓ Document téléchargé' : '📎 Télécharger la pièce d\'identité'}
              </button>
              <input ref={idRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                onChange={e => handleUploadPhoto(e, setIdPhotoURL, setUploadingId)} />
            </div>

            <Divider />

            {/* Conditions */}
            <div style={{ marginBottom: 24, marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={conditions} onChange={e => setConditions(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--brown)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                  J'accepte les <span style={{ color: 'var(--brown)', fontWeight: 600 }}>conditions d'utilisation</span> de la plateforme Vesta Home, notamment les politiques de qualité de service, de ponctualité et de respect des clients.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setStep(2)}>← Retour</Button>
              <Button onClick={handleSubmit} loading={saving} disabled={!validateStep3()}>
                Soumettre mon dossier →
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
