import { prisma } from '../lib/prisma'

async function checkReviews() {
  console.log('\n📊 Checking Reviews in Database...\n')

  const reviews = await prisma.review.findMany({
    include: {
      student: {
        select: {
          fullName: true,
          email: true,
        },
      },
      vendor: {
        select: {
          shopName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`Total Reviews: ${reviews.length}\n`)

  if (reviews.length === 0) {
    console.log('❌ No reviews found in database')
    console.log('\nTo test the review system:')
    console.log('1. Login as student (john.doe@mec.edu / student123)')
    console.log('2. Place and complete an order')
    console.log('3. Submit a review from Order History tab')
  } else {
    reviews.forEach((review, index) => {
      console.log(`\n${index + 1}. Review ID: ${review.id}`)
      console.log(`   Student: ${review.student.fullName} (${review.student.email})`)
      console.log(`   Vendor: ${review.vendor.shopName}`)
      console.log(`   Food Rating: ${'⭐'.repeat(review.foodRating)} (${review.foodRating}/5)`)
      console.log(`   Service Rating: ${'⭐'.repeat(review.serviceRating)} (${review.serviceRating}/5)`)
      console.log(`   Comment: ${review.comment || '(No comment)'}`)
      console.log(`   Date: ${new Date(review.createdAt).toLocaleDateString('en-IN')}`)
      console.log('   ---')
    })
  }

  await prisma.$disconnect()
}

checkReviews()
