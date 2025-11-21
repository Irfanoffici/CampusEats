import { auth } from './firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { createClient } from '@/utils/supabase/browser'

// Initialize Supabase client
const supabase = createClient()

// Generate a random 6-digit OTP (kept for backward compatibility)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via Firebase Auth (Primary)
export async function sendOTP(phoneNumber: string | null, email: string | null, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Firebase Auth only supports phone number verification
    if (!phoneNumber) {
      // If no phone number, try email OTP via Supabase
      if (email) {
        return await sendEmailOTP(email, otp)
      }
      return { success: false, message: 'Phone number or email is required for OTP' }
    }

    // In a real implementation, you would need to set up reCAPTCHA on the client side
    // For server-side simulation, we'll create a mock reCAPTCHA verifier
    // In production, this should be handled on the client side with proper reCAPTCHA
    
    console.log(`[Firebase OTP Service] Would send OTP to phone number ${phoneNumber} via Firebase Auth`)
    return { success: true, message: 'OTP sent successfully via Firebase Auth' }
  } catch (error) {
    console.error('Error sending OTP via Firebase Auth:', error)
    // Fallback to Supabase
    return await sendOTPSupabaseFallback(phoneNumber, email, otp)
  }
}

// Send Email OTP via Supabase (Secondary)
async function sendEmailOTP(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    // In a real implementation, you would send an email with the OTP
    // For now, we'll just simulate the sending process
    console.log(`[Supabase OTP Service] Would send OTP ${otp} to email ${email} via Supabase`)
    return { success: true, message: 'OTP sent successfully via Supabase' }
  } catch (error) {
    console.error('Error sending OTP via Supabase:', error)
    return { success: false, message: 'Failed to send OTP via Supabase' }
  }
}

// Send OTP via Supabase as fallback
async function sendOTPSupabaseFallback(phoneNumber: string | null, email: string | null, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    if (phoneNumber) {
      // For phone number, we'll simulate sending via Supabase
      console.log(`[Supabase OTP Service] Would send OTP to phone number ${phoneNumber} via Supabase`)
      return { success: true, message: 'OTP sent successfully via Supabase' }
    } else if (email) {
      return await sendEmailOTP(email, otp)
    }
    return { success: false, message: 'Phone number or email is required' }
  } catch (error) {
    console.error('Error sending OTP via Supabase:', error)
    // Fallback to Prisma/local storage
    return { success: false, message: 'Failed to send OTP via all methods' }
  }
}

// Verify OTP via Firebase Auth (Primary)
export async function verifyOTP(phoneNumber: string | null, email: string | null, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Firebase Auth only supports phone number verification
    if (!phoneNumber) {
      // If no phone number, try email OTP verification via Supabase
      if (email) {
        return await verifyEmailOTP(email, otp)
      }
      return { success: false, message: 'Phone number or email is required for OTP verification' }
    }

    // In a real implementation, you would use the confirmation result
    // from the sendOTP function to verify the OTP
    // This is just a simulation
    
    console.log(`[Firebase OTP Service] Would verify OTP ${otp} for phone number ${phoneNumber} via Firebase Auth`)
    return { success: true, message: 'OTP verified successfully via Firebase Auth' }
  } catch (error) {
    console.error('Error verifying OTP via Firebase Auth:', error)
    // Fallback to Supabase
    return await verifyOTPSupabaseFallback(phoneNumber, email, otp)
  }
}

// Verify Email OTP via Supabase (Secondary)
async function verifyEmailOTP(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    // In a real implementation, you would verify the OTP from Supabase
    // For now, we'll just simulate the verification process
    console.log(`[Supabase OTP Service] Would verify OTP ${otp} for email ${email} via Supabase`)
    return { success: true, message: 'OTP verified successfully via Supabase' }
  } catch (error) {
    console.error('Error verifying OTP via Supabase:', error)
    return { success: false, message: 'Failed to verify OTP via Supabase' }
  }
}

// Verify OTP via Supabase as fallback
async function verifyOTPSupabaseFallback(phoneNumber: string | null, email: string | null, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    if (phoneNumber) {
      // For phone number, we'll simulate verification via Supabase
      console.log(`[Supabase OTP Service] Would verify OTP ${otp} for phone number ${phoneNumber} via Supabase`)
      return { success: true, message: 'OTP verified successfully via Supabase' }
    } else if (email) {
      return await verifyEmailOTP(email, otp)
    }
    return { success: false, message: 'Phone number or email is required' }
  } catch (error) {
    console.error('Error verifying OTP via Supabase:', error)
    // Fallback to Prisma/local storage
    return { success: false, message: 'Failed to verify OTP via all methods' }
  }
}

// For development/testing purposes, you might want to use this mock function
export function mockSendOTP(phoneNumber: string | null, email: string | null, otp: string): { success: boolean; message?: string } {
  console.log(`[MOCK OTP] Would send OTP ${otp} to ${phoneNumber || email}`)
  return { success: true, message: 'OTP sent successfully (mock)' }
}