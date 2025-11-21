import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/community/friends - Get user's friends
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, this would fetch friends from the database
    // For now, we'll return a placeholder response
    const friends = [
      {
        id: '1',
        username: 'friend1',
        fullName: 'Friend One',
        avatar: 'https://via.placeholder.com/40',
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: '2',
        username: 'friend2',
        fullName: 'Friend Two',
        avatar: 'https://via.placeholder.com/40',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ]

    return NextResponse.json(friends)
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }
}

// POST /api/community/friends - Add a friend
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    // In a real implementation, this would add a friend in the database
    // For now, we'll return a placeholder response
    return NextResponse.json({ 
      success: true, 
      message: 'Friend added successfully',
      friend: {
        id: userId,
        username: 'newfriend',
        fullName: 'New Friend',
        avatar: 'https://via.placeholder.com/40',
        isOnline: true,
        lastSeen: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error adding friend:', error)
    return NextResponse.json({ error: 'Failed to add friend' }, { status: 500 })
  }
}