import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, foodRating, serviceRating, comment, images } = body

    const review = await prisma.review.create({
      data: {
        orderId,
        studentId: session.user.id,
        vendorId: body.vendorId,
        foodRating,
        serviceRating,
        comment,
        images: images ? JSON.stringify(images) : null,
      },
    })

    // Update vendor's average rating
    const allReviews = await prisma.review.findMany({
      where: { vendorId: body.vendorId },
    })

    const avgRating = allReviews.reduce((sum: number, r: { foodRating: number; serviceRating: number }) => sum + (r.foodRating + r.serviceRating) / 2, 0) / allReviews.length

    await prisma.vendor.update({
      where: { id: body.vendorId },
      data: {
        averageRating: avgRating,
        totalReviews: allReviews.length,
      },
    })

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

    const reviews = await prisma.review.findMany({
      where: { vendorId },
      include: {
        student: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
