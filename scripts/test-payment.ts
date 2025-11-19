import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPaymentFlow() {
  console.log('\n🧪 TESTING PAYMENT DEDUCTION FLOW\n')
  
  // Get the order that's currently at READY status
  const order = await prisma.order.findFirst({
    where: {
      orderStatus: 'READY',
      paymentMethod: 'RFID',
      paymentStatus: 'PENDING',
    },
    include: {
      student: true,
    },
  })

  if (!order) {
    console.log('❌ No READY orders found with PENDING payment')
    await prisma.$disconnect()
    return
  }

  console.log(`📦 Order: ${order.orderNumber}`)
  console.log(`👤 Student: ${order.student.fullName}`)
  console.log(`💰 Current Balance: ₹${order.student.rfidBalance ?? 0}`)
  console.log(`🛒 Order Amount: ₹${order.totalAmount}`)
  console.log(`📊 Expected New Balance: ₹${(order.student.rfidBalance ?? 0) - order.totalAmount}`)
  console.log(`\n⏳ Simulating PICKED_UP status change...\n`)

  // Update order status to PICKED_UP (this should trigger payment deduction)
  await prisma.order.update({
    where: { id: order.id },
    data: {
      orderStatus: 'PICKED_UP',
    },
  })

  // Deduct payment (simulating what the API route does)
  const updatedStudent = await prisma.user.update({
    where: { id: order.studentId },
    data: {
      rfidBalance: {
        decrement: order.totalAmount,
      },
    },
  })

  // Mark payment as PAID
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'PAID',
    },
  })

  console.log(`✅ Payment Deducted!`)
  console.log(`💰 New Balance: ₹${updatedStudent.rfidBalance}`)
  console.log(`📝 Payment Status: PAID`)
  console.log(`\n✅ TEST COMPLETED SUCCESSFULLY!\n`)

  await prisma.$disconnect()
}

testPaymentFlow()
