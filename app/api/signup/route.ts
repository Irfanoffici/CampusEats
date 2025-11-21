import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { DatabaseService } from '@/lib/db-service'
import { prisma } from '@/lib/prisma'

// Add caching headers to reduce lag
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST endpoint for student signup
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      fullName, 
      phoneNumber, 
      rfidNumber, 
      isMECStudent,
      collegeEmail 
    } = body

    // Validate required fields
    if (!email || !password || !fullName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // For MEC students, validate college email and RFID
    if (isMECStudent) {
      // Check if it's a valid MEC email
      if (!email.endsWith('@mec.edu')) {
        return NextResponse.json(
          { error: 'MEC students must use @mec.edu email address' }, 
          { status: 400 }
        )
      }

      // Check if RFID number is provided
      if (!rfidNumber) {
        return NextResponse.json(
          { error: 'RFID number is required for MEC students' }, 
          { status: 400 }
        )
      }

      // In a real implementation, we would verify the RFID number against college database
      // For now, we'll just check the format
      if (rfidNumber.length < 8) {
        return NextResponse.json(
          { error: 'Invalid RFID number format' }, 
          { status: 400 }
        )
      }
    } else {
      // For non-MEC students, college email is required for verification
      if (!collegeEmail) {
        return NextResponse.json(
          { error: 'College email is required for verification' }, 
          { status: 400 }
        )
      }
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user data
    const userData = {
      email,
      passwordHash: hashedPassword,
      role: 'STUDENT',
      fullName,
      phoneNumber,
      rfidNumber: isMECStudent ? rfidNumber : null,
      rfidBalance: isMECStudent ? 0 : null,
    }

    // Create user in database
    const user = await DatabaseService.syncWrite(
      'create',
      // Firebase write (PRIMARY)
      async () => {
        // This would be implemented if Firebase is available
        throw new Error('Firebase implementation not available')
      },
      // Supabase write (SECONDARY)
      async () => {
        // This would be implemented if Supabase is available
        throw new Error('Supabase implementation not available')
      },
      // Prisma write (TERTIARY)
      async () => {
        return await prisma.user.create({
          data: userData
        })
      }
    )

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rfidNumber: user.rfidNumber,
        rfidBalance: user.rfidBalance,
      }
    })
  } catch (error: any) {
    console.error('Error during signup:', error)
    
    // Handle specific errors
    if (error.code === 'P2002') {
      // Unique constraint violation
      return NextResponse.json(
        { error: 'Email or RFID number already exists' }, 
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' }, 
      { status: 500 }
    )
  }
}