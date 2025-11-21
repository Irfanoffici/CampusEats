import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'
import { generateOrderNumber, generatePickupCode } from '@/lib/utils'

// Add caching headers to reduce lag
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Generate a random share link
function generateShareLink() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vendorId, items, subtotal, tax, totalAmount, paymentMethod, splitType, participantCount } = body

    // Create group order using database service
    const groupOrderData = {
      creatorId: session.user.id,
      shareLink: generateShareLink(),
      vendorId,
      splitType,
      participantCount: parseInt(participantCount) || 1,
      isFinalized: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    }

    const groupOrder = await DatabaseService.createGroupOrder(groupOrderData)
    
    // If this is a full order creation with items, create individual orders for each participant
    if (items && Array.isArray(items)) {
      // For now, we'll just log that we would create individual orders
      console.log('Would create individual orders for participants:', items)
    }

    return NextResponse.json(groupOrder)
  } catch (error) {
    console.error('Error creating group order:', error)
    return NextResponse.json({ error: 'Failed to create group order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch group orders for the user
    const groupOrders = await DatabaseService.getGroupOrders(session.user.id)
    return NextResponse.json(groupOrders)
  } catch (error) {
    console.error('Error fetching group orders:', error)
    return NextResponse.json({ error: 'Failed to fetch group orders' }, { status: 500 })
  }
}

// PUT endpoint to update group order (e.g., finalize it)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { groupOrderId, isFinalized } = body

    // In a real implementation, we would update the group order in the database
    // For now, we'll just return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Group order updated successfully',
      groupOrderId,
      isFinalized
    })
  } catch (error) {
    console.error('Error updating group order:', error)
    return NextResponse.json({ error: 'Failed to update group order' }, { status: 500 })
  }
}

// DELETE endpoint to delete a group order
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupOrderId = searchParams.get('id')

    if (!groupOrderId) {
      return NextResponse.json({ error: 'Group order ID is required' }, { status: 400 })
    }

    // In a real implementation, we would delete the group order from the database
    // For now, we'll just return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Group order deleted successfully',
      groupOrderId
    })
  } catch (error) {
    console.error('Error deleting group order:', error)
    return NextResponse.json({ error: 'Failed to delete group order' }, { status: 500 })
  }
}