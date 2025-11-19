import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { vendorId: string } }
) {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        vendorId: params.vendorId,
        isAvailable: true,
      },
      orderBy: {
        category: 'asc',
      },
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}
