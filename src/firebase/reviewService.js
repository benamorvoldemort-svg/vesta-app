import { db } from './config'
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

export async function submitReview({ bookingId, clientId, prestataireId, rating, comment }) {
  await addDoc(collection(db, 'reviews'), {
    bookingId, clientId, prestataireId, rating,
    comment: comment.trim(),
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'bookings', bookingId), { reviewed: true })
}

export function listenPrestataireReviews(prestataireId, cb) {
  const q = query(collection(db, 'reviews'), where('prestataireId', '==', prestataireId))
  return onSnapshot(q, snap => cb(snap.docs.map(d => d.data())))
}
