import { useState, useRef } from 'react'
import { uploadPhoto } from '../firebase/photoService'
import { Camera, X } from 'lucide-react'
import Lightbox from './Lightbox'

export default function PhotoUploader({ label, photos, onPhotosChange, maxPhotos = 5 }) {
  const [uploading, setUploading] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const inputRef = useRef(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadPhoto))
      onPhotosChange([...photos, ...urls])
    } catch (err) {
      console.error('Upload error:', err)
    }
    setUploading(false)
    e.target.value = ''
  }

  function removePhoto(idx) {
    onPhotosChange(photos.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brown)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        {label} ({photos.length}/{maxPhotos})
      </p>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
          {photos.map((url, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'zoom-in' }}>
              <img src={url} alt={`photo-${i}`} onClick={() => setLightboxUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => removePhoto(i)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <X size={12} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {photos.length < maxPhotos && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFiles}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              width: '100%', padding: '12px', borderRadius: 10,
              border: `1.5px dashed ${uploading ? 'var(--brown)' : 'var(--border)'}`,
              background: uploading ? 'var(--brown-light)' : 'var(--bg-input)',
              color: uploading ? 'var(--brown)' : 'var(--text-muted)',
              fontSize: 13, cursor: uploading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
            }}>
            {uploading ? (
              <>⏳ Envoi en cours...</>
            ) : (
              <><Camera size={15} /> Prendre / Choisir une photo</>
            )}
          </button>
        </>
      )}
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  )
}
