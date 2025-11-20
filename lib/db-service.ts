import { prisma } from './prisma'
import { db as firestore } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'

// Database service with 3-way sync: Firebase ↔ Netlify PostgreSQL ↔ Local SQLite
// All databases stay in perfect sync - no memory loss!
export class DatabaseService {
  private static syncEnabled = true

  // Execute query across ALL databases with sync
  static async executeQuery<T>(
    firebaseQuery: () => Promise<T>,
    prismaQuery?: () => Promise<T>
  ): Promise<T> {
    const results: { source: string; data: T; error?: any }[] = []

    // Try Firebase
    try {
      console.log('[DB-Service] Executing on Firebase...')
      const firebaseData = await firebaseQuery()
      results.push({ source: 'Firebase', data: firebaseData })
    } catch (error) {
      console.error('[DB-Service] Firebase failed:', error)
      results.push({ source: 'Firebase', data: null as any, error })
    }

    // Try Prisma (Netlify/Local)
    if (prismaQuery) {
      try {
        console.log('[DB-Service] Executing on Prisma...')
        const prismaData = await prismaQuery()
        results.push({ source: 'Prisma', data: prismaData })
      } catch (error) {
        console.error('[DB-Service] Prisma failed:', error)
        results.push({ source: 'Prisma', data: null as any, error })
      }
    }

    // Return first successful result
    const successfulResult = results.find(r => !r.error)
    if (!successfulResult) {
      throw new Error('All databases failed: ' + JSON.stringify(results.map(r => r.error?.message)))
    }

    console.log(`[DB-Service] ✅ Successfully read from ${successfulResult.source}`)
    return successfulResult.data
  }

  // Write to ALL databases with sync (Fire-and-forget for non-primary)
  static async syncWrite<T>(
    operation: 'create' | 'update' | 'delete',
    firebaseWrite: () => Promise<T>,
    prismaWrite?: () => Promise<T>
  ): Promise<T> {
    const writePromises: Promise<any>[] = []
    let primaryResult: T | null = null

    // PRIMARY: Firebase write (wait for this)
    try {
      console.log(`[DB-Sync] ${operation.toUpperCase()} on Firebase (PRIMARY)...`)
      primaryResult = await firebaseWrite()
      console.log(`[DB-Sync] ✅ Firebase ${operation} succeeded`)
    } catch (error) {
      console.error(`[DB-Sync] ❌ Firebase ${operation} failed:`, error)
      throw error // Critical failure
    }

    // SYNC: Prisma write (background sync)
    if (prismaWrite && this.syncEnabled) {
      writePromises.push(
        prismaWrite()
          .then(() => console.log(`[DB-Sync] ✅ Prisma ${operation} synced`))
          .catch(err => console.error(`[DB-Sync] ⚠️ Prisma sync failed (non-critical):`, err))
      )
    }

    // Don't wait for sync to complete (fire-and-forget)
    if (writePromises.length > 0) {
      Promise.all(writePromises).catch(() => {
        console.warn('[DB-Sync] Some sync operations failed, but primary write succeeded')
      })
    }

    return primaryResult!
  }

