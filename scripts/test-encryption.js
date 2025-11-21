const { generateKeyPair, encryptMessage, decryptMessage } = require('../dist/messaging-service');

console.log('🧪 Testing Messaging Encryption...');

// Test 1: Generate key pair
console.log('\n1. Testing key pair generation...');
try {
  const keyPair = generateKeyPair();
  console.log('✅ Key pair generated successfully');
  console.log('   Public Key:', keyPair.publicKey.substring(0, 20) + '...');
  console.log('   Private Key:', keyPair.privateKey.substring(0, 20) + '...');
} catch (error) {
  console.log('❌ Key pair generation failed:', error.message);
  process.exit(1);
}

// Test 2: Encrypt and decrypt message
console.log('\n2. Testing encryption and decryption...');
try {
  // Generate key pairs for sender and receiver
  const senderKeyPair = generateKeyPair();
  const receiverKeyPair = generateKeyPair();
  
  const message = 'Hello, this is a secret message!';
  console.log('   Original message:', message);
  
  // Encrypt the message
  const encryptedMessage = encryptMessage(
    message,
    receiverKeyPair.publicKey,
    senderKeyPair.privateKey
  );
  console.log('   Encrypted message:', encryptedMessage.substring(0, 30) + '...');
  
  // Decrypt the message
  const decryptedMessage = decryptMessage(
    encryptedMessage,
    senderKeyPair.publicKey,
    receiverKeyPair.privateKey
  );
  console.log('   Decrypted message:', decryptedMessage);
  
  if (decryptedMessage === message) {
    console.log('✅ Encryption and decryption successful');
  } else {
    console.log('❌ Decrypted message does not match original');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Encryption/decryption failed:', error.message);
  process.exit(1);
}

// Test 3: Wrong key decryption (should fail)
console.log('\n3. Testing decryption with wrong keys...');
try {
  // Generate key pairs for sender and receiver
  const senderKeyPair = generateKeyPair();
  const receiverKeyPair = generateKeyPair();
  const wrongKeyPair = generateKeyPair();
  
  const message = 'Hello, this is a secret message!';
  
  // Encrypt the message
  const encryptedMessage = encryptMessage(
    message,
    receiverKeyPair.publicKey,
    senderKeyPair.privateKey
  );
  
  // Try to decrypt with wrong keys - should throw an error
  try {
    decryptMessage(
      encryptedMessage,
      senderKeyPair.publicKey,
      wrongKeyPair.privateKey
    );
    console.log('❌ Decryption should have failed with wrong keys');
    process.exit(1);
  } catch (error) {
    if (error.message === 'Failed to decrypt message') {
      console.log('✅ Decryption correctly failed with wrong keys');
    } else {
      console.log('❌ Unexpected error:', error.message);
      process.exit(1);
    }
  }
} catch (error) {
  console.log('❌ Test setup failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All encryption tests passed!');