// Example usage of Firebase Auth for OTP verification
import { auth } from './lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'

// 1. Send OTP via Firebase Auth
async function sendOTP(phoneNumber) {
  try {
    // Create reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log('reCAPTCHA solved:', response)
      }
    })

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    console.log('OTP sent successfully:', confirmationResult)
    return confirmationResult
  } catch (error) {
    console.error('Error sending OTP:', error)
    return null
  }
}

// 2. Verify OTP via Firebase Auth
async function verifyOTP(confirmationResult, otp) {
  try {
    // Verify OTP
    const result = await confirmationResult.confirm(otp)
    console.log('OTP verified successfully:', result)
    return result
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return null
  }
}

// Example usage:
// const confirmationResult = await sendOTP('+1234567890')
// if (confirmationResult) {
//   const userCredential = await verifyOTP(confirmationResult, '123456')
//   if (userCredential) {
//     console.log('User signed in:', userCredential.user)
//   }
// }

export { sendOTP, verifyOTP }