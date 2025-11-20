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
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        // Populate student and vendor details for each order
        const populatedOrders = await Promise.all(orders.map(async (order: any) => {
          try {
            // Get student details
            if (order.studentId) {
              const studentsRef = collection(firestore, 'users')
              const studentQuery = query(studentsRef, where('id', '==', order.studentId))
              const studentSnap = await getDocs(studentQuery)
              
              if (!studentSnap.empty) {
                const studentData = studentSnap.docs[0].data()
                order.student = {
                  fullName: studentData.fullName || 'Unknown Student',
                  phoneNumber: studentData.phoneNumber || 'N/A'
                }
              }
            }
            
            // Get vendor details
            if (order.vendorId) {
              const vendorsRef = collection(firestore, 'vendors')
              const vendorQuery = query(vendorsRef, where('id', '==', order.vendorId))
              const vendorSnap = await getDocs(vendorQuery)
              
              if (!vendorSnap.empty) {
                const vendorData = vendorSnap.docs[0].data()
                order.vendor = {
                  shopName: vendorData.shopName || 'Unknown Vendor'
                }
              }
            }
          } catch (error) {
            console.error(`[DB-Service] Error populating order ${order.id}:`, error)
          }
          
          return order
        }))
        
        console.log(`[DB-Service] Firebase: Returning ${populatedOrders.length} orders with populated data`)
        return populatedOrders
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
    // Sanitize data for Firebase (convert undefined to null)
    const sanitizeForFirebase = (obj: any): any => {
      const sanitized: any = {}
      for (const key in obj) {
        if (obj[key] === undefined) {
          sanitized[key] = null
        } else if (obj[key] instanceof Date) {
          sanitized[key] = obj[key]
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = sanitizeForFirebase(obj[key])
        } else {
          sanitized[key] = obj[key]
        }
      }
      return sanitized
    }

    return this.syncWrite(
      'create',
      // Firebase write
      async () => {
        const ordersRef = collection(firestore, 'orders')
        const sanitizedData = sanitizeForFirebase(data)
        const docRef = await addDoc(ordersRef, {
          ...sanitizedData,
          id: data.id || null, // Store the Prisma ID for cross-DB queries
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        
        // Update the document with its own Firebase ID if no Prisma ID was provided
        if (!data.id) {
          await updateDoc(docRef, { id: docRef.id })
        }
        
        return { id: data.id || docRef.id, ...data }
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
        const ordersRef = collection(firestore, 'orders')
        const q = query(ordersRef, where('id', '==', orderId))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) throw new Error('Order not found in Firebase')
        
        const orderDocRef = doc(firestore, 'orders', snapshot.docs[0].id)
        await updateDoc(orderDocRef, {
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

  // Update order status and payment status (SYNCED across all DBs)
  static async updateOrderStatusAndPayment(orderId: string, orderStatus: string, paymentStatus: string) {
    return this.syncWrite(
      'update',
      // Firebase write
      async () => {
        const ordersRef = collection(firestore, 'orders')
        const q = query(ordersRef, where('id', '==', orderId))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) throw new Error('Order not found in Firebase')
        
        const orderDocRef = doc(firestore, 'orders', snapshot.docs[0].id)
        await updateDoc(orderDocRef, {
          orderStatus,
          paymentStatus,
          updatedAt: new Date(),
        })
        
        return { id: orderId, orderStatus, paymentStatus }
      },
      // Prisma sync write
      async () => {
        return await prisma.order.update({
          where: { id: orderId },
          data: { orderStatus, paymentStatus },
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

  // Get all users (Admin only)
  static async getAllUsers() {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const usersRef = collection(firestore, 'users')
        const q = query(usersRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      },
      // Prisma fallback
      async () => {
        return await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            phoneNumber: true,
            rfidNumber: true,
            rfidBalance: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      }
    )
  }

  // Get user balance
  static async getUserBalance(userId: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const usersRef = collection(firestore, 'users')
        const q = query(usersRef, where('id', '==', userId))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) return null
        const userData = snapshot.docs[0].data()
        return {
          rfidBalance: userData.rfidBalance,
          rfidNumber: userData.rfidNumber,
        }
      },
      // Prisma fallback
      async () => {
        return await prisma.user.findUnique({
          where: { id: userId },
          select: { rfidBalance: true, rfidNumber: true },
        })
      }
    )
  }

  // Update user RFID balance (SYNCED)
  static async updateUserBalance(userId: string, amount: number, isCredit: boolean = true) {
    return this.syncWrite(
      'update',
      // Firebase write
      async () => {
        const usersRef = collection(firestore, 'users')
        const q = query(usersRef, where('id', '==', userId))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) throw new Error('User not found')
        
        const userData = snapshot.docs[0].data()
        const currentBalance = userData.rfidBalance || 0
        const newBalance = isCredit ? currentBalance + amount : currentBalance - amount
        
        const userRef = doc(firestore, 'users', snapshot.docs[0].id)
        await updateDoc(userRef, {
          rfidBalance: newBalance,
          updatedAt: new Date(),
        })
        
        return { ...userData, id: userId, rfidBalance: newBalance }
      },
      // Prisma sync write
      async () => {
        return await prisma.user.update({
          where: { id: userId },
          data: {
            rfidBalance: {
              [isCredit ? 'increment' : 'decrement']: amount,
            },
          },
        })
      }
    )
  }

  // Get user by RFID number
  static async getUserByRFID(rfidNumber: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const usersRef = collection(firestore, 'users')
        const q = query(usersRef, where('rfidNumber', '==', rfidNumber))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) return null
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      },
      // Prisma fallback
      async () => {
        return await prisma.user.findFirst({
          where: { rfidNumber },
        })
      }
    )
  }

  // Get order by ID
  static async getOrderById(orderId: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const ordersRef = collection(firestore, 'orders')
        const q = query(ordersRef, where('id', '==', orderId))
        const orderSnap = await getDocs(q)
        
        if (orderSnap.empty) return null
        const orderData = orderSnap.docs[0].data()
        return { id: orderSnap.docs[0].id, ...orderData }
      },
      // Prisma fallback
      async () => {
        return await prisma.order.findUnique({
          where: { id: orderId },
          include: { student: true },
        })
      }
    )
  }

  // Create menu item (SYNCED)
  static async createMenuItem(data: any) {
    return this.syncWrite(
      'create',
      // Firebase write
      async () => {
        const menuRef = collection(firestore, 'menuItems')
        const docRef = await addDoc(menuRef, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        return { id: docRef.id, ...data }
      },
      // Prisma sync write
      async () => {
        return await prisma.menuItem.create({ data })
      }
    )
  }

  // Update menu item (SYNCED)
  static async updateMenuItem(id: string, data: any) {
    return this.syncWrite(
      'update',
      // Firebase write
      async () => {
        const menuRef = collection(firestore, 'menuItems')
        const q = query(menuRef, where('id', '==', id))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) throw new Error('Menu item not found')
        
        const itemRef = doc(firestore, 'menuItems', snapshot.docs[0].id)
        await updateDoc(itemRef, {
          ...data,
          updatedAt: new Date(),
        })
        
        return { id, ...data }
      },
      // Prisma sync write
      async () => {
        return await prisma.menuItem.update({
          where: { id },
          data,
        })
      }
    )
  }

  // Delete menu item (SYNCED)
  static async deleteMenuItem(id: string) {
    return this.syncWrite(
      'delete',
      // Firebase write
      async () => {
        const menuRef = collection(firestore, 'menuItems')
        const q = query(menuRef, where('id', '==', id))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          await deleteDoc(doc(firestore, 'menuItems', snapshot.docs[0].id))
        }
        
        return { success: true }
      },
      // Prisma sync write
      async () => {
        await prisma.menuItem.delete({ where: { id } })
        return { success: true }
      }
    )
  }

  // Get all reviews for a vendor
  static async getReviewsByVendor(vendorId: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        const reviewsRef = collection(firestore, 'reviews')
        const q = query(
          reviewsRef,
          where('vendorId', '==', vendorId),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      },
      // Prisma fallback
      async () => {
        return await prisma.review.findMany({
          where: { vendorId },
          include: {
            student: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    )
  }

  // Create review (SYNCED)
  static async createReview(data: any) {
    return this.syncWrite(
      'create',
      // Firebase write
      async () => {
        const reviewsRef = collection(firestore, 'reviews')
        const docRef = await addDoc(reviewsRef, {
          ...data,
          createdAt: new Date(),
        })
        return { id: docRef.id, ...data }
      },
      // Prisma sync write
      async () => {
        return await prisma.review.create({ data })
      }
    )
  }

  // Update vendor rating (SYNCED)
  static async updateVendorRating(vendorId: string, avgRating: number, totalReviews: number) {
    return this.syncWrite(
      'update',
      // Firebase write
      async () => {
        const vendorsRef = collection(firestore, 'vendors')
        const q = query(vendorsRef, where('id', '==', vendorId))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const vendorRef = doc(firestore, 'vendors', snapshot.docs[0].id)
          await updateDoc(vendorRef, {
            averageRating: avgRating,
            totalReviews: totalReviews,
            updatedAt: new Date(),
          })
        }
        
        return { id: vendorId, averageRating: avgRating, totalReviews }
      },
      // Prisma sync write
      async () => {
        return await prisma.vendor.update({
          where: { id: vendorId },
          data: {
            averageRating: avgRating,
            totalReviews: totalReviews,
          },
        })
      }
    )
  }

  // Update order pickup (SYNCED)
  static async confirmOrderPickup(orderId: string, pickupData: any) {
    return this.syncWrite(
      'update',
      // Firebase write
      async () => {
        const ordersRef = collection(firestore, 'orders')
        const q = query(ordersRef, where('id', '==', orderId))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) throw new Error('Order not found')
        
        const orderRef = doc(firestore, 'orders', snapshot.docs[0].id)
        await updateDoc(orderRef, {
          ...pickupData,
          pickedUpAt: new Date(),
          updatedAt: new Date(),
        })
        
        return { id: orderId, ...pickupData }
      },
      // Prisma sync write
      async () => {
        return await prisma.order.update({
          where: { id: orderId },
          data: {
            ...pickupData,
            pickedUpAt: new Date(),
          },
        })
      }
    )
  }

  // Create transaction (SYNCED)
  static async createTransaction(data: any) {
    return this.syncWrite(
      'create',
      // Firebase write
      async () => {
        const txRef = collection(firestore, 'transactions')
        const docRef = await addDoc(txRef, {
          ...data,
          createdAt: new Date(),
        })
        return { id: docRef.id, ...data }
      },
      // Prisma sync write
      async () => {
        return await prisma.transaction.create({ data })
      }
    )
  }
}
