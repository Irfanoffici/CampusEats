import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>) {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    results.push({ name, passed: true, message: 'PASSED', duration })
    console.log(`✅ ${name} (${duration}ms)`)
  } catch (error: any) {
    const duration = Date.now() - start
    results.push({ name, passed: false, message: error.message, duration })
    console.log(`❌ ${name}: ${error.message} (${duration}ms)`)
  }
}

async function main() {
  console.log('🧪 Starting CampusEats System Tests\n')
  console.log('=' .repeat(60))
  
  // Test 1: Database Connection
  await runTest('Database Connection', async () => {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    if (userCount === 0) throw new Error('No users found in database')
  })

  // Test 2: Verify Seed Data
  await runTest('Verify Seed Data', async () => {
    const students = await prisma.user.count({ where: { role: 'STUDENT' } })
    const vendors = await prisma.user.count({ where: { role: 'VENDOR' } })
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    
    if (students === 0) throw new Error('No students found')
    if (vendors === 0) throw new Error('No vendors found')
    if (admins === 0) throw new Error('No admins found')
  })

  // Test 3: Vendor-User Relationship
  await runTest('Vendor-User Relationship', async () => {
    const vendorUsers = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      include: { vendor: true }
    })
    
    const usersWithoutVendor = vendorUsers.filter((u: any) => !u.vendor)
    if (usersWithoutVendor.length > 0) {
      throw new Error(`${usersWithoutVendor.length} vendor users have no vendor profile`)
    }
  })

  // Test 4: Menu Items
  await runTest('Menu Items Exist', async () => {
    const menuCount = await prisma.menuItem.count()
    if (menuCount === 0) throw new Error('No menu items found')
    
    const vendors = await prisma.vendor.findMany()
    for (const vendor of vendors) {
      const items = await prisma.menuItem.count({ where: { vendorId: vendor.id } })
      if (items === 0) {
        console.log(`  ⚠️  Warning: Vendor ${vendor.shopName} has no menu items`)
      }
    }
  })

  // Test 5: RFID Balance System
  await runTest('RFID Balance System', async () => {
    const students = await prisma.user.findMany({ where: { role: 'STUDENT' } })
    const withBalance = students.filter((s: any) => s.rfidBalance !== null && s.rfidBalance > 0)
    
    if (withBalance.length === 0) {
      throw new Error('No students have RFID balance')
    }
  })

  // Test 6: Simulate Order Creation
  await runTest('Order Creation Flow', async () => {
    const student = await prisma.user.findFirst({ 
      where: { role: 'STUDENT', rfidBalance: { gt: 100 } } 
    })
    const vendor = await prisma.vendor.findFirst({ include: { menuItems: true } })
    
    if (!student) throw new Error('No student with sufficient balance')
    if (!vendor || vendor.menuItems.length === 0) throw new Error('No vendor with menu items')
    
    const menuItem = vendor.menuItems[0]
    
    // Create test order
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        studentId: student.id,
        vendorId: vendor.id,
        items: JSON.stringify([{ id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }]),
        subtotal: menuItem.price,
        tax: menuItem.price * 0.05,
        totalAmount: menuItem.price * 1.05,
        paymentMethod: 'RFID',
        paymentStatus: 'PENDING',
        orderStatus: 'PLACED',
        pickupCode: '1234',
      }
    })
    
    // Verify order was created
    const fetchedOrder = await prisma.order.findUnique({ where: { id: order.id } })
    if (!fetchedOrder) throw new Error('Order not found after creation')
    
    // Clean up test order
    await prisma.order.delete({ where: { id: order.id } })
  })

  // Test 7: Vendor Order Retrieval
  await runTest('Vendor Order Retrieval', async () => {
    const vendorUser = await prisma.user.findFirst({
      where: { role: 'VENDOR' },
      include: { vendor: true }
    })
    
    if (!vendorUser?.vendor) {
      throw new Error('No vendor user found with vendor profile')
    }
    
    // This simulates the DatabaseService.getOrders flow
    const orders = await prisma.order.findMany({
      where: { vendorId: vendorUser.vendor.id },
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
    
    console.log(`  📦 Vendor ${vendorUser.vendor.shopName} has ${orders.length} orders`)
  })

  // Test 8: Payment Method Support
  await runTest('Payment Methods', async () => {
    const paymentMethods = ['RFID', 'UPI', 'CARD']
    const orders = await prisma.order.findMany({ 
      select: { paymentMethod: true },
      distinct: ['paymentMethod']
    })
    
    console.log(`  💳 Payment methods in use: ${orders.map((o: any) => o.paymentMethod).join(', ')}`)
  })

  // Test 9: Order Status Flow
  await runTest('Order Status Updates', async () => {
    const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } })
    const vendor = await prisma.vendor.findFirst()
    
    if (!student || !vendor) throw new Error('Missing test data')
    
    // Create test order
    const order = await prisma.order.create({
      data: {
        orderNumber: `STATUS-${Date.now()}`,
        studentId: student.id,
        vendorId: vendor.id,
        items: JSON.stringify([]),
        subtotal: 100,
        tax: 5,
        totalAmount: 105,
        paymentMethod: 'CARD',
        paymentStatus: 'PENDING',
        orderStatus: 'PLACED',
        pickupCode: '5678',
      }
    })
    
    // Update status
    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'PREPARING' }
    })
    
    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'READY' }
    })
    
    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'COMPLETED', paymentStatus: 'PAID' }
    })
    
    // Verify final status
    const updated = await prisma.order.findUnique({ where: { id: order.id } })
    if (updated?.orderStatus !== 'COMPLETED') throw new Error('Status not updated correctly')
    
    // Clean up
    await prisma.order.delete({ where: { id: order.id } })
  })

  // Test 10: RFID Deduction on Pickup
  await runTest('RFID Deduction Flow', async () => {
    const student = await prisma.user.findFirst({ 
      where: { role: 'STUDENT', rfidBalance: { gt: 200 } } 
    })
    const vendor = await prisma.vendor.findFirst()
    
    if (!student || !vendor) throw new Error('Missing test data')
    
    const initialBalance = student.rfidBalance || 0
    const orderAmount = 50
    
    // Create RFID order
    const order = await prisma.order.create({
      data: {
        orderNumber: `RFID-${Date.now()}`,
        studentId: student.id,
        vendorId: vendor.id,
        items: JSON.stringify([]),
        subtotal: orderAmount,
        tax: orderAmount * 0.05,
        totalAmount: orderAmount * 1.05,
        paymentMethod: 'RFID',
        paymentStatus: 'PENDING',
        orderStatus: 'PLACED',
        pickupCode: '9999',
      }
    })
    
    // Balance should NOT be deducted yet
    const afterOrder = await prisma.user.findUnique({ where: { id: student.id } })
    if (afterOrder?.rfidBalance !== initialBalance) {
      throw new Error('Balance deducted too early (should only deduct on pickup)')
    }
    
    // Simulate pickup - deduct balance
    const finalAmount = orderAmount * 1.05
    await prisma.user.update({
      where: { id: student.id },
      data: { rfidBalance: { decrement: finalAmount } }
    })
    
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        orderStatus: 'COMPLETED',
        paymentStatus: 'PAID' 
      }
    })
    
    // Verify balance was deducted
    const afterPickup = await prisma.user.findUnique({ where: { id: student.id } })
    const expectedBalance = initialBalance - finalAmount
    
    if (Math.abs((afterPickup?.rfidBalance || 0) - expectedBalance) > 0.01) {
      throw new Error(`Balance incorrect: expected ${expectedBalance}, got ${afterPickup?.rfidBalance}`)
    }
    
    // Restore balance and clean up
    await prisma.user.update({
      where: { id: student.id },
      data: { rfidBalance: initialBalance }
    })
    await prisma.order.delete({ where: { id: order.id } })
  })

  console.log('\n' + '=' .repeat(60))
  console.log('\n📊 Test Summary\n')
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length
  
  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`)
    })
  }
  
  await prisma.$disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('💥 Test suite failed:', error)
  prisma.$disconnect()
  process.exit(1)
})
