importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDqnsBqjKKpaU5L-1PN1QNk7ANXx08YN50",
  authDomain: "vesta-app-4bd36.firebaseapp.com",
  projectId: "vesta-app-4bd36",
  storageBucket: "vesta-app-4bd36.firebasestorage.app",
  messagingSenderId: "412238662053",
  appId: "1:412238662053:web:8143dc4ca8558b26a1404c"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  })
})
