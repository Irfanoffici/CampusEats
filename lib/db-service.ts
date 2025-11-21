import { prisma } from './prisma'
import { db as firestore } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'

// Check if Firebase is properly initialized
const isFirebaseAvailable = firestore !== undefined

// Database service with new priority: Firebase (if available) → Prisma/SQLite → NetlifyDB (placeholder)
export class DatabaseService {
  private static syncEnabled = isFirebaseAvailable

  // Execute query with new priority order
  static async executeQuery<T>(
    firebaseQuery: () => Promise<T>,
    prismaQuery: () => Promise<T>,
    netlifyQuery?: () => Promise<T>
  ): Promise<T> {
    // PRIMARY: Firebase (if available)
    if (isFirebaseAvailable && firestore) {
      try {
        console.log('[DB-Service] Executing on Firebase (PRIMARY)...')
        const firebaseData = await firebaseQuery()
        console.log('[DB-Service] ✅ Successfully read from Firebase')
        return firebaseData
      } catch (error) {
        console.error('[DB-Service] Firebase failed, falling back to Prisma:', error)
      }
    }
    
    // SECONDARY: Prisma/SQLite
    try {
      console.log('[DB-Service] Executing on Prisma/SQLite (SECONDARY)...')
      const prismaData = await prismaQuery()
      console.log('[DB-Service] ✅ Successfully read from Prisma/SQLite')
      return prismaData
    } catch (error) {
      console.error('[DB-Service] Prisma/SQLite failed:', error)
      
      // TERTIARY: NetlifyDB (if provided)
      if (netlifyQuery) {
        try {
          console.log('[DB-Service] Executing on NetlifyDB (TERTIARY)...')
          const netlifyData = await netlifyQuery()
          console.log('[DB-Service] ✅ Successfully read from NetlifyDB')
          return netlifyData
        } catch (netlifyError) {
          console.error('[DB-Service] NetlifyDB also failed:', netlifyError)
        }
      }
      
      throw error // If all databases fail, throw the error
    }
  }

  // Write with sync following new priority order
  static async syncWrite<T>(
    operation: 'create' | 'update' | 'delete',
    firebaseWrite: () => Promise<T>,
    prismaWrite: () => Promise<T>,
    netlifyWrite?: () => Promise<T>
  ): Promise<T> {
    let primaryResult: T | null = null

    // PRIMARY: Firebase write (if available)
    if (isFirebaseAvailable && firestore) {
      try {
        console.log(`[DB-Sync] ${operation.toUpperCase()} on Firebase (PRIMARY)...`)
        primaryResult = await firebaseWrite()
        console.log(`[DB-Sync] ✅ Firebase ${operation} succeeded`)
      } catch (error) {
        console.error(`[DB-Sync] ❌ Firebase ${operation} failed:`, error)
        // If Firebase fails, fallback to Prisma as primary
        try {
          console.log(`[DB-Sync] Falling back to Prisma for ${operation}...`)
          primaryResult = await prismaWrite()
          console.log(`[DB-Sync] ✅ Prisma ${operation} succeeded as fallback`)
          return primaryResult
        } catch (prismaError) {
          console.error(`[DB-Sync] ❌ Prisma ${operation} also failed:`, prismaError)
          throw prismaError // Both failed
        }
      }
    } else {
      // If Firebase not available, Prisma is primary
      try {
        console.log(`[DB-Sync] ${operation.toUpperCase()} on Prisma (PRIMARY)...`)
        primaryResult = await prismaWrite()
        console.log(`[DB-Sync] ✅ Prisma ${operation} succeeded`)
      } catch (error) {
        console.error(`[DB-Sync] ❌ Prisma ${operation} failed:`, error)
        throw error // Critical failure
      }
    }

    // SYNC: Prisma write (background sync) only if Firebase was successful
    if (isFirebaseAvailable && firestore && this.syncEnabled) {
      prismaWrite()
        .then(() => console.log(`[DB-Sync] ✅ Prisma ${operation} synced`))
        .catch(err => console.error(`[DB-Sync] ⚠️ Prisma sync failed (non-critical):`, err))
    }

    return primaryResult!
  }

