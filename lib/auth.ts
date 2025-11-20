import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { db as firestore } from './firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Starting authentication process')
        console.log('[Auth] Credentials provided:', !!credentials?.email, !!credentials?.password)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          throw new Error('Invalid credentials')
        }

        // Check if Firebase is available and use it as primary
        console.log('[Auth] Firebase available:', !!firestore)
        if (firestore) {
          try {
            console.log('[Auth] Attempting Firebase authentication for:', credentials.email)
            const usersRef = collection(firestore, 'users')
            const q = query(usersRef, where('email', '==', credentials.email))
            const snapshot = await getDocs(q)
            
            if (snapshot.empty) {
              console.log('[Auth] User not found in Firebase')
              throw new Error('User not found')
            }
            
            const userDoc = snapshot.docs[0]
            const userData = userDoc.data()
            console.log('[Auth] User found in Firebase:', userData.email, userData.role)
            
            // Compare password (assuming it's stored as bcrypt hash in Firebase too)
            console.log('[Auth] Comparing passwords...')
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              userData.passwordHash
            )
            
            if (!isPasswordValid) {
              console.log('[Auth] Invalid password')
              throw new Error('Invalid password')
            }
            
            console.log('[Auth] Password valid, preparing user object')
            
            // Get vendor info if exists
            let vendorId = null
            if (userData.role === 'VENDOR' && userData.vendorId) {
              vendorId = userData.vendorId
            } else if (userData.role === 'VENDOR') {
              // Try to find vendor by userId
              const vendorsRef = collection(firestore, 'vendors')
              const vendorQuery = query(vendorsRef, where('userId', '==', userDoc.id))
              const vendorSnapshot = await getDocs(vendorQuery)
              if (!vendorSnapshot.empty) {
                vendorId = vendorSnapshot.docs[0].id
              }
            }
            
            const userObject = {
              id: userDoc.id,
              email: userData.email,
              name: userData.fullName,
              role: userData.role,
              rfidNumber: userData.rfidNumber,
              rfidBalance: userData.rfidBalance,
              vendorId: vendorId,
            }
            
            console.log('[Auth] Authentication successful:', userObject)
            return userObject
          } catch (error) {
            console.error('[Auth] Firebase auth failed:', error)
            // Fall back to Prisma
          }
        }

        // Fallback to Prisma/SQLite
        console.log('[Auth] Falling back to Prisma authentication')
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { vendor: true },
        })

        if (!user) {
          console.log('[Auth] User not found in Prisma')
          throw new Error('User not found')
        }

        console.log('[Auth] User found in Prisma:', user.email, user.role)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          console.log('[Auth] Invalid password in Prisma')
          throw new Error('Invalid password')
        }

        console.log('[Auth] Prisma authentication successful')
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          rfidNumber: user.rfidNumber,
          rfidBalance: user.rfidBalance,
          vendorId: user.vendor?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('[Auth] Setting JWT token data:', user)
        token.id = user.id
        token.role = user.role
        token.rfidNumber = user.rfidNumber
        token.rfidBalance = user.rfidBalance
        token.vendorId = user.vendorId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.rfidNumber = token.rfidNumber as string
        session.user.rfidBalance = token.rfidBalance as number
        session.user.vendorId = token.vendorId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signOut() {
      // Clean up any session data
    },
  },
}