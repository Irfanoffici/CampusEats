import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "***REMOVED***",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "***REMOVED***",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "***REMOVED***",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "***REMOVED***.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "***REMOVED***",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:***REMOVED***:web:6425c3ef15570fe11f623c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "***REMOVED***"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

// Analytics only on client side
let analytics
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { app, auth, db, analytics }
