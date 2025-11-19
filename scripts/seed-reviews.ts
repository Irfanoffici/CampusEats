import { prisma } from '../lib/prisma'

async function seedReviews() {
  console.log('\n🌱 Seeding Reviews for Testing...\n')

  // Get Campus Canteen vendor and their completed order
  const campusCanteen = await prisma.vendor.findFirst({
    where: { shopName: 'Campus Canteen' },
  })

  if (!campusCanteen) {
    console.log('❌ Campus Canteen vendor not found')
    return
  }

  // Get student
  const student = await prisma.user.findFirst({
    where: { email: 'john.doe@mec.edu' },
  })

  if (!student) {
    console.log('❌ Student not found')
    return
  }

  // Get a completed order from Campus Canteen
  const order = await prisma.order.findFirst({
    where: {
      vendorId: campusCanteen.id,
      orderStatus: 'PICKED_UP',
    },
  })

  if (!order) {
    console.log('❌ No completed orders found for Campus Canteen')
    console.log('   Please complete an order first before adding reviews')
    return
  }

  console.log(`✅ Found order: ${order.orderNumber}`)

  // Create reviews for Campus Canteen
  const review1 = await prisma.review.create({
    data: {
      orderId: order.id,
      studentId: student.id,
      vendorId: campusCanteen.id,
      foodRating: 5,
      serviceRating: 5,
      comment: 'Amazing food! The dosa was crispy and the chutney was perfect. Highly recommended!',
    },
  })

  console.log(`✅ Created review 1: 5/5 stars - "${review1.comment?.substring(0, 50)}..."`)

  // Get Juice Junction and their orders
  const juiceJunction = await prisma.vendor.findFirst({
    where: { shopName: 'Juice Junction' },
  })

  if (juiceJunction) {
    const juiceOrder = await prisma.order.findFirst({
      where: {
        vendorId: juiceJunction.id,
        orderStatus: 'PICKED_UP',
      },
    })

    if (juiceOrder) {
      const review2 = await prisma.review.create({
        data: {
          orderId: juiceOrder.id,
          studentId: student.id,
          vendorId: juiceJunction.id,
          foodRating: 4,
          serviceRating: 5,
          comment: 'Refreshing juice! Fast service and good quality. Will order again.',
        },
      })

      console.log(`✅ Created review 2: 4.5/5 stars - "${review2.comment?.substring(0, 50)}..."`)
    }
  }

  console.log('\n📊 All reviews in database:')
  const allReviews = await prisma.review.findMany({
    include: {
      vendor: { select: { shopName: true } },
      student: { select: { fullName: true } },
    },
  })

  allReviews.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.vendor.shopName} - ${r.foodRating}⭐ food, ${r.serviceRating}⭐ service`)
  })

  await prisma.$disconnect()
}

seedReviews()
