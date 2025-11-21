# Firebase Messaging with End-to-End Encryption

## Overview

This document describes the implementation of secure messaging features in CampusEats using Firebase with end-to-end encryption for direct messages (DMs).

## Features Implemented

1. **End-to-End Encryption**: All direct messages are encrypted using NaCl (Networking and Cryptographic Library) before being stored in Firebase Firestore.
2. **Secure Key Management**: Each user generates a unique key pair (public/private) for encryption/decryption.
3. **Real-time Messaging**: Leveraging Firebase's real-time capabilities for instant message delivery.
4. **Conversation Management**: Tracking conversations and unread messages.

## Technical Implementation

### 1. Key Generation

Each user generates a unique key pair using tweetnacl:

```typescript
import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64 } from 'tweetnacl-util'

const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair()
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey)
  }
}
```

### 2. Message Encryption

Messages are encrypted using the recipient's public key and sender's private key:

```typescript
const encryptMessage = (message: string, recipientPublicKey: string, senderPrivateKey: string): string => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const messageUint8 = new TextEncoder().encode(message)
  const recipientPublicKeyUint8 = decodeBase64(recipientPublicKey)
  const senderPrivateKeyUint8 = decodeBase64(senderPrivateKey)
  
  const encrypted = nacl.box(messageUint8, nonce, recipientPublicKeyUint8, senderPrivateKeyUint8)
  
  // Combine nonce and encrypted message for storage
  const fullMessage = new Uint8Array(nonce.length + encrypted.length)
  fullMessage.set(nonce)
  fullMessage.set(encrypted, nonce.length)
  
  return encodeBase64(fullMessage)
}
```

### 3. Message Decryption

Messages are decrypted using the sender's public key and recipient's private key:

```typescript
const decryptMessage = (encryptedMessage: string, senderPublicKey: string, recipientPrivateKey: string): string => {
  const fullMessage = decodeBase64(encryptedMessage)
  const nonce = fullMessage.slice(0, nacl.box.nonceLength)
  const encrypted = fullMessage.slice(nacl.box.nonceLength)
  
  const senderPublicKeyUint8 = decodeBase64(senderPublicKey)
  const recipientPrivateKeyUint8 = decodeBase64(recipientPrivateKey)
  
  const decrypted = nacl.box.open(encrypted, nonce, senderPublicKeyUint8, recipientPrivateKeyUint8)
  
  if (!decrypted) {
    throw new Error('Decryption failed')
  }
  
  return new TextDecoder().decode(decrypted)
}
```

### 4. Firebase Integration

Messages are stored in Firestore with encrypted content:

```typescript
const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  senderPublicKey: string,
  senderPrivateKey: string,
  recipientPublicKey: string
): Promise<string> => {
  // Encrypt the message
  const encryptedContent = encryptMessage(content, recipientPublicKey, senderPrivateKey)
  
  // Save to Firestore
  const messageRef = await addDoc(collection(db!, 'messages'), {
    senderId,
    receiverId,
    content: encryptedContent,
    timestamp: serverTimestamp(),
    read: false
  })
  
  return messageRef.id
}
```

## Security Considerations

1. **Key Storage**: In a production environment, public keys should be stored in the database and private keys should be securely stored on the client-side (e.g., using browser's localStorage with additional encryption).

2. **Key Exchange**: A secure key exchange mechanism should be implemented to share public keys between users.

3. **Forward Secrecy**: For enhanced security, consider implementing forward secrecy by regularly rotating encryption keys.

4. **Message Authentication**: Consider adding message authentication codes (MACs) to ensure message integrity.

## Usage in Components

### Student Dashboard Messages

The student dashboard implements end-to-end encrypted messaging in the Messages tab:

1. Key pairs are generated when the user logs in
2. Messages are encrypted before sending
3. Messages are decrypted when received
4. Real-time updates are provided through Firestore listeners

### Vendor Community Messaging

Vendors can communicate with each other through the community messaging feature, which also uses the same encryption mechanism.

## Future Enhancements

1. **Group Encryption**: Implement encryption for group messages
2. **Message Deletion**: Add secure message deletion capabilities
3. **File Sharing**: Enable encrypted file sharing within messages
4. **Message Reactions**: Add support for encrypted message reactions
5. **Typing Indicators**: Implement secure typing indicators

## Dependencies

- `firebase`: For real-time database and authentication
- `tweetnacl`: For encryption/decryption
- `tweetnacl-util`: For encoding/decoding utilities

## Configuration

To use Firebase messaging, ensure the following environment variables are set:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```