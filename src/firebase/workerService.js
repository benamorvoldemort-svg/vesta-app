import { db } from './config'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'

export function listenPrestataires(cb) {
  const q = query(collection(db, 'users'), where('role', '==', 'prestataire'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ uid: d.id, ...d.data() }))))
}

export function listenClients(cb) {
  const q = query(collection(db, 'users'), where('role', '==', 'client'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ uid: d.id, ...d.data() }))))
}

export async function updatePrestataire(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}
