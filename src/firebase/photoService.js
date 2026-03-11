const CLOUDINARY_CLOUD_NAME = 'doqzmzixp'
const CLOUDINARY_UPLOAD_PRESET = 'vesta_photos'

export async function uploadPhoto(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'vesta')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Upload failed')
  const data = await res.json()
  return data.secure_url
}