  // Get orders
  static async getOrders(userId: string, role: string) {
    // Firebase is primary
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase query (PRIMARY)
        async () => {
          console.log(`[DB-Service] Firebase: Fetching orders for user ${userId} with role ${role}`)
          const ordersRef = collection(firestore!, 'orders')
          let q
          
          if (role === 'STUDENT') {
            q = query(ordersRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'))
          } else if (role === 'VENDOR') {
            // Get vendor ID from users collection
            const usersRef = collection(firestore!, 'users')
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
                const studentsRef = collection(firestore!, 'users')
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
                const vendorsRef = collection(firestore!, 'vendors')
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
          
          try {
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
          } catch (error) {
            console.log('[DB-Service] Prisma: Database not available, returning empty array')
            return []
          }
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          console.log(`[DB-Service] NetlifyDB Fallback: Fetching orders for user ${userId} with role ${role}`)
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
        async () => {
          console.log(`[DB-Service] Prisma: Fetching orders for user ${userId} with role ${role}`)
          
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
            
            if (!user?.vendor) {
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
        // Secondary fallback would be NetlifyDB if implemented
        async () => {
          console.log(`[DB-Service] NetlifyDB Fallback: Fetching orders for user ${userId} with role ${role}`)
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    }
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

    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'create',
        // Firebase write (PRIMARY)
        async () => {
          const ordersRef = collection(firestore!, 'orders')
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
        // Prisma sync write (SECONDARY)
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
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'create',
        // Prisma write (PRIMARY)
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
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    }
  }

  // Update order status (SYNCED across all DBs)
  static async updateOrderStatus(orderId: string, status: string) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'update',
        // Firebase write (PRIMARY)
        async () => {
          const ordersRef = collection(firestore!, 'orders')
          const q = query(ordersRef, where('id', '==', orderId))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) throw new Error('Order not found in Firebase')
          
          const orderDocRef = doc(firestore!, 'orders', snapshot.docs[0].id)
          await updateDoc(orderDocRef, {
            orderStatus: status,
            updatedAt: new Date(),
          })
          
          return { id: orderId, orderStatus: status }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
          })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, orderStatus: status }
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'update',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
          })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, orderStatus: status }
        }
      )
    }
  }

  // Update order status and payment status (SYNCED across all DBs)
  static async updateOrderStatusAndPayment(orderId: string, orderStatus: string, paymentStatus: string) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'update',
        // Firebase write (PRIMARY)
        async () => {
          const ordersRef = collection(firestore!, 'orders')
          const q = query(ordersRef, where('id', '==', orderId))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) throw new Error('Order not found in Firebase')
          
          const orderDocRef = doc(firestore!, 'orders', snapshot.docs[0].id)
          await updateDoc(orderDocRef, {
            orderStatus,
            paymentStatus,
            updatedAt: new Date(),
          })
          
          return { id: orderId, orderStatus, paymentStatus }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus, paymentStatus },
          })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, orderStatus, paymentStatus }
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'update',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus, paymentStatus },
          })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, orderStatus, paymentStatus }
        }
      )
    }
  }

  // Get user with vendor
  static async getUserWithVendor(userId: string) {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          console.log(`[DB-Service] Firebase: Fetching user with vendor for user ${userId}`)
          const usersRef = collection(firestore!, 'users')
          const q = query(usersRef, where('id', '==', userId))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) {
            console.log(`[DB-Service] Firebase: User ${userId} not found`)
            return null
          }
          
          const userData = snapshot.docs[0].data()
          console.log(`[DB-Service] Firebase: User data:`, userData)
          
          // Get vendor if exists
          if (userData.role === 'VENDOR') {
            console.log(`[DB-Service] Firebase: User is vendor, fetching vendor data`)
            const vendorsRef = collection(firestore!, 'vendors')
            const vendorQuery = query(vendorsRef, where('userId', '==', userId))
            const vendorSnap = await getDocs(vendorQuery)
            
            if (!vendorSnap.empty) {
              console.log(`[DB-Service] Firebase: Vendor found`)
              userData.vendor = { id: vendorSnap.docs[0].id, ...vendorSnap.docs[0].data() }
            } else {
              console.log(`[DB-Service] Firebase: No vendor found for user ${userId}`)
            }
          }
          
          const result = { id: snapshot.docs[0].id, ...userData }
          console.log(`[DB-Service] Firebase: Final user with vendor data:`, result)
          return result
        },
        // Prisma fallback (SECONDARY)
        async () => {
          console.log(`[DB-Service] Prisma: Fetching user with vendor for user ${userId}`)
          return await prisma.user.findUnique({
            where: { id: userId },
            include: { vendor: true }
          })
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
        async () => {
          console.log(`[DB-Service] Prisma: Fetching user with vendor for user ${userId} (primary)`)
          return await prisma.user.findUnique({
            where: { id: userId },
            include: { vendor: true }
          })
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    }
  }

  // Get menu items
  static async getMenuItems(vendorId: string) {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          console.log(`[DB-Service] Firebase: Fetching menu items for vendor ${vendorId}`)
          const menuRef = collection(firestore!, 'menuItems')
          const q = query(
            menuRef,
            where('vendorId', '==', vendorId),
            where('isAvailable', '==', true),
            orderBy('category', 'asc')
          )
          const snapshot = await getDocs(q)
          console.log(`[DB-Service] Firebase: Found ${snapshot.docs.length} menu items`)
          const menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          console.log('[DB-Service] Firebase: Menu items data:', menuItems)
          return menuItems
        },
        // Prisma fallback (SECONDARY)
        async () => {
          console.log(`[DB-Service] Prisma: Fetching menu items for vendor ${vendorId}`)
          return await prisma.menuItem.findMany({
            where: {
              vendorId,
              isAvailable: true,
            },
            orderBy: {
              category: 'asc',
            },
          })
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
        async () => {
          console.log(`[DB-Service] Prisma: Fetching menu items for vendor ${vendorId} (primary)`)
          return await prisma.menuItem.findMany({
            where: {
              vendorId,
              isAvailable: true,
            },
            orderBy: {
              category: 'asc',
            },
          })
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    }
  }

  // Get vendors
  static async getVendors() {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          console.log('[DB-Service] Firebase: Fetching active vendors')
          const vendorsRef = collection(firestore!, 'vendors')
          const q = query(
            vendorsRef,
            where('isActive', '==', true)
            // Removed orderBy to avoid composite index requirement
          )
          const snapshot = await getDocs(q)
          console.log(`[DB-Service] Firebase: Found ${snapshot.docs.length} vendors`)
          const vendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          console.log('[DB-Service] Firebase: Vendor data:', vendors)
          return vendors
        },
        // Prisma fallback (SECONDARY)
        async () => {
          console.log('[DB-Service] Prisma: Fetching active vendors')
          try {
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
          } catch (error) {
            console.log('[DB-Service] Prisma: Database not available, returning empty array')
            return []
          }
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
        async () => {
          console.log('[DB-Service] Prisma: Fetching active vendors (primary)')
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
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    }
  }

  // Get all users (Admin only)
  static async getAllUsers() {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          const usersRef = collection(firestore!, 'users')
          const q = query(usersRef, orderBy('createdAt', 'desc'))
          const snapshot = await getDocs(q)
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        },
        // Prisma fallback (SECONDARY)
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
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
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
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    }
  }

  // Get user balance
  static async getUserBalance(userId: string) {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          const usersRef = collection(firestore!, 'users')
          const q = query(usersRef, where('id', '==', userId))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) return null
          const userData = snapshot.docs[0].data()
          return {
            rfidBalance: userData.rfidBalance,
            rfidNumber: userData.rfidNumber,
          }
        },
        // Prisma fallback (SECONDARY)
        async () => {
          return await prisma.user.findUnique({
            where: { id: userId },
            select: { rfidBalance: true, rfidNumber: true },
          })
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
        async () => {
          return await prisma.user.findUnique({
            where: { id: userId },
            select: { rfidBalance: true, rfidNumber: true },
          })
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    }
  }

  // Update user RFID balance (SYNCED)
  static async updateUserBalance(userId: string, amount: number, isCredit: boolean = true) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'update',
        // Firebase write (PRIMARY)
        async () => {
          const usersRef = collection(firestore!, 'users')
          const q = query(usersRef, where('id', '==', userId))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) throw new Error('User not found')
          
          const userData = snapshot.docs[0].data()
          const currentBalance = userData.rfidBalance || 0
          const newBalance = isCredit ? currentBalance + amount : currentBalance - amount
          
          const userRef = doc(firestore!, 'users', snapshot.docs[0].id)
          await updateDoc(userRef, {
            rfidBalance: newBalance,
            updatedAt: new Date(),
          })
          
          return { ...userData, id: userId, rfidBalance: newBalance }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.user.update({
            where: { id: userId },
            data: {
              rfidBalance: {
                [isCredit ? 'increment' : 'decrement']: amount,
              },
            },
          })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { 
            id: userId, 
            rfidBalance: isCredit ? amount : -amount,
            email: '',
            passwordHash: '',
            role: '',
            fullName: '',
            phoneNumber: '',
            createdAt: new Date(),
            updatedAt: new Date()
          } as any
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'update',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.user.update({
            where: { id: userId },
            data: {
              rfidBalance: {
                [isCredit ? 'increment' : 'decrement']: amount,
              },
            },
          })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { 
            id: userId, 
            rfidBalance: isCredit ? amount : -amount,
            email: '',
            passwordHash: '',
            role: '',
            fullName: '',
            phoneNumber: '',
            createdAt: new Date(),
            updatedAt: new Date()
          } as any
        }
      )
    }
  }

  // Get user by RFID number
  static async getUserByRFID(rfidNumber: string) {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          const usersRef = collection(firestore!, 'users')
          const q = query(usersRef, where('rfidNumber', '==', rfidNumber))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) return null
          return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
        },
        // Prisma fallback (SECONDARY)
        async () => {
          return await prisma.user.findFirst({
            where: { rfidNumber },
          })
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
        async () => {
          return await prisma.user.findFirst({
            where: { rfidNumber },
          })
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string) {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          const ordersRef = collection(firestore!, 'orders')
          const q = query(ordersRef, where('id', '==', orderId))
          const orderSnap = await getDocs(q)
          
          if (orderSnap.empty) return null
          const orderData = orderSnap.docs[0].data()
          return { id: orderSnap.docs[0].id, ...orderData }
        },
        // Prisma fallback (SECONDARY)
        async () => {
          return await prisma.order.findUnique({
            where: { id: orderId },
            include: { student: true },
          })
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
        async () => {
          return await prisma.order.findUnique({
            where: { id: orderId },
            include: { student: true },
          })
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    }
  }

  // Create menu item (SYNCED)
  static async createMenuItem(data: any) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'create',
        // Firebase write (PRIMARY)
        async () => {
          const menuRef = collection(firestore!, 'menuItems')
          const docRef = await addDoc(menuRef, {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          return { id: docRef.id, ...data }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.menuItem.create({ data })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'create',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.menuItem.create({ data })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    }
  }

  // Update menu item (SYNCED)
  static async updateMenuItem(id: string, data: any) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'update',
        // Firebase write (PRIMARY)
        async () => {
          const menuRef = collection(firestore!, 'menuItems')
          const q = query(menuRef, where('id', '==', id))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) throw new Error('Menu item not found')
          
          const itemRef = doc(firestore!, 'menuItems', snapshot.docs[0].id)
          await updateDoc(itemRef, {
            ...data,
            updatedAt: new Date(),
          })
          
          return { id, ...data }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.menuItem.update({
            where: { id },
            data,
          })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id, ...data }
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'update',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.menuItem.update({
            where: { id },
            data,
          })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id, ...data }
        }
      )
    }
  }

  // Delete menu item (SYNCED)
  static async deleteMenuItem(id: string) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'delete',
        // Firebase write (PRIMARY)
        async () => {
          const menuRef = collection(firestore!, 'menuItems')
          const q = query(menuRef, where('id', '==', id))
          const snapshot = await getDocs(q)
          
          if (!snapshot.empty) {
            await deleteDoc(doc(firestore!, 'menuItems', snapshot.docs[0].id))
          }
          
          return { success: true }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          await prisma.menuItem.delete({ where: { id } })
          return { success: true }
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { success: true }
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'delete',
        // Prisma write (PRIMARY)
        async () => {
          await prisma.menuItem.delete({ where: { id } })
          return { success: true }
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { success: true }
        }
      )
    }
  }

  // Get all reviews for a vendor
  static async getReviewsByVendor(vendorId: string) {
    if (isFirebaseAvailable && firestore) {
      return this.executeQuery(
        // Firebase (PRIMARY)
        async () => {
          const reviewsRef = collection(firestore!, 'reviews')
          const q = query(
            reviewsRef,
            where('vendorId', '==', vendorId),
            orderBy('createdAt', 'desc')
          )
          const snapshot = await getDocs(q)
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        },
        // Prisma fallback (SECONDARY)
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
        },
        // NetlifyDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.executeQuery(
        // Prisma (PRIMARY)
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
        },
        // NetlifyDB fallback (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    }
  }

  // Create review (SYNCED)
  static async createReview(data: any) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'create',
        // Firebase write (PRIMARY)
        async () => {
          const reviewsRef = collection(firestore!, 'reviews')
          const docRef = await addDoc(reviewsRef, {
            ...data,
            createdAt: new Date(),
          })
          return { id: docRef.id, ...data }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.review.create({ data })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'create',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.review.create({ data })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    }
  }

  // Update vendor rating (SYNCED)
  static async updateVendorRating(vendorId: string, avgRating: number, totalReviews: number) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'update',
        // Firebase write (PRIMARY)
        async () => {
          const vendorsRef = collection(firestore!, 'vendors')
          const q = query(vendorsRef, where('id', '==', vendorId))
          const snapshot = await getDocs(q)
          
          if (!snapshot.empty) {
            const vendorRef = doc(firestore!, 'vendors', snapshot.docs[0].id)
            await updateDoc(vendorRef, {
              averageRating: avgRating,
              totalReviews: totalReviews,
              updatedAt: new Date(),
            })
          }
          
          return { id: vendorId, averageRating: avgRating, totalReviews }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.vendor.update({
            where: { id: vendorId },
            data: {
              averageRating: avgRating,
              totalReviews: totalReviews,
            },
          })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: vendorId, averageRating: avgRating, totalReviews }
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'update',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.vendor.update({
            where: { id: vendorId },
            data: {
              averageRating: avgRating,
              totalReviews: totalReviews,
            },
          })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: vendorId, averageRating: avgRating, totalReviews }
        }
      )
    }
  }

  // Update order pickup (SYNCED)
  static async confirmOrderPickup(orderId: string, pickupData: any) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'update',
        // Firebase write (PRIMARY)
        async () => {
          const ordersRef = collection(firestore!, 'orders')
          const q = query(ordersRef, where('id', '==', orderId))
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) throw new Error('Order not found')
          
          const orderRef = doc(firestore!, 'orders', snapshot.docs[0].id)
          await updateDoc(orderRef, {
            ...pickupData,
            pickedUpAt: new Date(),
            updatedAt: new Date(),
          })
          
          return { id: orderId, ...pickupData }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: {
              ...pickupData,
              pickedUpAt: new Date(),
            },
          })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, ...pickupData }
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'update',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: {
              ...pickupData,
              pickedUpAt: new Date(),
            },
          })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, ...pickupData }
        }
      )
    }
  }

  // Create transaction (SYNCED)
  static async createTransaction(data: any) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'create',
        // Firebase write (PRIMARY)
        async () => {
          const txRef = collection(firestore!, 'transactions')
          const docRef = await addDoc(txRef, {
            ...data,
            createdAt: new Date(),
          })
          return { id: docRef.id, ...data }
        },
        // Prisma sync write (SECONDARY)
        async () => {
          return await prisma.transaction.create({ data })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, use Prisma as primary
      return this.syncWrite(
        'create',
        // Prisma write (PRIMARY)
        async () => {
          return await prisma.transaction.create({ data })
        },
        // NetlifyDB sync write (SECONDARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    }
  }
}