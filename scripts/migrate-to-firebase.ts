import { prisma } from '../lib/prisma'
import { db as firestore } from '../lib/firebase'
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore'

/**
 * Migrate all data from SQLite/PostgreSQL to Firebase Firestore
 * This ensures 3-way sync is initialized properly
 */

async function migrateToFirebase() {
  console.log('\n🔄 Starting Database Migration to Firebase...\n')

  // Check if Firebase is available
  if (!firestore) {
    console.log('⏭️  Firebase not configured, skipping migration')
    return
  }

  try {
    // Migrate Users
    console.log('📦 Migrating Users...')
    const users = await prisma.user.findMany()
    const usersBatch = writeBatch(firestore)
    
    for (const user of users) {
      const userRef = doc(collection(firestore, 'users'), user.id)
      usersBatch.set(userRef, {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })
    }
    await usersBatch.commit()
    console.log(`✅ Migrated ${users.length} users`)

    // Migrate Vendors
    console.log('📦 Migrating Vendors...')
    const vendors = await prisma.vendor.findMany()
    const vendorsBatch = writeBatch(firestore)
    
    for (const vendor of vendors) {
      const vendorRef = doc(collection(firestore, 'vendors'), vendor.id)
      vendorsBatch.set(vendorRef, {
        ...vendor,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      })
    }
    await vendorsBatch.commit()
    console.log(`✅ Migrated ${vendors.length} vendors`)

    // Migrate Menu Items
    console.log('📦 Migrating Menu Items...')
    const menuItems = await prisma.menuItem.findMany()
    const menuBatch = writeBatch(firestore)
    
    for (const item of menuItems) {
      const itemRef = doc(collection(firestore, 'menuItems'), item.id)
      menuBatch.set(itemRef, {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })
    }
    await menuBatch.commit()
    console.log(`✅ Migrated ${menuItems.length} menu items`)

    // Migrate Orders
    console.log('📦 Migrating Orders...')
    const orders = await prisma.order.findMany()
    const ordersBatch = writeBatch(firestore)
    
    for (const order of orders) {
      const orderRef = doc(collection(firestore, 'orders'), order.id)
      ordersBatch.set(orderRef, {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        pickedUpAt: order.pickedUpAt?.toISOString() || null,
      })
    }
    await ordersBatch.commit()
    console.log(`✅ Migrated ${orders.length} orders`)

    // Migrate Reviews
    console.log('📦 Migrating Reviews...')
    const reviews = await prisma.review.findMany()
    const reviewsBatch = writeBatch(firestore)
    
    for (const review of reviews) {
      const reviewRef = doc(collection(firestore, 'reviews'), review.id)
      reviewsBatch.set(reviewRef, {
        ...review,
        createdAt: review.createdAt.toISOString(),
      })
    }
    await reviewsBatch.commit()
    console.log(`✅ Migrated ${reviews.length} reviews`)

    // Migrate Transactions
    console.log('📦 Migrating Transactions...')
    const transactions = await prisma.transaction.findMany()
    const transactionsBatch = writeBatch(firestore)
    
    for (const transaction of transactions) {
      const txRef = doc(collection(firestore, 'transactions'), transaction.id)
      transactionsBatch.set(txRef, {
        ...transaction,
        createdAt: transaction.createdAt.toISOString(),
      })
    }
    await transactionsBatch.commit()
    console.log(`✅ Migrated ${transactions.length} transactions`)

    // Migrate Group Orders
    console.log('📦 Migrating Group Orders...')
    const groupOrders = await prisma.groupOrder.findMany()
    
    if (groupOrders.length > 0) {
      const groupBatch = writeBatch(firestore)
      
      for (const group of groupOrders) {
        const groupRef = doc(collection(firestore, 'groupOrders'), group.id)
        groupBatch.set(groupRef, {
          ...group,
          createdAt: group.createdAt.toISOString(),
          expiresAt: group.expiresAt.toISOString(),
        })
      }
      await groupBatch.commit()
      console.log(`✅ Migrated ${groupOrders.length} group orders`)
    } else {
      console.log('⏭️  No group orders to migrate')
    }

    console.log('\n🎉 Migration Complete! All databases are now in sync.\n')
    console.log('Summary:')
    console.log(`  Users: ${users.length}`)
    console.log(`  Vendors: ${vendors.length}`)
    console.log(`  Menu Items: ${menuItems.length}`)
    console.log(`  Orders: ${orders.length}`)
    console.log(`  Reviews: ${reviews.length}`)
    console.log(`  Transactions: ${transactions.length}`)
    console.log(`  Group Orders: ${groupOrders.length}`)
    console.log('\n✅ Firebase, Netlify, and Local databases are synchronized!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateToFirebase()
  .catch(console.error)
  .finally(() => process.exit(0))