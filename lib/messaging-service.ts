import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore'
import * as nacl from 'tweetnacl'
import { encodeBase64, decodeBase64 } from 'tweetnacl-util'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string // This will be encrypted
  timestamp: any
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: string
  lastMessageTime: any
  unreadCount: number
}

// Generate a new key pair for a user
export const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair()
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey)
  }
}

// Encrypt a message using recipient's public key and sender's private key
export const encryptMessage = (message: string, recipientPublicKey: string, senderPrivateKey: string): string => {
  try {
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
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt message')
  }
}

// Decrypt a message using recipient's private key and sender's public key
export const decryptMessage = (encryptedMessage: string, senderPublicKey: string, recipientPrivateKey: string): string => {
  try {
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
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt message')
  }
}

// Send a new message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  senderPublicKey: string,
  senderPrivateKey: string,
  recipientPublicKey: string
): Promise<string> => {
  try {
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
    
    // Update conversation
    await updateConversation(senderId, receiverId, content)
    
    return messageRef.id
  } catch (error) {
    console.error('Send message error:', error)
    throw new Error('Failed to send message')
  }
}

// Update or create conversation
const updateConversation = async (senderId: string, receiverId: string, lastMessage: string) => {
  try {
    // Check if conversation exists
    const convoQuery = query(
      collection(db!, 'conversations'),
      where('participants', 'array-contains', senderId)
    )
    
    const convoSnapshot = await getDocs(convoQuery)
    let conversationExists = false
    
    for (const doc of convoSnapshot.docs) {
      const data = doc.data()
      if (data.participants.includes(receiverId)) {
        // Update existing conversation
        await updateDoc(doc.ref, {
          lastMessage,
          lastMessageTime: serverTimestamp()
        })
        conversationExists = true
        break
      }
    }
    
    // Create new conversation if it doesn't exist
    if (!conversationExists) {
      await addDoc(collection(db!, 'conversations'), {
        participants: [senderId, receiverId],
        lastMessage,
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      })
    }
  } catch (error) {
    console.error('Update conversation error:', error)
  }
}

// Subscribe to messages between two users
export const subscribeToMessages = (
  userId: string,
  contactId: string,
  senderPrivateKey: string,
  contactPublicKey: string,
  callback: (messages: Message[]) => void
) => {
  if (!db) {
    console.warn('Firestore not initialized')
    return () => {}
  }
  
  const messagesQuery = query(
    collection(db, 'messages'),
    where('senderId', 'in', [userId, contactId]),
    where('receiverId', 'in', [userId, contactId]),
    orderBy('timestamp', 'asc')
  )
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages: Message[] = []
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      try {
        // Decrypt message content
        const decryptedContent = decryptMessage(
          data.content,
          data.senderId === userId ? contactPublicKey : data.senderId, // sender's public key
          senderPrivateKey
        )
        
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: decryptedContent,
          timestamp: data.timestamp,
          read: data.read
        })
      } catch (error) {
        console.error('Failed to decrypt message:', error)
        // Show encrypted content if decryption fails
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: '[Encrypted message]',
          timestamp: data.timestamp,
          read: data.read
        })
      }
    })
    
    callback(messages)
  })
}

// Subscribe to conversations
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  if (!db) {
    console.warn('Firestore not initialized')
    return () => {}
  }
  
  const convoQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  )
  
  return onSnapshot(convoQuery, (snapshot) => {
    const conversations: Conversation[] = []
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      conversations.push({
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime,
        unreadCount: data.unreadCount || 0
      })
    })
    
    callback(conversations)
  })
}

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const messagesQuery = query(
      collection(db!, 'messages'),
      where('receiverId', '==', userId),
      where('read', '==', false),
      limit(50) // Limit to avoid performance issues
    )
    
    const snapshot = await getDocs(messagesQuery)
    const batchUpdates = []
    
    for (const doc of snapshot.docs) {
      batchUpdates.push(updateDoc(doc.ref, { read: true }))
    }
    
    await Promise.all(batchUpdates)
  } catch (error) {
    console.error('Mark messages as read error:', error)
  }
}