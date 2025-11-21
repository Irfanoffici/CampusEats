// Example usage of the OTP API endpoints with multi-layered approach

// 1. Send OTP via Firebase Auth (Primary) -> Supabase (Secondary) -> Prisma/LocalDB (Tertiary)
async function sendOTP(phoneNumber, email) {
  try {
    const response = await fetch('/api/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        email,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('OTP sent successfully via multi-layered approach:', data);
      return data;
    } else {
      console.error('Failed to send OTP via multi-layered approach:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error sending OTP via multi-layered approach:', error);
    return null;
  }
}

// 2. Verify OTP via Firebase Auth (Primary) -> Supabase (Secondary) -> Prisma/LocalDB (Tertiary)
async function verifyOTP(phoneNumber, email, otp) {
  try {
    const response = await fetch('/api/otp', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        email,
        otp,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('OTP verified successfully via multi-layered approach:', data);
      return data;
    } else {
      console.error('Failed to verify OTP via multi-layered approach:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error verifying OTP via multi-layered approach:', error);
    return null;
  }
}

// Firebase Auth-based OTP verification (client-side implementation)
import { auth } from './lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Send OTP via Firebase Auth (client-side)
async function sendOTPWithFirebase(phoneNumber) {
  try {
    // Create reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log('reCAPTCHA solved:', response);
      }
    });

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    console.log('OTP sent successfully via Firebase Auth:', confirmationResult);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP via Firebase Auth:', error);
    return null;
  }
}

// Verify OTP via Firebase Auth (client-side)
async function verifyOTPWithFirebase(confirmationResult, otp) {
  try {
    // Verify OTP
    const result = await confirmationResult.confirm(otp);
    console.log('OTP verified successfully via Firebase Auth:', result);
    return result;
  } catch (error) {
    console.error('Error verifying OTP via Firebase Auth:', error);
    return null;
  }
}

// Supabase-based OTP verification (client-side implementation)
import { createClient } from './utils/supabase/browser';

// Send OTP via Supabase (client-side)
async function sendOTPWithSupabase(phoneNumber, email) {
  try {
    const supabase = createClient();
    
    // In a real implementation, you would send an OTP via Supabase
    console.log('OTP sent successfully via Supabase:', { phoneNumber, email });
    return { success: true, message: 'OTP sent successfully via Supabase' };
  } catch (error) {
    console.error('Error sending OTP via Supabase:', error);
    return null;
  }
}

// Verify OTP via Supabase (client-side)
async function verifyOTPWithSupabase(otp, phoneNumber, email) {
  try {
    const supabase = createClient();
    
    // In a real implementation, you would verify an OTP via Supabase
    console.log('OTP verified successfully via Supabase:', { otp, phoneNumber, email });
    return { success: true, message: 'OTP verified successfully via Supabase' };
  } catch (error) {
    console.error('Error verifying OTP via Supabase:', error);
    return null;
  }
}

module.exports = { 
  sendOTP, 
  verifyOTP, 
  sendOTPWithFirebase, 
  verifyOTPWithFirebase,
  sendOTPWithSupabase,
  verifyOTPWithSupabase
};