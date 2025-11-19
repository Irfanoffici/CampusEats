import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHealth() {
  console.log('🔍 Database Health Check\n')
  console.log('=' .repeat(60))
  
  try {
    // 1. Connection Test
    console.log('1️⃣  Testing database connection...')
    await prisma.$connect()
    console.log('   ✅ Connected successfully\n')
    
    // 2. Table Counts
    console.log('2️⃣  Checking table data...')
    const counts = {
      users: await prisma.user.count(),
      vendors: await prisma.vendor.count(),
      menuItems: await prisma.menuItem.count(),
      orders: await prisma.order.count(),
      reviews: await prisma.review.count(),
      transactions: await prisma.transaction.count(),
      groupOrders: await prisma.groupOrder.count(),
    }
    
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   📊 ${table.padEnd(20)} ${count}`)
    })
    console.log()
    
    // 3. User Distribution
    console.log('3️⃣  User role distribution...')
    const students = await prisma.user.count({ where: { role: 'STUDENT' } })
    const vendors = await prisma.user.count({ where: { role: 'VENDOR' } })
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    console.log(`   👨‍🎓 Students: ${students}`)
    console.log(`   🏪 Vendors:  ${vendors}`)
    console.log(`   🔑 Admins:   ${admins}\n`)
    
    // 4. Vendor-User Links
    console.log('4️⃣  Checking vendor-user relationships...')
    const vendorUsers = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      include: { vendor: true }
    })
    
    const linked = vendorUsers.filter((u: any) => u.vendor).length
    const unlinked = vendorUsers.filter((u: any) => !u.vendor).length
    
    console.log(`   ✅ Linked:   ${linked}`)
    console.log(`   ⚠️  Unlinked: ${unlinked}\n`)
    
    if (unlinked > 0) {
      console.log('   ⚠️  WARNING: Some vendor users have no vendor profile!')
      vendorUsers.filter((u: any) => !u.vendor).forEach((u: any) => {
        console.log(`      - ${u.email}`)
      })
      console.log()
    }
    
    // 5. Menu Coverage
    console.log('5️⃣  Checking menu item coverage...')
    const allVendors = await prisma.vendor.findMany({ include: { menuItems: true } })
    allVendors.forEach((v: any) => {
      const itemCount = v.menuItems.length
      const status = itemCount > 0 ? '✅' : '⚠️ '
      console.log(`   ${status} ${v.shopName.padEnd(25)} ${itemCount} items`)
    })
    console.log()
    
    // 6. RFID Balance Stats
    console.log('6️⃣  RFID balance statistics...')
    const rfidStudents = await prisma.user.findMany({
      where: { 
        role: 'STUDENT',
        rfidBalance: { not: null }
      },
      select: { rfidBalance: true }
    })
    
    if (rfidStudents.length > 0) {
      const balances = rfidStudents.map((s: any) => s.rfidBalance || 0)
      const total = balances.reduce((a: number, b: number) => a + b, 0)
      const avg = total / balances.length
      const min = Math.min(...balances)
      const max = Math.max(...balances)
      
      console.log(`   💰 Total Balance:   ₹${total.toFixed(2)}`)
      console.log(`   📊 Average:         ₹${avg.toFixed(2)}`)
      console.log(`   📉 Min:             ₹${min.toFixed(2)}`)
      console.log(`   📈 Max:             ₹${max.toFixed(2)}\n`)
    } else {
      console.log('   ⚠️  No RFID balances found\n')
    }
    
    // 7. Recent Orders
    console.log('7️⃣  Recent order activity...')
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { vendor: { select: { shopName: true } } }
    })
    
    if (recentOrders.length > 0) {
      recentOrders.forEach((order: any) => {
        console.log(`   📦 ${order.orderNumber} - ${order.vendor.shopName} - ₹${order.totalAmount} - ${order.orderStatus}`)
      })
      console.log()
    } else {
      console.log('   📭 No orders yet\n')
    }
    
    // 8. Payment Method Distribution
    console.log('8️⃣  Payment method usage...')
    const ordersByPayment = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: { paymentMethod: true }
    })
    
    if (ordersByPayment.length > 0) {
      ordersByPayment.forEach(({ paymentMethod, _count }: any) => {
        console.log(`   💳 ${paymentMethod.padEnd(10)} ${_count.paymentMethod} orders`)
      })
      console.log()
    } else {
      console.log('   📭 No payment data\n')
    }
    
    // 9. Order Status Distribution
    console.log('9️⃣  Order status distribution...')
    const ordersByStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      _count: { orderStatus: true }
    })
    
    if (ordersByStatus.length > 0) {
      ordersByStatus.forEach(({ orderStatus, _count }: any) => {
        console.log(`   📋 ${orderStatus.padEnd(12)} ${_count.orderStatus} orders`)
      })
      console.log()
    } else {
      console.log('   📭 No order status data\n')
    }
    
    console.log('=' .repeat(60))
    console.log('✅ Health check complete!\n')
    
  } catch (error) {
    console.error('❌ Health check failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkHealth()
