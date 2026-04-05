import { auth, db } from './config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export async function registerUser(email, password, role, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const status = role === 'prestataire' ? 'pending_onboarding' : 'active'
  const profile = { uid: cred.user.uid, email, displayName, nom: displayName, role, status }
  await setDoc(doc(db, 'users', cred.user.uid), profile)
  return profile
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const snap = await getDoc(doc(db, 'users', cred.user.uid))
  if (!snap.exists()) throw new Error('Profil introuvable')
  return snap.data()
}

export async function logoutUser() {
  await signOut(auth)
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) { cb(null); return }
    const snap = await getDoc(doc(db, 'users', user.uid))
    cb(snap.exists() ? snap.data() : null)
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}
