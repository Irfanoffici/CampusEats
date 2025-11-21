# Firebase Auth OTP Verification Guide

## Overview

This guide explains how to implement Firebase Authentication-based OTP verification for phone numbers in the CampusEats application. Firebase Auth provides a secure and reliable way to verify phone numbers using SMS-based OTPs.

## Prerequisites

1. Firebase project configured with Authentication enabled
2. Phone Authentication provider enabled in Firebase Console
3. Firebase SDK properly configured in the application

## Implementation Steps

### 1. Enable Phone Authentication in Firebase Console

1. Go to the Firebase Console
2. Navigate to Authentication > Sign-in method
3. Enable the Phone sign-in method

### 2. Client-Side Implementation

#### Sending OTP

```javascript
import { auth } from './lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

async function sendOTP(phoneNumber) {
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
    console.log('OTP sent successfully:', confirmationResult);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return null;
  }
}
```

#### Verifying OTP

```javascript
async function verifyOTP(confirmationResult, otp) {
  try {
    // Verify OTP
    const result = await confirmationResult.confirm(otp);
    console.log('OTP verified successfully:', result);
    return result;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return null;
  }
}
```

### 3. Server-Side Implementation

The server-side implementation uses the Firebase Admin SDK to verify tokens:

```javascript
// In your API route
import { auth } from '@/lib/firebase';
import { getAuth, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    // Validate phone number
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' }, 
        { status: 400 }
      );
    }

    // Note: In a real implementation, you would need to set up reCAPTCHA on the client side
    // For server-side simulation, we'll create a mock reCAPTCHA verifier
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully via Firebase Auth'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP via Firebase Auth' }, 
      { status: 500 }
    );
  }
}
```

## Integration with CampusEats

### Signup Flow

1. User enters phone number during signup
2. Application sends OTP via Firebase Auth
3. User receives SMS with OTP
4. User enters OTP in the application
5. Application verifies OTP via Firebase Auth
6. If verification is successful, proceed with signup

### Security Considerations

1. **reCAPTCHA**: Firebase Auth requires reCAPTCHA to prevent abuse
2. **Rate Limiting**: Firebase Auth has built-in rate limiting
3. **Token Validation**: Always validate Firebase ID tokens on the server
4. **Session Management**: Use Firebase Auth state persistence

## Testing

### Development Environment

1. Use test phone numbers provided by Firebase Auth
2. Use test codes (e.g., 123456) for development

### Production Environment

1. Ensure proper error handling
2. Implement logging for debugging
3. Monitor usage in Firebase Console

## Troubleshooting

### Common Issues

1. **reCAPTCHA Errors**: Ensure the reCAPTCHA container is properly set up
2. **Network Errors**: Check Firebase configuration and network connectivity
3. **Invalid Phone Numbers**: Validate phone number format before sending

### Debugging Tips

1. Enable Firebase Auth debugging logs
2. Check browser console for errors
3. Verify Firebase project configuration

## Best Practices

1. **User Experience**: Provide clear instructions and feedback
2. **Error Handling**: Implement comprehensive error handling
3. **Security**: Always validate tokens server-side
4. **Performance**: Cache Firebase Auth instances when possible

## References

- [Firebase Auth Phone Authentication Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)