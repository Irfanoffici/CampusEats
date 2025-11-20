import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

// Mark as dynamic route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await DatabaseService.getUserBalance(session.user.id)
    return NextResponse.json(user || { rfidBalance: 0, rfidNumber: null })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json({ rfidBalance: 0, rfidNumber: null }, { status: 200 })
  }
}
