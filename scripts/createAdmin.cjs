const admin = require('firebase-admin')

admin.initializeApp({ projectId: 'vesta-app-4bd36' })

const auth = admin.auth()
const db   = admin.firestore()

async function createAdmin() {
  const email    = 'admin@vestahome.ca'
  const password = 'Vesta2026!'

  let uid
  try {
    const existing = await auth.getUserByEmail(email)
    uid = existing.uid
    console.log(`Compte déjà existant: ${uid}`)
  } catch {
    const user = await auth.createUser({ email, password, displayName: 'Admin Vesta' })
    uid = user.uid
    console.log(`Compte créé: ${uid}`)
  }

  await db.collection('users').doc(uid).set({
    uid,
    email,
    displayName: 'Admin Vesta',
    nom: 'Admin Vesta',
    role: 'admin',
  }, { merge: true })

  console.log('✅ Profil Firestore créé/mis à jour avec role: admin')
  console.log(`Email: ${email}`)
  console.log(`Mot de passe: ${password}`)
}

createAdmin().catch(console.error)
