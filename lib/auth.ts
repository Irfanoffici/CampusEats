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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Check if Firebase is available and use it as primary
        if (firestore) {
          try {
            const usersRef = collection(firestore, 'users')
            const q = query(usersRef, where('email', '==', credentials.email))
            const snapshot = await getDocs(q)
            
            if (snapshot.empty) {
              throw new Error('User not found')
            }
            
            const userDoc = snapshot.docs[0]
            const userData = userDoc.data()
            
            // Compare password (assuming it's stored as bcrypt hash in Firebase too)
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              userData.passwordHash
            )
            
            if (!isPasswordValid) {
              throw new Error('Invalid password')
            }
            
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
            
            return {
              id: userDoc.id,
              email: userData.email,
              name: userData.fullName,
              role: userData.role,
              rfidNumber: userData.rfidNumber,
              rfidBalance: userData.rfidBalance,
              vendorId: vendorId,
            }
          } catch (error) {
            console.error('[Auth] Firebase auth failed:', error)
            // Fall back to Prisma
          }
        }

        // Fallback to Prisma/SQLite
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { vendor: true },
        })

        if (!user) {
          throw new Error('User not found')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

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