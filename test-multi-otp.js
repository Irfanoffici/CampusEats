// Test the multi-layered OTP implementation

// Test data
const testPhoneNumber = '+1234567890';
const testEmail = 'test@example.com';
const testOtp = '123456';

// Test the OTP API endpoints
async function testMultiLayeredOTP() {
  console.log('Testing multi-layered OTP implementation...\n');
  
  try {
    // Test sending OTP
    console.log('1. Testing OTP sending...');
    const sendResponse = await fetch('http://localhost:3000/api/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber,
        email: testEmail,
      }),
    });
    
    const sendResult = await sendResponse.json();
    console.log('Send OTP result:', sendResult);
    
    // Test verifying OTP
    console.log('\n2. Testing OTP verification...');
    const verifyResponse = await fetch('http://localhost:3000/api/otp', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber,
        email: testEmail,
        otp: testOtp,
      }),
    });
    
    const verifyResult = await verifyResponse.json();
    console.log('Verify OTP result:', verifyResult);
    
    console.log('\nMulti-layered OTP test completed successfully!');
  } catch (error) {
    console.error('Error testing multi-layered OTP:', error);
  }
}

// Run the test
testMultiLayeredOTP();