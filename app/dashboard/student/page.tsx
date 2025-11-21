'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import VendorGrid from '@/components/student/VendorGrid'
import CartDrawer from '@/components/student/CartDrawer'
import OrderHistory from '@/components/student/OrderHistory'
import GroupOrders from '@/components/student/GroupOrders'
import Invoices from '@/components/student/Invoices'
import { ShoppingCart, LogOut, History, Wallet, Users, FileText, MessageCircle, Users2, UserPlus, Search } from 'lucide-react'
import { db } from '@/lib/firebase'
import { generateKeyPair, subscribeToMessages, subscribeToConversations, sendMessage, markMessagesAsRead } from '@/lib/messaging-service'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  vendorId?: string
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: any
  read: boolean
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage: string
  lastMessageTime: any
  unreadCount: number
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'vendors' | 'history' | 'group-orders' | 'invoices' | 'community' | 'messages'>('vendors')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Messaging states
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [userKeyPair, setUserKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null)
  const [contactPublicKey, setContactPublicKey] = useState<string>('')

  // Handle tab parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['vendors', 'history', 'group-orders', 'invoices', 'community', 'messages'].includes(tab)) {
      setActiveTab(tab as 'vendors' | 'history' | 'group-orders' | 'invoices' | 'community' | 'messages')
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.role === 'STUDENT') {
      fetchBalance()
      // Store user role in localStorage for navigation
      localStorage.setItem('userRole', 'STUDENT')
      
      // Generate key pair for encryption
      const keyPair = generateKeyPair()
      setUserKeyPair(keyPair)
      // In a real app, you would save the public key to the database
      // and retrieve contact public keys from the database
    }
  }, [session])

  // Subscribe to conversations
  useEffect(() => {
    if (!session?.user.id || !db) return
    
    const unsubscribe = subscribeToConversations(session.user.id, (convoList) => {
      setConversations(convoList)
      if (convoList.length > 0 && !currentConversation) {
        setCurrentConversation(convoList[0])
      }
    })
    
    return () => unsubscribe()
  }, [session?.user.id, currentConversation])

  // Subscribe to messages in current conversation
  useEffect(() => {
    if (!session?.user.id || !currentConversation || !userKeyPair) return
    
    // In a real app, you would fetch the contact's public key from the database
    // For demo purposes, we'll use a placeholder
    const contactId = currentConversation.participants.find(id => id !== session.user.id) || ''
    
    const unsubscribe = subscribeToMessages(
      session.user.id,
      contactId,
      userKeyPair.privateKey,
      contactPublicKey, // This would come from the database in a real app
      (messageList) => {
        setMessages(messageList)
      }
    )
    
    return () => unsubscribe()
  }, [session?.user.id, currentConversation, userKeyPair, contactPublicKey])

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/balance')
      const data = await res.json()
      setBalance(data.rfidBalance)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast.success(`${item.name} added to cart`)
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || !session?.user.id || !userKeyPair) return
    
    try {
      // In a real app, you would fetch the contact's public key from the database
      const contactId = currentConversation.participants.find(id => id !== session.user.id) || ''
      
      await sendMessage(
        session.user.id,
        contactId,
        newMessage,
        userKeyPair.publicKey,
        userKeyPair.privateKey,
        contactPublicKey // This would come from the database in a real app
      )
      
      setNewMessage('')
      toast.success('Message sent!')
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Community component
  const Community = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-textPrimary">Community</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
            <UserPlus size={20} />
            <span>Invite Friends</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Friends</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((friend) => (
              <div key={friend} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  F{friend}
                </div>
                <div>
                  <p className="font-medium">Friend {friend}</p>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Invites */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Group Invites</h3>
          <div className="space-y-4">
            {[1, 2].map((invite) => (
              <div key={invite} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">Group Order #{invite}</h4>
                    <p className="text-sm text-gray-600">Vendor Name</p>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Pending</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-green-500 text-white py-1.5 rounded text-sm">Accept</button>
                  <button className="flex-1 bg-gray-200 text-gray-800 py-1.5 rounded text-sm">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users2 className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-sm"><span className="font-bold">John Doe</span> created a new group order</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="text-green-600" size={16} />
              </div>
              <div>
                <p className="text-sm"><span className="font-bold">Jane Smith</span> sent you a message</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <UserPlus className="text-purple-600" size={16} />
              </div>
              <div>
                <p className="text-sm"><span className="font-bold">Mike Johnson</span> joined CampusEats</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Messages component with end-to-end encryption
  const Messages = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-textPrimary">Messages</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold">Conversations</h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {conversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className={`flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  currentConversation?.id === conversation.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setCurrentConversation(conversation)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {conversation.participants[0].charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {conversation.participants.find(id => id !== session?.user.id) || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {conversation.lastMessageTime?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold">
                  {currentConversation.participants.find(id => id !== session?.user.id) || 'User'}
                </h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.senderId === session?.user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`rounded-lg p-3 max-w-xs ${
                        message.senderId === session?.user.id 
                          ? 'bg-primary text-white' 
                          : 'bg-white'
                      }`}>
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === session?.user.id 
                            ? 'text-white/70' 
                            : 'text-gray-400'
                        }`}>
                          {message.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient">CampusEats</h1>
              <p className="text-sm text-textSecondary hidden sm:block">Welcome, {session?.user?.name}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* RFID Balance */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <Wallet size={16} className="sm:size-20" />
                <div className="text-right">
                  <p className="text-xs opacity-90 hidden xs:block">RFID Balance</p>
                  <p className="font-bold text-sm xs:text-base">{balance !== null ? formatCurrency(balance) : '...'}</p>
                </div>
              </motion.div>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCart(true)}
                className="relative bg-primary text-white p-2 sm:p-3 rounded-full shadow-lg"
              >
                <ShoppingCart size={20} className="sm:size-24" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-500 text-white p-2 sm:p-3 rounded-full"
              >
                <LogOut size={16} className="sm:size-20" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mt-4 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`pb-2 px-3 sm:px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'vendors'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary'
              }`}
            >
              Browse Vendors
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`pb-2 px-3 sm:px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'community'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary'
              }`}
            >
              Community
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-2 px-3 sm:px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('group-orders')}
              className={`pb-2 px-3 sm:px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'group-orders'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary'
              }`}
            >
              Group Orders
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-2 px-3 sm:px-4 font-medium transition whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary'
              }`}
            >
              Invoices
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'vendors' ? (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VendorGrid onAddToCart={addToCart} />
            </motion.div>
          ) : activeTab === 'community' ? (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Community />
            </motion.div>
          ) : activeTab === 'messages' ? (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Messages />
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OrderHistory />
            </motion.div>
          ) : activeTab === 'group-orders' ? (
            <motion.div
              key="group-orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GroupOrders />
            </motion.div>
          ) : (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Invoices />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        total={cartTotal}
        balance={balance || 0}
        onOrderComplete={() => {
          fetchBalance()
          setActiveTab('history')
        }}
      />
    </div>
  )
}