import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/community/friend-requests - Get friend requests
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, this would fetch friend requests from the database
    // For now, we'll return a placeholder response
    const friendRequests = [
      {
        id: '1',
        fromUser: {
          id: 'sender1',
          username: 'sender1',
          fullName: 'Sender One',
          avatar: 'https://via.placeholder.com/40'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        fromUser: {
          id: 'sender2',
          username: 'sender2',
          fullName: 'Sender Two',
          avatar: 'https://via.placeholder.com/40'
        },
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ]

    return NextResponse.json(friendRequests)
  } catch (error) {
    console.error('Error fetching friend requests:', error)
    return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 })
  }
}

// POST /api/community/friend-requests - Send friend request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    // In a real implementation, this would create a friend request in the database
    // For now, we'll return a placeholder response
    return NextResponse.json({ 
      success: true, 
      message: 'Friend request sent successfully',
      requestId: 'new-request-id'
    })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
  }
}

// PUT /api/community/friend-requests/[id]/accept - Accept friend request
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const action = url.pathname.split('/').pop()

    if (action === 'accept') {
      // In a real implementation, this would accept the friend request in the database
      // For now, we'll return a placeholder response
      return NextResponse.json({ 
        success: true, 
        message: 'Friend request accepted successfully'
      })
    } else if (action === 'reject') {
      // In a real implementation, this would reject the friend request in the database
      // For now, we'll return a placeholder response
      return NextResponse.json({ 
        success: true, 
        message: 'Friend request rejected successfully'
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing friend request:', error)
    return NextResponse.json({ error: 'Failed to process friend request' }, { status: 500 })
  }
}