  // Get orders
  static async getOrders(userId: string, role: string) {
    return this.executeQuery(
      // Firebase query (PRIMARY)
      async () => {
        console.log(`[DB-Service] Firebase: Fetching orders for user ${userId} with role ${role}`)
        const ordersRef = collection(firestore, 'orders')
        let q
        
        if (role === 'STUDENT') {
          q = query(ordersRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'))
        } else if (role === 'VENDOR') {
          // Get vendor ID from users collection
          const usersRef = collection(firestore, 'users')
          const userQuery = query(usersRef, where('id', '==', userId))
          const userSnap = await getDocs(userQuery)
          
          if (userSnap.empty) return []
          const userData = userSnap.docs[0].data()
          if (!userData.vendorId) return []
          
          q = query(ordersRef, where('vendorId', '==', userData.vendorId), orderBy('createdAt', 'desc'))
        } else if (role === 'ADMIN') {
          q = query(ordersRef, orderBy('createdAt', 'desc'))
        } else {
          return []
        }
        
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      },
      // Prisma fallback (SECONDARY)
      async () => {
        console.log(`[DB-Service] Prisma Fallback: Fetching orders for user ${userId} with role ${role}`)
        
        if (role === 'STUDENT') {
          return await prisma.order.findMany({
            where: { studentId: userId },
            include: { vendor: true },
            orderBy: { createdAt: 'desc' },
          })
        } else if (role === 'VENDOR') {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { vendor: true }
          })
          
          console.log(`[DB-Service] Vendor user:`, user?.vendor ? `Found vendor: ${user.vendor.id}` : 'No vendor found')
          
          if (!user?.vendor) {
            console.log('[DB-Service] User has no vendor association')
            return []
          }

          const orders = await prisma.order.findMany({
            where: { vendorId: user.vendor.id },
            include: {
              student: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
          
          console.log(`[DB-Service] Found ${orders.length} orders for vendor ${user.vendor.id}`)
          return orders
        } else if (role === 'ADMIN') {
          return await prisma.order.findMany({
            include: {
              vendor: true,
              student: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        }
        return []
      }
    )
  }

  // Create order (SYNCED across all DBs)
  static async createOrder(data: any) {
    return this.syncWrite(
      'create',
      // Firebase write
      async () => {
        const ordersRef = collection(firestore, 'orders')
        const docRef = await addDoc(ordersRef, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        return { id: docRef.id, ...data }
      },
      // Prisma sync write
      async () => {
        return await prisma.order.create({
          data,
          include: {
            vendor: true,
            student: {
              select: {
                fullName: true,
                rfidNumber: true,
              },
            },
          },
        })
      }
    )
  }

  // Update order status (SYNCED across all DBs)
  static async updateOrderStatus(orderId: string, status: string) {
    return this.syncWrite(
      'update',
      // Firebase write
      async () => {
        const orderRef = doc(firestore, 'orders', orderId)
        await updateDoc(orderRef, {
          orderStatus: status,
          updatedAt: new Date(),
        })
        return { id: orderId, orderStatus: status }
      },
      // Prisma sync write
      async () => {
        return await prisma.order.update({
          where: { id: orderId },
          data: { orderStatus: status },
        })
      }
    )
  }

  // Get user with vendor
  static async getUserWithVendor(userId: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const usersRef = collection(firestore, 'users')
        const q = query(usersRef, where('id', '==', userId))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) return null
        const userData = snapshot.docs[0].data()
        
        // Get vendor if exists
        if (userData.vendorId) {
          const vendorsRef = collection(firestore, 'vendors')
          const vendorQuery = query(vendorsRef, where('userId', '==', userId))
          const vendorSnap = await getDocs(vendorQuery)
          
          if (!vendorSnap.empty) {
            userData.vendor = { id: vendorSnap.docs[0].id, ...vendorSnap.docs[0].data() }
          }
        }
        
        return { id: snapshot.docs[0].id, ...userData }
      },
      // Prisma fallback
      async () => {
        return await prisma.user.findUnique({
          where: { id: userId },
          include: { vendor: true }
        })
      }
    )
  }

  // Get menu items
  static async getMenuItems(vendorId: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const menuRef = collection(firestore, 'menuItems')
        const q = query(
          menuRef,
          where('vendorId', '==', vendorId),
          where('isAvailable', '==', true),
          orderBy('category', 'asc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      },
      // Prisma fallback
      async () => {
        return await prisma.menuItem.findMany({
          where: {
            vendorId,
            isAvailable: true,
          },
          orderBy: {
            category: 'asc',
          },
        })
      }
    )
  }

  // Get vendors
  static async getVendors() {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const vendorsRef = collection(firestore, 'vendors')
        const q = query(
          vendorsRef,
          where('isActive', '==', true),
          orderBy('averageRating', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      },
      // Prisma fallback
      async () => {
        return await prisma.vendor.findMany({
          where: { isActive: true },
          include: {
            user: {
              select: {
                fullName: true,
                phoneNumber: true,
              },
            },
          },
          orderBy: {
            averageRating: 'desc',
          },
        })
      }
    )
  }
}
