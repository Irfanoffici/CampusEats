import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db-service'

export async function GET(
  request: Request,
  { params }: { params: { vendorId: string } }
) {
  try {
    const menuItems = await DatabaseService.getMenuItems(params.vendorId)
    return NextResponse.json(menuItems || [])
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json([], { status: 200 })
  }
}
