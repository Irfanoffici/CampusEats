import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'
import { prisma } from '@/lib/prisma'

// Add caching for performance
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow both VENDOR and ADMIN to update order status
    if (!session?.user || !['VENDOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized - Admin or Vendor access required' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    console.log(`[Order Status Update] User: ${session.user.id}, Role: ${session.user.role}, Order: ${params.orderId}, New Status: ${status}`)

    // Get the order first to check payment details
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        student: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    const updatedOrder = await DatabaseService.updateOrderStatus(params.orderId, status)

    // CRITICAL: Deduct RFID balance when order is PICKED_UP or COMPLETED
    if ((status === 'PICKED_UP' || status === 'COMPLETED') && order.paymentMethod === 'RFID' && order.paymentStatus !== 'PAID') {
      console.log(`\n💰 [PAYMENT DEDUCTION STARTED] 💰`)
      console.log(`   Order: ${order.orderNumber}`)
      console.log(`   Student: ${order.student.fullName}`)
      console.log(`   Current Balance: ₹${order.student.rfidBalance}`)
      console.log(`   Amount to Deduct: ₹${order.totalAmount}`)
      
      // Deduct from student's RFID balance
      const updatedStudent = await prisma.user.update({
        where: { id: order.studentId },
        data: {
          rfidBalance: {
            decrement: order.totalAmount,
          },
        },
      })

      // Update payment status to PAID
      await prisma.order.update({
        where: { id: params.orderId },
        data: {
          paymentStatus: 'PAID',
        },
      })

      console.log(`   New Balance: ₹${updatedStudent.rfidBalance}`)
      console.log(`   ✅ Payment Status: PAID`)
      console.log(`💰 [PAYMENT DEDUCTION COMPLETED] 💰\n`)
    } else if ((status === 'PICKED_UP' || status === 'COMPLETED') && order.paymentMethod === 'RFID' && order.paymentStatus === 'PAID') {
      console.log(`⚠️  [PAYMENT ALREADY PROCESSED] - Order ${order.orderNumber} already marked as PAID`)
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
