const http = require('http');

// Test OTP API
const data = JSON.stringify({
  phoneNumber: '+1234567890',
  email: 'test@example.com'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();