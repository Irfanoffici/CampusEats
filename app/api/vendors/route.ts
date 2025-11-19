import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            fullName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        averageRating: 'desc',
      },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}
