import { messaging } from './config'
import { getToken, onMessage } from 'firebase/messaging'
import { db } from './config'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const VAPID_KEY = 'BJBMk7D5XKDlc6FZVfQFC2m_T-4ZYQBL9qiNlNollCl8AKFQC6n-ypzvDRnSqV9wGYwwerSl-1xs7gP5UYrgPLE'

export async function requestNotificationPermission(uid) {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token && uid) {
      await setDoc(doc(db, 'fcmTokens', uid), { token, uid, updatedAt: new Date() })
    }
    return token
  } catch (err) {
    console.error('Notification permission error:', err)
    return null
  }
}

export function onForegroundMessage(cb) {
  return onMessage(messaging, (payload) => {
    cb(payload)
  })
}
