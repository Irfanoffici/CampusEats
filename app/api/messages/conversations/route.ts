import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/messages/conversations - Get user's conversations
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, this would fetch conversations from the database
    // For now, we'll return a placeholder response
    const conversations = [
      {
        id: '1',
        participants: [
          {
            id: 'user1',
            username: 'user1',
            fullName: 'User One',
            avatar: 'https://via.placeholder.com/40'
          },
          {
            id: session.user.id,
            username: session.user.name,
            fullName: session.user.name,
            avatar: 'https://via.placeholder.com/40'
          }
        ],
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 2
      },
      {
        id: '2',
        participants: [
          {
            id: 'user2',
            username: 'user2',
            fullName: 'User Two',
            avatar: 'https://via.placeholder.com/40'
          },
          {
            id: 'user3',
            username: 'user3',
            fullName: 'User Three',
            avatar: 'https://via.placeholder.com/40'
          },
          {
            id: session.user.id,
            username: session.user.name,
            fullName: session.user.name,
            avatar: 'https://via.placeholder.com/40'
          }
        ],
        lastMessage: 'Let\'s meet for lunch tomorrow',
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        unreadCount: 0
      }
    ]

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/messages/conversations - Create a new conversation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { participantIds } = body

    // In a real implementation, this would create a conversation in the database
    // For now, we'll return a placeholder response
    return NextResponse.json({ 
      success: true, 
      message: 'Conversation created successfully',
      conversation: {
        id: 'new-conversation-id',
        participants: [
          ...participantIds.map((id: string) => ({
            id,
            username: `user${id}`,
            fullName: `User ${id}`,
            avatar: 'https://via.placeholder.com/40'
          })),
          {
            id: session.user.id,
            username: session.user.name,
            fullName: session.user.name,
            avatar: 'https://via.placeholder.com/40'
          }
        ],
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      }
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}