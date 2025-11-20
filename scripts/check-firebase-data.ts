import { db as firestore } from '../lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

async function checkFirebaseData() {
  console.log('🔍 Checking Firebase Data...')
  
  if (!firestore) {
    console.log('❌ Firebase not initialized')
    return
  }
  
  try {
    // Check users
    console.log('\n👥 Users:')
    const usersRef = collection(firestore, 'users')
    const usersSnapshot = await getDocs(usersRef)
    console.log(`  Found ${usersSnapshot.docs.length} users`)
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log(`  - ${data.email} (${data.role})`)
    })
    
    // Check vendors
    console.log('\n🏪 Vendors:')
    const vendorsRef = collection(firestore, 'vendors')
    const vendorsSnapshot = await getDocs(vendorsRef)
    console.log(`  Found ${vendorsSnapshot.docs.length} vendors`)
    vendorsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log(`  - ${data.shopName} (ID: ${doc.id})`)
    })
    
    // Check menu items
    console.log('\n🍽️ Menu Items:')
    const menuItemsRef = collection(firestore, 'menuItems')
    const menuItemsSnapshot = await getDocs(menuItemsRef)
    console.log(`  Found ${menuItemsSnapshot.docs.length} menu items`)
    
    // Check if there are menu items for each vendor
    const vendorIds = vendorsSnapshot.docs.map(doc => doc.id)
    for (const vendorId of vendorIds) {
      const vendorMenuQuery = query(
        collection(firestore, 'menuItems'),
        where('vendorId', '==', vendorId)
      )
      const vendorMenuSnapshot = await getDocs(vendorMenuQuery)
      console.log(`  Vendor ${vendorId} has ${vendorMenuSnapshot.docs.length} menu items`)
    }
    
    console.log('\n✅ Data check complete!')
  } catch (error) {
    console.error('❌ Error checking Firebase data:', error)
  }
}

checkFirebaseData()
  .catch(console.error)
  .finally(() => process.exit(0))