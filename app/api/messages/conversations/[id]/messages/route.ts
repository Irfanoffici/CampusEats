import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/messages/conversations/[id]/messages - Get messages for a conversation
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = params

    // In a real implementation, this would fetch messages from the database
    // For now, we'll return a placeholder response
    const messages = [
      {
        id: '1',
        senderId: 'user1',
        sender: {
          id: 'user1',
          username: 'user1',
          fullName: 'User One',
          avatar: 'https://via.placeholder.com/40'
        },
        content: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: true
      },
      {
        id: '2',
        senderId: session.user.id,
        sender: {
          id: session.user.id,
          username: session.user.name,
          fullName: session.user.name,
          avatar: 'https://via.placeholder.com/40'
        },
        content: 'I\'m doing great! Just finished my order.',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        read: true
      },
      {
        id: '3',
        senderId: 'user1',
        sender: {
          id: 'user1',
          username: 'user1',
          fullName: 'User One',
          avatar: 'https://via.placeholder.com/40'
        },
        content: 'That\'s awesome! What did you order?',
        timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
        read: false
      }
    ]

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/messages/conversations/[id]/messages - Send a message
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = params
    const body = await request.json()
    const { content } = body

    // In a real implementation, this would save the message to the database
    // For now, we'll return a placeholder response
    const newMessage = {
      id: 'new-message-id',
      senderId: session.user.id,
      sender: {
        id: session.user.id,
        username: session.user.name,
        fullName: session.user.name,
        avatar: 'https://via.placeholder.com/40'
      },
      content,
      timestamp: new Date().toISOString(),
      read: false
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      newMessage
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}