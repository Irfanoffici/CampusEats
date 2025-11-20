import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Check if we have valid Firebase configuration
const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                         process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-firebase-api-key'

const firebaseConfig = hasFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
} : {}

// Initialize Firebase only if we have a valid configuration
let app: any, auth: any, db: Firestore | undefined, analytics: any

if (hasFirebaseConfig && Object.keys(firebaseConfig).length > 0) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    
    // Analytics only on client side
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
  } catch (error) {
    console.warn('[Firebase] Initialization failed:', error)
    // Set to undefined if initialization fails
    app = undefined
    auth = undefined
    db = undefined
    analytics = undefined
  }
} else {
  console.warn('[Firebase] Skipping initialization - missing configuration')
  app = undefined
  auth = undefined
  db = undefined
  analytics = undefined
}

export { app, auth, db, analytics }