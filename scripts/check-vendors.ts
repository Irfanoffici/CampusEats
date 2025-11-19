import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVendors() {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  })

  console.log('\n=== ALL VENDORS ===\n')
  vendors.forEach((vendor) => {
    console.log(`Vendor: ${vendor.shopName}`)
    console.log(`  ID: ${vendor.id}`)
    console.log(`  User: ${vendor.user.fullName} (${vendor.user.email})`)
    console.log(`  Orders: ${vendor._count.orders}`)
    console.log('---')
  })

  // Check which vendor owns those orders
  const orders = await prisma.order.findMany({
    include: {
      vendor: {
        select: {
          shopName: true,
          id: true,
        },
      },
    },
  })

  console.log('\n=== ORDER -> VENDOR MAPPING ===\n')
  orders.forEach((order) => {
    console.log(`Order ${order.orderNumber} → Vendor: ${order.vendor.shopName} (ID: ${order.vendorId})`)
  })

  await prisma.$disconnect()
}

checkVendors()
