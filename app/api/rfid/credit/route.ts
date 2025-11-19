import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only ADMIN can credit RFID balance
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { rfidNumber, amount } = body

    if (!rfidNumber || !amount) {
      return NextResponse.json({ error: 'RFID number and amount are required' }, { status: 400 })
    }

    const creditAmount = parseFloat(amount)
    if (isNaN(creditAmount) || creditAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    console.log(`\n💳 [RFID CREDIT] Admin ${session.user.email} crediting ₹${creditAmount} to RFID ${rfidNumber}`)

    // Find user by RFID number
    const user = await prisma.user.findFirst({
      where: { rfidNumber },
    })

    if (!user) {
      return NextResponse.json({ error: 'User with this RFID number not found' }, { status: 404 })
    }

    console.log(`   User: ${user.fullName} (${user.email})`)
    console.log(`   Current Balance: ₹${user.rfidBalance}`)

    // Credit the balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        rfidBalance: {
          increment: creditAmount,
        },
      },
    })

    console.log(`   New Balance: ₹${updatedUser.rfidBalance}`)
    console.log(`✅ [RFID CREDIT] Success!\n`)

    return NextResponse.json({
      success: true,
      user: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        rfidNumber: updatedUser.rfidNumber,
        previousBalance: user.rfidBalance,
        newBalance: updatedUser.rfidBalance,
        creditedAmount: creditAmount,
      },
    })
  } catch (error) {
    console.error('Error crediting RFID:', error)
    return NextResponse.json({ error: 'Failed to credit RFID balance' }, { status: 500 })
  }
}
