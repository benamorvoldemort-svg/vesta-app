import { db } from './config'
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp
} from 'firebase/firestore'

export function listenMessages(bookingId, cb) {
  const q = query(
    collection(db, 'bookings', bookingId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export async function sendMessage(bookingId, { uid, displayName, role, text }) {
  await addDoc(collection(db, 'bookings', bookingId, 'messages'), {
    uid, displayName, role, text,
    createdAt: serverTimestamp()
  })
}
