import { db } from './config'
import {
  collection, addDoc, doc, updateDoc,
  onSnapshot, query, where, orderBy,
  serverTimestamp, getDocs
} from 'firebase/firestore'

export function listenAvailableBookings(cb) {
  const q = query(collection(db, 'bookings'), where('status', '==', 'Requested'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function listenClientBookings(clientId, cb) {
  const q = query(collection(db, 'bookings'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function listenWorkerActiveBooking(workerId, cb) {
  const q = query(collection(db, 'bookings'), where('workerId', '==', workerId), where('status', 'in', ['Assigned', 'InProgress']))
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    cb(docs[0] || null)
  })
}

export function listenAllBookings(cb) {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export async function createBooking(clientId, data) {
  const ref = await addDoc(collection(db, 'bookings'), {
    clientId, workerId: null, status: 'Requested',
    ...data, photosBefore: [], photosAfter: [],
    createdAt: serverTimestamp()
  })
  notifyWorkersNewBooking({ id: ref.id, clientId, ...data })
  return { id: ref.id }
}

export async function notifyWorkersNewBooking(booking) {
  try {
    const q = query(
      collection(db, 'fcmTokens'),
    )
    const snap = await getDocs(q)
    const tokens = snap.docs.map(d => d.data().token)
    console.log('Workers to notify:', tokens.length)
  } catch (err) {
    console.error('Notify error:', err)
  }
}

export async function acceptBooking(bookingId, workerId) {
  await updateDoc(doc(db, 'bookings', bookingId), { workerId, status: 'Assigned' })
}

export async function startBooking(bookingId) {
  await updateDoc(doc(db, 'bookings', bookingId), { status: 'InProgress' })
}

export async function completeBooking(bookingId) {
  await updateDoc(doc(db, 'bookings', bookingId), { status: 'Completed' })
}

export async function updateBookingPhotos(bookingId, field, urls) {
  await updateDoc(doc(db, 'bookings', bookingId), { [field]: urls })
}

export async function adminUpdateStatus(bookingId, status) {
  await updateDoc(doc(db, 'bookings', bookingId), { status })
}

export async function cancelBooking(bookingId) {
  await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' })
}

export async function refuseBooking(bookingId) {
  await updateDoc(doc(db, 'bookings', bookingId), { status: 'refused' })
}
