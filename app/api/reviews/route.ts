import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, foodRating, serviceRating, comment, images } = body

    const review = await DatabaseService.createReview({
      orderId,
      studentId: session.user.id,
      vendorId: body.vendorId,
      foodRating,
      serviceRating,
      comment: comment || null,
      images: images ? JSON.stringify(images) : null,
    })

    // Get all reviews for this vendor to update rating
    const allReviews = await DatabaseService.getReviewsByVendor(body.vendorId)

    const avgRating = allReviews.reduce((sum: number, r: any) => sum + (r.foodRating + r.serviceRating) / 2, 0) / allReviews.length

    // Update vendor rating (SYNCED)
    await DatabaseService.updateVendorRating(body.vendorId, avgRating, allReviews.length)

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 })
    }

    const reviews = await DatabaseService.getReviewsByVendor(vendorId)
    return NextResponse.json(reviews || [])
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json([], { status: 200 })
  }
}
