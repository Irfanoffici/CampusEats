import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await DatabaseService.getAllUsers()
    return NextResponse.json(users || [])
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json([], { status: 200 })
  }
}
