const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')

initializeApp()
const db = getFirestore()

const MESSAGES = {
  Assigned: (date, time) => ({
    title: 'Réservation confirmée ✓',
    body: `Votre prestataire est assigné et sera chez vous le ${date} à ${time}`,
  }),
  en_route: () => ({
    title: 'Votre prestataire est en route 🚗',
    body: 'Il arrive bientôt à votre adresse',
  }),
  Completed: () => ({
    title: 'Ménage terminé ✓',
    body: 'Votre condo est prêt ! Laissez un avis à votre prestataire',
  }),
}

exports.notifyClientOnBookingUpdate = onDocumentUpdated(
  'bookings/{bookingId}',
  async (event) => {
    const before = event.data.before.data()
    const after  = event.data.after.data()

    if (before.status === after.status) return null

    const msgFn = MESSAGES[after.status]
    if (!msgFn) return null

    const notification = msgFn(after.date, after.time)

    const tokenSnap = await db.collection('fcmTokens').doc(after.clientId).get()
    if (!tokenSnap.exists) {
      console.log(`No FCM token for client ${after.clientId}`)
      return null
    }

    const { token } = tokenSnap.data()

    try {
      await getMessaging().send({
        token,
        notification,
        webpush: {
          notification: {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
          },
        },
      })
      console.log(`Notification sent to client ${after.clientId} for status: ${after.status}`)
    } catch (err) {
      console.error(`Failed to send notification: ${err.message}`)
    }

    return null
  }
)
