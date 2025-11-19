import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all menu items with their vendor and reviews
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
            averageRating: true,
          },
        },
      },
    })

    // Get reviews for rating calculation
    const reviews = await prisma.review.findMany({
      select: {
        vendorId: true,
        foodRating: true,
        serviceRating: true,
      },
    })

    // Calculate vendor ratings from reviews
    const vendorRatings = new Map<string, { total: number; count: number }>()
    
    reviews.forEach((review) => {
      const avgRating = (review.foodRating + review.serviceRating) / 2
      const current = vendorRatings.get(review.vendorId) || { total: 0, count: 0 }
      vendorRatings.set(review.vendorId, {
        total: current.total + avgRating,
        count: current.count + 1,
      })
    })

    // Assign ratings to menu items and calculate recommendation score
    const itemsWithRatings = menuItems.map((item) => {
      const vendorStats = vendorRatings.get(item.vendorId)
      const vendorRating = vendorStats 
        ? vendorStats.total / vendorStats.count 
        : item.vendor.averageRating || 0

      // Recommendation score: vendor rating + popularity bonus + price factor
      const popularityBonus = vendorStats ? Math.min(vendorStats.count / 10, 2) : 0
      const priceFactor = item.price < 100 ? 0.5 : 0 // Bonus for affordable items
      const recommendationScore = vendorRating + popularityBonus + priceFactor

      return {
        ...item,
        vendorRating,
        reviewCount: vendorStats?.count || 0,
        isRecommended: recommendationScore >= 4.0,
        recommendationScore,
      }
    })

    // Sort by recommendation score and return top items
    const recommended = itemsWithRatings
      .filter((item) => item.isRecommended)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 12)

    return NextResponse.json({
      success: true,
      data: recommended,
      total: recommended.length,
    })
  } catch (error) {
    console.error('Error fetching recommended items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
