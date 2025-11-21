import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Add caching headers to reduce lag
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET endpoint to fetch a specific invoice by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, this would fetch a specific invoice by ID
    // For now, we'll return a placeholder response
    return NextResponse.json({
      id: params.id,
      orderNumber: `INV-${params.id.substring(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      totalAmount: 0,
      vendor: { shopName: 'Sample Vendor' },
      status: 'PAID',
      items: [],
      participantCount: 1,
      splitType: 'equal'
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}