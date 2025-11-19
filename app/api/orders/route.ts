import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'
import { generateOrderNumber, generatePickupCode } from '@/lib/utils'

// Add caching headers to reduce lag
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vendorId, items, subtotal, tax, totalAmount, paymentMethod, groupOrderId } = body

    // For RFID payment, check balance but DON'T deduct yet
    if (paymentMethod === 'RFID') {
      const user = await DatabaseService.getUserWithVendor(session.user.id)

      if (!user || user.rfidBalance === null || user.rfidBalance < totalAmount) {
        return NextResponse.json({ error: 'Insufficient RFID balance' }, { status: 400 })
      }
      // Balance is sufficient, but we DON'T deduct here - only on pickup!
    }

    const order = await DatabaseService.createOrder({
      orderNumber: generateOrderNumber(),
      studentId: session.user.id,
      vendorId,
      isGroupOrder: !!groupOrderId,
      groupOrderId,
      items: JSON.stringify(items),
      subtotal,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus: 'PENDING', // Payment PENDING until pickup
      orderStatus: 'PLACED',
      pickupCode: generatePickupCode(),
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await DatabaseService.getOrders(session.user.id, session.user.role)
    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
