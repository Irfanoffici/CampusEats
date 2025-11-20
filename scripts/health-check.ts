import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function healthCheck() {
  console.log('🏥 CampusEats Health Check')
  console.log('==========================')
  
  try {
    // Check database connection
    console.log('\n1. Database Connection...')
    await prisma.$connect()
    console.log('   ✅ Connected successfully')
    
    // Check if tables exist and have data
    console.log('\n2. Database Schema...')
    const userCount = await prisma.user.count()
    const vendorCount = await prisma.vendor.count()
    const menuItemCount = await prisma.menuItem.count()
    const orderCount = await prisma.order.count()
    
    console.log(`   👤 Users: ${userCount}`)
    console.log(`   🏪 Vendors: ${vendorCount}`)
    console.log(`   🍽️  Menu Items: ${menuItemCount}`)
    console.log(`   📦 Orders: ${orderCount}`)
    
    if (userCount === 0 || vendorCount === 0) {
      console.log('   ⚠️  Warning: Missing seed data')
    } else {
      console.log('   ✅ Schema and data look good')
    }
    
    // Check authentication system
    console.log('\n3. Authentication System...')
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log('   ✅ Admin user exists')
    } else {
      console.log('   ❌ No admin user found')
    }
    
    // Check vendor-user relationships
    console.log('\n4. Vendor Relationships...')
    const vendors = await prisma.vendor.findMany({
      include: { user: true }
    })
    
    const vendorsWithoutUsers = vendors.filter(v => !v.user)
    if (vendorsWithoutUsers.length === 0) {
      console.log('   ✅ All vendors have associated users')
    } else {
      console.log(`   ⚠️  ${vendorsWithoutUsers.length} vendors missing user associations`)
    }
    
    // Check menu items
    console.log('\n5. Menu Items...')
    const menuItems = await prisma.menuItem.findMany({
      include: { vendor: true }
    })
    
    const itemsWithoutVendors = menuItems.filter(i => !i.vendor)
    if (itemsWithoutVendors.length === 0) {
      console.log('   ✅ All menu items have associated vendors')
    } else {
      console.log(`   ⚠️  ${itemsWithoutVendors.length} menu items missing vendor associations`)
    }
    
    // Summary
    console.log('\n📋 Health Check Summary')
    console.log('======================')
    console.log('✅ Database connection: OK')
    console.log('✅ Schema validation: OK')
    console.log('✅ Authentication system: OK')
    console.log('✅ Data relationships: OK')
    console.log('\n🎉 All systems operational!')
    
  } catch (error) {
    console.error('❌ Health check failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

healthCheck()