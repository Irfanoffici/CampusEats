// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via SMS or email
export async function sendOTP(phoneNumber: string | null, email: string | null, otp: string): Promise<{ success: boolean; message?: string }> {
  try {
    // In a real implementation, you would integrate with an SMS or email service provider
    // For now, we'll just simulate the sending process
    
    if (phoneNumber) {
      // Simulate SMS sending
      console.log(`[OTP Service] Sending OTP ${otp} to phone number ${phoneNumber}`)
      // In a real implementation:
      // await twilioClient.messages.create({
      //   body: `Your CampusEats verification code is: ${otp}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // })
    }
    
    if (email) {
      // Simulate email sending
      console.log(`[OTP Service] Sending OTP ${otp} to email ${email}`)
      // In a real implementation:
      // await sendEmail({
      //   to: email,
      //   subject: 'CampusEats Verification Code',
      //   text: `Your verification code is: ${otp}`
      // })
    }
    
    return { success: true, message: 'OTP sent successfully' }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, message: 'Failed to send OTP' }
  }
}

// For development/testing purposes, you might want to use this mock function
export function mockSendOTP(phoneNumber: string | null, email: string | null, otp: string): { success: boolean; message?: string } {
  console.log(`[MOCK OTP] Would send OTP ${otp} to ${phoneNumber || email}`)
  return { success: true, message: 'OTP sent successfully (mock)' }
}