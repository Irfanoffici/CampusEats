import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

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
    const order: any = await DatabaseService.getOrderById(params.orderId)

    if (!order) {
      console.error(`[Order Status Update] Order not found: ${params.orderId}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log(`[Order Status Update] Found order: ${order.orderNumber}, Current Status: ${order.orderStatus}, Payment: ${order.paymentMethod}/${order.paymentStatus}`)

    // CRITICAL: Deduct RFID balance when order is PICKED_UP or COMPLETED
    if ((status === 'PICKED_UP' || status === 'COMPLETED') && order.paymentMethod === 'RFID' && order.paymentStatus !== 'PAID') {
      console.log(`\n💰 [PAYMENT DEDUCTION STARTED] 💰`)
      console.log(`   Order: ${order.orderNumber}`)
      console.log(`   Student ID: ${order.studentId}`)
      console.log(`   Amount to Deduct: ₹${order.totalAmount}`)
      
      // Deduct from student's RFID balance (SYNCED across all DBs)
      await DatabaseService.updateUserBalance(order.studentId, order.totalAmount, false)
      
      // Update both order status and payment status
      const updatedOrder = await DatabaseService.updateOrderStatusAndPayment(params.orderId, status, 'PAID')

      console.log(`   ✅ Payment Status: PAID`)
      console.log(`💰 [PAYMENT DEDUCTION COMPLETED] 💰\n`)
      
      return NextResponse.json({ success: true, order: updatedOrder })
    } else if ((status === 'PICKED_UP' || status === 'COMPLETED') && order.paymentMethod === 'RFID' && order.paymentStatus === 'PAID') {
      console.log(`⚠️  [PAYMENT ALREADY PROCESSED] - Order ${order.orderNumber} already marked as PAID`)
    }

    // Update order status only (SYNCED across all DBs)
    const updatedOrder = await DatabaseService.updateOrderStatus(params.orderId, status)

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
