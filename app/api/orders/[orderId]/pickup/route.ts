import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

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

    const order: any = await DatabaseService.getOrderById(params.orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.pickupCode !== pickupCode) {
      return NextResponse.json({ error: 'Invalid pickup code' }, { status: 400 })
    }

    // Update order status (SYNCED)
    const updatedOrder = await DatabaseService.confirmOrderPickup(params.orderId, {
      orderStatus: 'PICKED_UP',
      paymentStatus: 'COMPLETED',
    })

    // Deduct RFID balance if payment method is RFID (SYNCED)
    if (order.paymentMethod === 'RFID') {
      await DatabaseService.updateUserBalance(order.studentId, order.totalAmount, false)

      // Create transaction record (SYNCED)
      await DatabaseService.createTransaction({
        studentId: order.studentId,
        orderId: order.id,
        transactionType: 'DEBIT',
        amount: order.totalAmount,
        previousBalance: order.student?.rfidBalance || 0,
        newBalance: (order.student?.rfidBalance || 0) - order.totalAmount,
        description: `Order ${order.orderNumber} payment`,
      })
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error confirming pickup:', error)
    return NextResponse.json({ error: 'Failed to confirm pickup' }, { status: 500 })
  }
}
