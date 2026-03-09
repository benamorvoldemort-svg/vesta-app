import { db } from './config'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'

export function listenWorkers(cb) {
  const q = query(collection(db, 'users'), where('role', '==', 'worker'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ ...d.data() }))))
}

export function listenWorkersByStatus(status, cb) {
  const q = query(collection(db, 'users'), where('role', '==', 'worker'), where('approvalStatus', '==', status))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ ...d.data() }))))
}

export async function updateWorkerApproval(uid, approvalStatus) {
  await updateDoc(doc(db, 'users', uid), { approvalStatus })
}
