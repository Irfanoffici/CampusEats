import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrders() {
  const orders = await prisma.order.findMany({
    include: {
      student: {
        select: {
          fullName: true,
          rfidBalance: true,
        },
      },
      vendor: {
        select: {
          shopName: true,
        },
      },
    },
  })

  console.log('\n=== ALL ORDERS ===\n')
  orders.forEach((order) => {
    console.log(`Order: ${order.orderNumber}`)
    console.log(`  Vendor: ${order.vendor.shopName}`)
    console.log(`  Student: ${order.student.fullName} (RFID Balance: ₹${order.student.rfidBalance})`)
    console.log(`  Status: ${order.orderStatus}`)
    console.log(`  Payment: ${order.paymentMethod} - ${order.paymentStatus}`)
    console.log(`  Total: ₹${order.totalAmount}`)
    console.log('---')
  })

  await prisma.$disconnect()
}

checkOrders()
