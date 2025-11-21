import { generateKeyPair, encryptMessage, decryptMessage } from '../lib/messaging-service'

describe('Messaging Encryption', () => {
  test('should generate key pair', () => {
    const keyPair = generateKeyPair()
    expect(keyPair).toHaveProperty('publicKey')
    expect(keyPair).toHaveProperty('privateKey')
    expect(typeof keyPair.publicKey).toBe('string')
    expect(typeof keyPair.privateKey).toBe('string')
  })

  test('should encrypt and decrypt message', () => {
    // Generate key pairs for sender and receiver
    const senderKeyPair = generateKeyPair()
    const receiverKeyPair = generateKeyPair()
    
    const message = 'Hello, this is a secret message!'
    
    // Encrypt the message
    const encryptedMessage = encryptMessage(
      message,
      receiverKeyPair.publicKey,
      senderKeyPair.privateKey
    )
    
    // Decrypt the message
    const decryptedMessage = decryptMessage(
      encryptedMessage,
      senderKeyPair.publicKey,
      receiverKeyPair.privateKey
    )
    
    expect(decryptedMessage).toBe(message)
  })

  test('should fail to decrypt with wrong keys', () => {
    // Generate key pairs for sender and receiver
    const senderKeyPair = generateKeyPair()
    const receiverKeyPair = generateKeyPair()
    const wrongKeyPair = generateKeyPair()
    
    const message = 'Hello, this is a secret message!'
    
    // Encrypt the message
    const encryptedMessage = encryptMessage(
      message,
      receiverKeyPair.publicKey,
      senderKeyPair.privateKey
    )
    
    // Try to decrypt with wrong keys - should throw an error
    expect(() => {
      decryptMessage(
        encryptedMessage,
        senderKeyPair.publicKey,
        wrongKeyPair.privateKey
      )
    }).toThrow('Failed to decrypt message')
  })
})