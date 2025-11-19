import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixExistingOrders() {
  console.log('\n=== FIXING EXISTING ORDERS ===\n')
  
  // Find all PICKED_UP orders with PENDING payment
  const ordersToFix = await prisma.order.findMany({
    where: {
      orderStatus: 'PICKED_UP',
      paymentStatus: 'PENDING',
      paymentMethod: 'RFID',
    },
    include: {
      student: true,
    },
  })

  console.log(`Found ${ordersToFix.length} orders to fix\n`)

  for (const order of ordersToFix) {
    console.log(`Processing Order: ${order.orderNumber}`)
    console.log(`  Student: ${order.student.fullName}`)
    console.log(`  Current Balance: ₹${order.student.rfidBalance}`)
    console.log(`  Amount to Deduct: ₹${order.totalAmount}`)
    
    // Deduct from student's RFID balance
    await prisma.user.update({
      where: { id: order.studentId },
      data: {
        rfidBalance: {
          decrement: order.totalAmount,
        },
      },
    })

    // Update payment status to PAID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
      },
    })

    const updatedStudent = await prisma.user.findUnique({
      where: { id: order.studentId },
    })

    console.log(`  New Balance: ₹${updatedStudent?.rfidBalance}`)
    console.log(`  ✓ Payment deducted and marked as PAID\n`)
  }

  console.log('=== DONE ===\n')
  await prisma.$disconnect()
}

fixExistingOrders()
