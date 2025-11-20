import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db-service'

export async function GET() {
  try {
    const vendors = await DatabaseService.getVendors()
    return NextResponse.json(vendors || [])
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array on error
  }
}
