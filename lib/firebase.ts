import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Check if we have valid Firebase configuration
console.log('[Firebase] Checking configuration...')
console.log('[Firebase] NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log('[Firebase] Is placeholder value:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your-firebase-api-key')

const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                         process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-firebase-api-key'

console.log('[Firebase] Has valid config:', hasFirebaseConfig)

const firebaseConfig = hasFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
} : {}

console.log('[Firebase] Config object keys:', Object.keys(firebaseConfig))

// Initialize Firebase only if we have a valid configuration
let app: any, auth: any, db: Firestore | undefined, analytics: any

if (hasFirebaseConfig && Object.keys(firebaseConfig).length > 0) {
  try {
    console.log('[Firebase] Initializing app...')
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    console.log('[Firebase] App initialized:', !!app)
    
    auth = getAuth(app)
    console.log('[Firebase] Auth initialized:', !!auth)
    
    db = getFirestore(app)
    console.log('[Firebase] Firestore initialized:', !!db)
    
    // Analytics only on client side
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
      console.log('[Firebase] Analytics initialized:', !!analytics)
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

console.log('[Firebase] Exporting:', { app: !!app, auth: !!auth, db: !!db, analytics: !!analytics })

export { app, auth, db, analytics }