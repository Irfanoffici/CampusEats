import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

// Add caching headers to reduce lag
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET endpoint to fetch a specific group order by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the specific group order by ID
    const groupOrder = await DatabaseService.getGroupOrderById(params.id)
    
    if (!groupOrder) {
      return NextResponse.json({ error: 'Group order not found' }, { status: 404 })
    }
    
    return NextResponse.json(groupOrder)
  } catch (error) {
    console.error('Error fetching group order:', error)
    return NextResponse.json({ error: 'Failed to fetch group order' }, { status: 500 })
  }
}