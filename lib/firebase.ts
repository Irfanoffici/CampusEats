import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Check if we have valid Firebase configuration
// First try regular environment variables (for server-side), then NEXT_PUBLIC_ (for client-side)
console.log('[Firebase] Checking configuration...')
console.log('[Firebase] FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY)
console.log('[Firebase] NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const authDomain = process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
const appId = process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID
const measurementId = process.env.FIREBASE_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

console.log('[Firebase] Using API Key:', apiKey)
console.log('[Firebase] Is placeholder value:', apiKey === 'your-firebase-api-key')

const hasFirebaseConfig = apiKey && apiKey !== 'your-firebase-api-key'

console.log('[Firebase] Has valid config:', hasFirebaseConfig)

const firebaseConfig = hasFirebaseConfig ? {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId
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