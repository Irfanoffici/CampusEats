// Minimal OTP model implementation to work around Prisma client issues
import { prisma } from './prisma'

// Since we're having issues with Prisma client generation, let's create a simple interface
// that mimics the OTP model functionality

export interface OTP {
  id: string
  phoneNumber?: string | null
  email?: string | null
  otp: string
  expiresAt: Date
  createdAt: Date
}

// Simple in-memory storage for OTPs as a fallback
const otpStorage: OTP[] = []

export class OTPModel {
  static async create(data: {
    phoneNumber?: string | null
    email?: string | null
    otp: string
    expiresAt: Date
  }): Promise<OTP> {
    const newOTP: OTP = {
      id: Math.random().toString(36).substring(2, 15),
      ...data,
      createdAt: new Date()
    }
    
    otpStorage.push(newOTP)
    return newOTP
  }

  static async findFirst(where: {
    OR?: Array<{ phoneNumber?: string } | { email?: string }>
    otp?: string
    expiresAt?: { gte: Date }
  }): Promise<OTP | null> {
    // Simple search implementation
    const now = new Date()
    const otp = where.otp
    
    // Find matching OTP
    const found = otpStorage.find(item => {
      // Check if OTP matches
      if (otp && item.otp !== otp) return false
      
      // Check expiration
      if (where.expiresAt?.gte && item.expiresAt < where.expiresAt.gte) return false
      
      // Check phone number or email
      if (where.OR) {
        const matches = where.OR.some(condition => {
          if ('phoneNumber' in condition && condition.phoneNumber && item.phoneNumber === condition.phoneNumber) {
            return true
          }
          if ('email' in condition && condition.email && item.email === condition.email) {
            return true
          }
          return false
        })
        if (!matches) return false
      }
      
      return true
    })
    
    return found || null
  }

  static async delete(where: { id: string }): Promise<void> {
    const index = otpStorage.findIndex(item => item.id === where.id)
    if (index !== -1) {
      otpStorage.splice(index, 1)
    }
  }
}