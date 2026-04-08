import { db } from './config'
import {
  collection, addDoc, doc, updateDoc,
  onSnapshot, query, where, orderBy,
  serverTimestamp, getDocs, limit
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
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(100))
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
    const snap = await getDocs(collection(db, 'fcmTokens'))
    // tokens collected — FCM send requires Cloud Functions (Blaze plan)
    void snap
  } catch {
    // non-critical — notifications are best-effort
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
  await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled', recurrenceActive: false })
}

export async function refuseBooking(bookingId) {
  await updateDoc(doc(db, 'bookings', bookingId), { status: 'refused' })
}

export async function stopRecurrence(bookingId) {
  await updateDoc(doc(db, 'bookings', bookingId), { recurrenceActive: false })
}

const RECURRENCE_DAYS = { weekly: 7, biweekly: 14, monthly: 30 }

export async function createNextRecurringBooking(completedBooking) {
  if (!completedBooking.recurrenceActive || completedBooking.recurrence === 'once') return null
  const days = RECURRENCE_DAYS[completedBooking.recurrence]
  if (!days) return null
  const d = new Date(completedBooking.date)
  d.setDate(d.getDate() + days)
  const nextDate = d.toISOString().split('T')[0]
  const ref = await addDoc(collection(db, 'bookings'), {
    clientId: completedBooking.clientId,
    workerId: null,
    status: 'Requested',
    address: completedBooking.address,
    postalCode: completedBooking.postalCode || '',
    size: completedBooking.size,
    extras: completedBooking.extras || [],
    price: completedBooking.price,
    date: nextDate,
    time: completedBooking.time,
    recurrence: completedBooking.recurrence,
    recurrenceDiscount: completedBooking.recurrenceDiscount || 0,
    recurrenceActive: true,
    parentBookingId: completedBooking.id,
    photosBefore: [],
    photosAfter: [],
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, date: nextDate }
}
