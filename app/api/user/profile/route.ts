import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/user/profile - Get user profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await DatabaseService.getUserProfile(session.user.id)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updatedProfile = await DatabaseService.updateUserProfile(session.user.id, body)
    return NextResponse.json(updatedProfile)
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    if (error.message === 'Username already taken') {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
  }
}