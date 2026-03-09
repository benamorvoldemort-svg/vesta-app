import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyDqnsBqjKKpaU5L-1PN1QNk7ANXx08YN50",
  authDomain: "vesta-app-4bd36.firebaseapp.com",
  projectId: "vesta-app-4bd36",
  storageBucket: "vesta-app-4bd36.firebasestorage.app",
  messagingSenderId: "412238662053",
  appId: "1:412238662053:web:8143dc4ca8558b26a1404c"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const messaging = await isSupported().then(yes => yes ? getMessaging(app) : null)
