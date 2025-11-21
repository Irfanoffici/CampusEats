import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db-service'

// Add caching headers to reduce lag
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch invoices for the user
    const invoices = await DatabaseService.getInvoices(session.user.id)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST endpoint to generate a new invoice
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { groupOrderId } = body

    // Fetch the group order to generate invoice from
    const groupOrder = await DatabaseService.getGroupOrderById(groupOrderId)
    
    if (!groupOrder) {
      return NextResponse.json({ error: 'Group order not found' }, { status: 404 })
    }

    // Generate invoice data
    const invoiceData = {
      id: groupOrderId,
      orderNumber: `INV-${groupOrderId.substring(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      totalAmount: (groupOrder as any).totalAmount || 0,
      vendor: (groupOrder as any).vendor || { shopName: 'Unknown Vendor' },
      status: 'PAID',
      items: (groupOrder as any).items || [],
      participantCount: (groupOrder as any).participantCount || 1,
      splitType: (groupOrder as any).splitType || 'equal'
    }

    // In a real implementation, this would save the invoice to the database
    // and generate a PDF
    return NextResponse.json(invoiceData)
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}