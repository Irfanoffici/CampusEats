import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pickupCode } = body

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { student: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.pickupCode !== pickupCode) {
      return NextResponse.json({ error: 'Invalid pickup code' }, { status: 400 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        orderStatus: 'PICKED_UP',
        paymentStatus: 'COMPLETED',
        pickedUpAt: new Date(),
      },
    })

    // Deduct RFID balance if payment method is RFID
    if (order.paymentMethod === 'RFID' && order.student.rfidBalance !== null) {
      const newBalance = order.student.rfidBalance - order.totalAmount

      await prisma.user.update({
        where: { id: order.studentId },
        data: { rfidBalance: newBalance },
      })

      // Create transaction record
      await prisma.transaction.create({
        data: {
          studentId: order.studentId,
          orderId: order.id,
          transactionType: 'DEBIT',
          amount: order.totalAmount,
          previousBalance: order.student.rfidBalance,
          newBalance,
          description: `Order ${order.orderNumber} payment`,
        },
      })
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error confirming pickup:', error)
    return NextResponse.json({ error: 'Failed to confirm pickup' }, { status: 500 })
  }
}
