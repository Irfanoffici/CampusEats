import { prisma } from './prisma'
import { db as firestore } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { createServerComponentClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

// Check if Firebase is properly initialized
const isFirebaseAvailable = firestore !== undefined

// Database service with correct priority: Firebase (if available) → Supabase → Prisma/SQLite → localDB
export class DatabaseService {
  private static syncEnabled = isFirebaseAvailable

  // Execute query with correct priority order: Firebase > Supabase > Prisma > localDB
  static async executeQuery<T>(
    firebaseQuery: () => Promise<T>,
    supabaseQuery: () => Promise<T>,
    prismaQuery: () => Promise<T>,
    localDBQuery?: () => Promise<T>
  ): Promise<T> {
    // PRIMARY: Firebase (if available)
    if (isFirebaseAvailable && firestore) {
      try {
        console.log('[DB-Service] Executing on Firebase (PRIMARY)...')
        const firebaseData = await firebaseQuery()
        console.log('[DB-Service] ✅ Successfully read from Firebase')
        return firebaseData
      } catch (error) {
        console.error('[DB-Service] Firebase failed, falling back to Supabase:', error)
      }
    }
    
    // SECONDARY: Supabase
    try {
      console.log('[DB-Service] Executing on Supabase (SECONDARY)...')
      const supabaseData = await supabaseQuery()
      console.log('[DB-Service] ✅ Successfully read from Supabase')
      return supabaseData
    } catch (error) {
      console.error('[DB-Service] Supabase failed, falling back to Prisma:', error)
    }
    
    // TERTIARY: Prisma/SQLite
    try {
      console.log('[DB-Service] Executing on Prisma/SQLite (TERTIARY)...')
      const prismaData = await prismaQuery()
      console.log('[DB-Service] ✅ Successfully read from Prisma/SQLite')
      return prismaData
    } catch (error) {
      console.error('[DB-Service] Prisma/SQLite failed:', error)
      
      // QUATERNARY: localDB (if provided)
      if (localDBQuery) {
        try {
          console.log('[DB-Service] Executing on localDB (QUATERNARY)...')
          const localData = await localDBQuery()
          console.log('[DB-Service] ✅ Successfully read from localDB')
          return localData
        } catch (localError) {
          console.error('[DB-Service] localDB also failed:', localError)
        }
      }
      
      throw error // If all databases fail, throw the error
    }
  }

  // Write with sync following correct priority order: Firebase > Supabase > Prisma > localDB
  static async syncWrite<T>(
    operation: 'create' | 'update' | 'delete',
    firebaseWrite: () => Promise<T>,
    supabaseWrite: () => Promise<T>,
    prismaWrite: () => Promise<T>,
    localDBWrite?: () => Promise<T>
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
        // If Firebase fails, fallback to Supabase as primary
        try {
          console.log(`[DB-Sync] Falling back to Supabase for ${operation}...`)
          primaryResult = await supabaseWrite()
          console.log(`[DB-Sync] ✅ Supabase ${operation} succeeded as fallback`)
          return primaryResult
        } catch (supabaseError) {
          console.error(`[DB-Sync] ❌ Supabase ${operation} also failed:`, supabaseError)
          // If Supabase fails, fallback to Prisma as primary
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
      }
    } else {
      // If Firebase not available, try Supabase as primary
      try {
        console.log(`[DB-Sync] ${operation.toUpperCase()} on Supabase (PRIMARY)...`)
        primaryResult = await supabaseWrite()
        console.log(`[DB-Sync] ✅ Supabase ${operation} succeeded`)
      } catch (error) {
        console.error(`[DB-Sync] ❌ Supabase ${operation} failed:`, error)
        // If Supabase fails, fallback to Prisma as primary
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
    }

    // SYNC: Supabase write (background sync) only if Firebase was successful
    if (isFirebaseAvailable && firestore) {
      supabaseWrite()
        .then(() => console.log(`[DB-Sync] ✅ Supabase ${operation} synced`))
        .catch(err => console.error(`[DB-Sync] ⚠️ Supabase sync failed (non-critical):`, err))
    }

    // SYNC: Prisma write (background sync) only if Firebase/Supabase was successful
    if (isFirebaseAvailable && firestore) {
      prismaWrite()
        .then(() => console.log(`[DB-Sync] ✅ Prisma ${operation} synced`))
        .catch(err => console.error(`[DB-Sync] ⚠️ Prisma sync failed (non-critical):`, err))
    } else if (firestore) {
      // If only Supabase was successful, sync to Prisma
      prismaWrite()
        .then(() => console.log(`[DB-Sync] ✅ Prisma ${operation} synced`))
        .catch(err => console.error(`[DB-Sync] ⚠️ Prisma sync failed (non-critical):`, err))
    }

    // SYNC: localDB write (background sync) if available
    if (localDBWrite) {
      localDBWrite()
        .then(() => console.log(`[DB-Sync] ✅ localDB ${operation} synced`))
        .catch(err => console.error(`[DB-Sync] ⚠️ localDB sync failed (non-critical):`, err))
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
        // Supabase fallback (SECONDARY)
        async () => {
          console.log(`[DB-Service] Supabase: Fetching orders for user ${userId} with role ${role}`)
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            let queryResult
            if (role === 'STUDENT') {
              queryResult = await supabase
                .from('orders')
                .select('*, vendor (*)')
                .eq('studentId', userId)
                .order('createdAt', { ascending: false })
            } else if (role === 'VENDOR') {
              // Get vendor ID from users table
              const { data: userData } = await supabase
                .from('users')
                .select('vendorId')
                .eq('id', userId)
                .single()
              
              if (!userData?.vendorId) return []
              
              queryResult = await supabase
                .from('orders')
                .select('*, student (fullName, phoneNumber)')
                .eq('vendorId', userData.vendorId)
                .order('createdAt', { ascending: false })
            } else if (role === 'ADMIN') {
              queryResult = await supabase
                .from('orders')
                .select('*, vendor (*), student (fullName, phoneNumber)')
                .order('createdAt', { ascending: false })
            } else {
              return []
            }
            
            if (queryResult.error) throw queryResult.error
            return queryResult.data || []
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma fallback (TERTIARY)
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
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          console.log(`[DB-Service] NetlifyDB Fallback: Fetching orders for user ${userId} with role ${role}`)
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          console.log(`[DB-Service] Supabase: Fetching orders for user ${userId} with role ${role}`)
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            let queryResult
            if (role === 'STUDENT') {
              queryResult = await supabase
                .from('orders')
                .select('*, vendor (*)')
                .eq('studentId', userId)
                .order('createdAt', { ascending: false })
            } else if (role === 'VENDOR') {
              // Get vendor ID from users table
              const { data: userData } = await supabase
                .from('users')
                .select('vendorId')
                .eq('id', userId)
                .single()
              
              if (!userData?.vendorId) return []
              
              queryResult = await supabase
                .from('orders')
                .select('*, student (fullName, phoneNumber)')
                .eq('vendorId', userData.vendorId)
                .order('createdAt', { ascending: false })
            } else if (role === 'ADMIN') {
              queryResult = await supabase
                .from('orders')
                .select('*, vendor (*), student (fullName, phoneNumber)')
                .order('createdAt', { ascending: false })
            } else {
              return []
            }
            
            if (queryResult.error) throw queryResult.error
            return queryResult.data || []
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma (SECONDARY)
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
        // NetlifyDB fallback (TERTIARY) - placeholder
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('orders')
            .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma sync write (TERTIARY)
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
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'create',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('orders')
            .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma write (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .update({ orderStatus: status, updatedAt: new Date() })
            .eq('id', orderId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
          })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, orderStatus: status }
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'update',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .update({ orderStatus: status, updatedAt: new Date() })
            .eq('id', orderId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma write (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .update({ orderStatus, paymentStatus, updatedAt: new Date() })
            .eq('id', orderId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus, paymentStatus },
          })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, orderStatus, paymentStatus }
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'update',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .update({ orderStatus, paymentStatus, updatedAt: new Date() })
            .eq('id', orderId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma write (SECONDARY)
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
        // Supabase fallback (SECONDARY)
        async () => {
          console.log(`[DB-Service] Supabase: Fetching user with vendor for user ${userId}`)
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            const { data: user, error } = await supabase
              .from('users')
              .select('*, vendor (*)')
              .eq('id', userId)
              .single()
            
            if (error) throw error
            return user
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma fallback (TERTIARY)
        async () => {
          console.log(`[DB-Service] Prisma: Fetching user with vendor for user ${userId}`)
          return await prisma.user.findUnique({
            where: { id: userId },
            include: { vendor: true }
          })
        },
        // localDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for localDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          console.log(`[DB-Service] Supabase: Fetching user with vendor for user ${userId}`)
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            const { data: user, error } = await supabase
              .from('users')
              .select('*, vendor (*)')
              .eq('id', userId)
              .single()
            
            if (error) throw error
            return user
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma (SECONDARY)
        async () => {
          console.log(`[DB-Service] Prisma: Fetching user with vendor for user ${userId} (primary)`)
          return await prisma.user.findUnique({
            where: { id: userId },
            include: { vendor: true }
          })
        },
        // localDB fallback (TERTIARY) - placeholder
        async () => {
          // Placeholder for localDB implementation
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
        // Supabase fallback (SECONDARY)
        async () => {
          console.log(`[DB-Service] Supabase: Fetching menu items for vendor ${vendorId}`)
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            const { data, error } = await supabase
              .from('menuItems')
              .select('*')
              .eq('vendorId', vendorId)
              .eq('isAvailable', true)
              .order('category', { ascending: true })
            
            if (error) throw error
            console.log(`[DB-Service] Supabase: Found ${data?.length || 0} menu items`)
            return data || []
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma fallback (TERTIARY)
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
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          console.log(`[DB-Service] Supabase: Fetching menu items for vendor ${vendorId}`)
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            const { data, error } = await supabase
              .from('menuItems')
              .select('*')
              .eq('vendorId', vendorId)
              .eq('isAvailable', true)
              .order('category', { ascending: true })
            
            if (error) throw error
            console.log(`[DB-Service] Supabase: Found ${data?.length || 0} menu items`)
            return data || []
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma (SECONDARY)
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
        // NetlifyDB fallback (TERTIARY) - placeholder
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
        // Supabase fallback (SECONDARY)
        async () => {
          console.log('[DB-Service] Supabase: Fetching active vendors')
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            const { data, error } = await supabase
              .from('vendors')
              .select('*, user (fullName, phoneNumber)')
              .eq('isActive', true)
              .order('averageRating', { ascending: false })
            
            if (error) throw error
            return data || []
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma fallback (TERTIARY)
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
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          console.log('[DB-Service] Supabase: Fetching active vendors')
          try {
            const cookieStore = cookies()
            const supabase = createServerComponentClient(cookieStore)
            
            const { data, error } = await supabase
              .from('vendors')
              .select('*, user (fullName, phoneNumber)')
              .eq('isActive', true)
              .order('averageRating', { ascending: false })
            
            if (error) throw error
            return data || []
          } catch (error) {
            console.log('[DB-Service] Supabase: Database not available, falling back to Prisma')
            throw error
          }
        },
        // Prisma (SECONDARY)
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
        // NetlifyDB fallback (TERTIARY) - placeholder
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
        // Supabase fallback (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .select('id, email, fullName, role, phoneNumber, rfidNumber, rfidBalance, createdAt')
            .order('createdAt', { ascending: false })
          
          if (error) throw error
          return data || []
        },
        // Prisma fallback (TERTIARY)
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
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .select('id, email, fullName, role, phoneNumber, rfidNumber, rfidBalance, createdAt')
            .order('createdAt', { ascending: false })
          
          if (error) throw error
          return data || []
        },
        // Prisma (SECONDARY)
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
        // Supabase fallback (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .select('rfidBalance, rfidNumber')
            .eq('id', userId)
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma fallback (TERTIARY)
        async () => {
          return await prisma.user.findUnique({
            where: { id: userId },
            select: { rfidBalance: true, rfidNumber: true },
          })
        },
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .select('rfidBalance, rfidNumber')
            .eq('id', userId)
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .update({ 
              rfidBalance: isCredit ? { increment: amount } : { decrement: amount },
              updatedAt: new Date()
            })
            .eq('id', userId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma sync write (TERTIARY)
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
        // NetlifyDB sync write (QUATERNARY) - placeholder
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
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'update',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .update({ 
              rfidBalance: isCredit ? { increment: amount } : { decrement: amount },
              updatedAt: new Date()
            })
            .eq('id', userId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma write (SECONDARY)
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
        // Supabase fallback (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('rfidNumber', rfidNumber)
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma fallback (TERTIARY)
        async () => {
          return await prisma.user.findFirst({
            where: { rfidNumber },
          })
        },
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('rfidNumber', rfidNumber)
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma (SECONDARY)
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
        // Supabase fallback (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .select('*, student (*)')
            .eq('id', orderId)
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma fallback (TERTIARY)
        async () => {
          return await prisma.order.findUnique({
            where: { id: orderId },
            include: { student: true },
          })
        },
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return null
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .select('*, student (*)')
            .eq('id', orderId)
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('menuItems')
            .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.menuItem.create({ data })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'create',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('menuItems')
            .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma write (SECONDARY)
        async () => {
          return await prisma.menuItem.create({ data })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('menuItems')
            .update({ ...data, updatedAt: new Date() })
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.menuItem.update({
            where: { id },
            data,
          })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id, ...data }
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'update',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('menuItems')
            .update({ ...data, updatedAt: new Date() })
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma write (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { error } = await supabase
            .from('menuItems')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          return { success: true }
        },
        // Prisma sync write (TERTIARY)
        async () => {
          await prisma.menuItem.delete({ where: { id } })
          return { success: true }
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { success: true }
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'delete',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { error } = await supabase
            .from('menuItems')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          return { success: true }
        },
        // Prisma write (SECONDARY)
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
        // Supabase fallback (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('reviews')
            .select('*, student (fullName)')
            .eq('vendorId', vendorId)
            .order('createdAt', { ascending: false })
          
          if (error) throw error
          return data || []
        },
        // Prisma fallback (TERTIARY)
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
        // NetlifyDB fallback (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return []
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.executeQuery(
        // Supabase (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('reviews')
            .select('*, student (fullName)')
            .eq('vendorId', vendorId)
            .order('createdAt', { ascending: false })
          
          if (error) throw error
          return data || []
        },
        // Prisma (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('reviews')
            .insert([{ ...data, createdAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.review.create({ data })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'create',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('reviews')
            .insert([{ ...data, createdAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma write (SECONDARY)
        async () => {
          return await prisma.review.create({ data })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('vendors')
            .update({ 
              averageRating: avgRating, 
              totalReviews: totalReviews,
              updatedAt: new Date()
            })
            .eq('id', vendorId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.vendor.update({
            where: { id: vendorId },
            data: {
              averageRating: avgRating,
              totalReviews: totalReviews,
            },
          })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: vendorId, averageRating: avgRating, totalReviews }
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'update',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('vendors')
            .update({ 
              averageRating: avgRating, 
              totalReviews: totalReviews,
              updatedAt: new Date()
            })
            .eq('id', vendorId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma write (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .update({ 
              ...pickupData,
              pickedUpAt: new Date(),
              updatedAt: new Date()
            })
            .eq('id', orderId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.order.update({
            where: { id: orderId },
            data: {
              ...pickupData,
              pickedUpAt: new Date(),
            },
          })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return { id: orderId, ...pickupData }
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'update',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data, error } = await supabase
            .from('orders')
            .update({ 
              ...pickupData,
              pickedUpAt: new Date(),
              updatedAt: new Date()
            })
            .eq('id', orderId)
            .select()
            .single()
          
          if (error) throw error
          return data
        },
        // Prisma write (SECONDARY)
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
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('transactions')
            .insert([{ ...data, createdAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma sync write (TERTIARY)
        async () => {
          return await prisma.transaction.create({ data })
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'create',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('transactions')
            .insert([{ ...data, createdAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma write (SECONDARY)
        async () => {
          return await prisma.transaction.create({ data })
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    }
  }

  // Create group order (SYNCED)
  static async createGroupOrder(data: any) {
    if (isFirebaseAvailable && firestore) {
      return this.syncWrite(
        'create',
        // Firebase write (PRIMARY)
        async () => {
          const groupOrdersRef = collection(firestore!, 'groupOrders')
          const docRef = await addDoc(groupOrdersRef, {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          return { id: docRef.id, ...data }
        },
        // Supabase sync write (SECONDARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('groupOrders')
            .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma sync write (TERTIARY)
        async () => {
          // Create the group order in Prisma
          const groupOrder = await prisma.groupOrder.create({
            data: {
              creatorId: data.creatorId,
              shareLink: data.shareLink,
              vendorId: data.vendorId,
              isFinalized: data.isFinalized || false,
              participantCount: data.participantCount || 1,
              splitType: data.splitType,
              expiresAt: data.expiresAt,
            }
          })
          
          return groupOrder
        },
        // NetlifyDB sync write (QUATERNARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    } else {
      // Firebase not available, try Supabase as primary
      return this.syncWrite(
        'create',
        // Supabase write (PRIMARY)
        async () => {
          const cookieStore = cookies()
          const supabase = createServerComponentClient(cookieStore)
          
          const { data: supabaseData, error } = await supabase
            .from('groupOrders')
            .insert([{ ...data, createdAt: new Date(), updatedAt: new Date() }])
            .select()
            .single()
          
          if (error) throw error
          return supabaseData
        },
        // Prisma write (SECONDARY)
        async () => {
          const groupOrder = await prisma.groupOrder.create({
            data: {
              creatorId: data.creatorId,
              shareLink: data.shareLink,
              vendorId: data.vendorId,
              isFinalized: data.isFinalized || false,
              participantCount: data.participantCount || 1,
              splitType: data.splitType,
              expiresAt: data.expiresAt,
            }
          })
          
          return groupOrder
        },
        // NetlifyDB sync write (TERTIARY) - placeholder
        async () => {
          // Placeholder for NetlifyDB implementation
          return data
        }
      )
    }
  }

  static async getGroupOrders(userId: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        console.log(`[DB-Service] Firebase: Fetching group orders for user ${userId}`)
        if (!isFirebaseAvailable || !firestore) {
          throw new Error('Firebase not available')
        }
        
        const groupOrdersRef = collection(firestore!, 'groupOrders')
        const q = query(
          groupOrdersRef,
          where('creatorId', '==', userId),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        
        const groupOrders = []
        for (const doc of snapshot.docs) {
          const data = doc.data()
          // Get vendor details
          if (data.vendorId) {
            const vendorsRef = collection(firestore!, 'vendors')
            const vendorQuery = query(vendorsRef, where('id', '==', data.vendorId))
            const vendorSnapshot = await getDocs(vendorQuery)
            if (!vendorSnapshot.empty) {
              data.vendor = { id: vendorSnapshot.docs[0].id, ...vendorSnapshot.docs[0].data() }
            }
          }
          groupOrders.push({ id: doc.id, ...data })
        }
        
        return groupOrders
      },
      // Supabase fallback (SECONDARY)
      async () => {
        console.log(`[DB-Service] Supabase: Fetching group orders for user ${userId}`)
        const cookieStore = cookies()
        const supabase = createServerComponentClient(cookieStore)
        
        const { data, error } = await supabase
          .from('groupOrders')
          .select('*, vendor (*)')
          .eq('creatorId', userId)
          .order('createdAt', { ascending: false })
        
        if (error) throw error
        return data || []
      },
      // Prisma fallback (TERTIARY)
      async () => {
        console.log(`[DB-Service] Prisma: Fetching group orders for user ${userId}`)
        return await prisma.groupOrder.findMany({
          where: { creatorId: userId },
          include: {
            creator: true,
            orders: true
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    )
  }
  
  // Get group order by ID
  static async getGroupOrderById(id: string) {
    return this.executeQuery(
      // Firebase (PRIMARY)
      async () => {
        console.log(`[DB-Service] Firebase: Fetching group order by id ${id}`)
        if (!isFirebaseAvailable || !firestore) {
          throw new Error('Firebase not available')
        }
        
        const groupOrdersRef = collection(firestore!, 'groupOrders')
        const q = query(groupOrdersRef, where('id', '==', id))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) return null
        
        const data = snapshot.docs[0].data()
        // Get vendor details
        if (data.vendorId) {
          const vendorsRef = collection(firestore!, 'vendors')
          const vendorQuery = query(vendorsRef, where('id', '==', data.vendorId))
          const vendorSnapshot = await getDocs(vendorQuery)
          if (!vendorSnapshot.empty) {
            data.vendor = { id: vendorSnapshot.docs[0].id, ...vendorSnapshot.docs[0].data() }
          }
        }
        
        return { id: snapshot.docs[0].id, ...data }
      },
      // Supabase fallback (SECONDARY)
      async () => {
        console.log(`[DB-Service] Supabase: Fetching group order by id ${id}`)
        const cookieStore = cookies()
        const supabase = createServerComponentClient(cookieStore)
        
        const { data, error } = await supabase
          .from('groupOrders')
          .select('*, vendor (*)')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data
      },
      // Prisma fallback (TERTIARY)
      async () => {
        console.log(`[DB-Service] Prisma: Fetching group order by id ${id}`)
        return await prisma.groupOrder.findUnique({
          where: { id },
          include: {
            creator: true,
            orders: true
          },
        })
      }
    )
  }
}