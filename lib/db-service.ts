import { prisma } from './prisma'
import { db as firestore } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'

// Database service with Prisma primary and Firebase fallback
export class DatabaseService {
  private static usePrisma = true

  // Try Prisma first, fallback to Firebase
  static async executeQuery<T>(
    prismaQuery: () => Promise<T>,
    firebaseQuery?: () => Promise<T>
  ): Promise<T> {
    try {
      if (this.usePrisma) {
        return await prismaQuery()
      }
    } catch (error) {
      console.error('Prisma query failed, trying Firebase fallback:', error)
      this.usePrisma = false
      
      if (firebaseQuery) {
        try {
          return await firebaseQuery()
        } catch (fbError) {
          console.error('Firebase fallback also failed:', fbError)
          throw fbError
        }
      }
      throw error
    }

    // If Prisma is disabled and Firebase query exists
    if (firebaseQuery) {
      return await firebaseQuery()
    }

    throw new Error('No database available')
  }

  // Get orders
  static async getOrders(userId: string, role: string) {
    return this.executeQuery(
      // Prisma query
      async () => {
        console.log(`[DB-Service] Fetching orders for user ${userId} with role ${role}`)
        
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
      },
      // Firebase fallback
      async () => {
        console.log('[DB-Service] Using Firebase fallback')
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
        } else {
          q = query(ordersRef, orderBy('createdAt', 'desc'))
        }
        
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
    )
  }

  // Create order
  static async createOrder(data: any) {
    return this.executeQuery(
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

  // Update order status
  static async updateOrderStatus(orderId: string, status: string) {
    return this.executeQuery(
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
