'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, MessageCircle, Hash, MoreHorizontal, Send, Paperclip, Smile, Phone, Video, Settings, UserPlus, Bell, Camera, Gift, AtSign, Plus, Home, Utensils, User, Heart, Share2, X } from 'lucide-react'
import APITunnel from '@/lib/api-tunnel'

export default function MessengerPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'groups' | 'discover' | 'feed' | 'profile'>('feed')
  const [friends, setFriends] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [newPost, setNewPost] = useState('')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [isMessengerMode, setIsMessengerMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  useEffect(() => {
    // Listen for messenger mode toggle events
    const handleMessengerModeToggle = (event: CustomEvent) => {
      setIsMessengerMode(event.detail);
    };

    window.addEventListener('messengerModeToggle', handleMessengerModeToggle as EventListener);
    
    // Check initial messenger mode from body class
    setIsMessengerMode(document.body.classList.contains('messenger-mode'));

    return () => {
      window.removeEventListener('messengerModeToggle', handleMessengerModeToggle as EventListener);
    };
  }, []);

  useEffect(() => {
    // Load sample posts for feed
    setPosts([
      {
        id: '1',
        user: { name: 'Alex Johnson', username: 'alexj', avatar: 'AJ' },
        content: 'Just ordered from Campus Cafe! Their coffee is amazing ☕️',
        image: 'https://images.unsplash.com/photo-1554112343-9c0c1d4d9b0a?w=300&h=200&fit=crop',
        likes: 24,
        comments: 5,
        timestamp: '2 hours ago',
        isLiked: false
      },
      {
        id: '2',
        user: { name: 'Sarah Miller', username: 'sarahm', avatar: 'SM' },
        content: 'Group order for Pizza Palace tonight! Who\'s in? 🍕',
        likes: 18,
        comments: 12,
        timestamp: '4 hours ago',
        isLiked: true
      },
      {
        id: '3',
        user: { name: 'Mike Chen', username: 'mikec', avatar: 'MC' },
        content: 'New sushi place on campus is incredible! Highly recommend the salmon rolls 🍣',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
        likes: 32,
        comments: 8,
        timestamp: '1 day ago',
        isLiked: false
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'friends') {
        const response = await APITunnel.getFriends()
        if (response.success) {
          setFriends(response.data || [])
        }
      } else if (activeTab === 'chats') {
        const response = await APITunnel.getConversations()
        if (response.success) {
          setConversations(response.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await APITunnel.getMessages(conversationId)
      if (response.success) {
        setMessages(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    try {
      const response = await APITunnel.sendMessage(selectedConversation.id, newMessage)
      if (response.success) {
        setNewMessage('')
        // Refresh messages
        fetchMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-screen ${isMessengerMode ? 'fixed inset-0 z-50' : 'bg-gray-50'} flex`}
      >
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl"
        >
        {/* Logo and Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 hidden md:block">CampusEats</span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'chats'
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Chats</span>
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Friends</span>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Hash className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Groups</span>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Search className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Discover</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Profile</span>
            </button>
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-900">User Name</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <div className="ml-auto hidden md:block">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'feed' && (
              <div className="p-4">
                {/* Create Post */}
                <div className="mb-6">
                  <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      U
                    </div>
                    <button 
                      onClick={() => setShowNewPostModal(true)}
                      className="flex-1 text-left text-gray-500 bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 transition-colors"
                    >
                      Share what you're ordering...
                    </button>
                  </div>
                </div>
                
                {/* Posts */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Post Header */}
                      <div className="p-4 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {post.user.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{post.user.name}</h3>
                          <p className="text-sm text-gray-500">@{post.user.username} · {post.timestamp}</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      
                      {/* Post Content */}
                      <div className="px-4 pb-3">
                        <p className="text-gray-800">{post.content}</p>
                      </div>
                      
                      {/* Post Image */}
                      {post.image && (
                        <div className="w-full h-64 bg-gray-200">
                          <img 
                            src={post.image} 
                            alt="Post" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Post Actions */}
                      <div className="p-4 flex items-center justify-between border-t border-gray-100">
                        <button 
                          className={`flex items-center space-x-2 ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                          onClick={() => {
                            setPosts(prev => prev.map(p => 
                              p.id === post.id 
                                ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
                                : p
                            ));
                          }}
                        >
                          <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'chats' && (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    onClick={() => handleSelectConversation(conversation)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id 
                        ? 'bg-orange-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {conversation.participants[0]?.username.charAt(0).toUpperCase() || 'G'}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participants.length > 2 
                            ? `${conversation.participants.length} people` 
                            : conversation.participants.map((p: any) => p.fullName).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="p-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {friend.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{friend.username} {friend.isOnline ? '• Online' : '• Offline'}
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="p-4 text-center">
                <Hash className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Groups</h3>
                <p className="mt-1 text-gray-500">Create or join food groups</p>
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </button>
              </div>
            )}

            {activeTab === 'discover' && (
              <div className="p-4 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Discover</h3>
                <p className="mt-1 text-gray-500">Find new friends and groups</p>
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="p-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                      U
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">User Name</h2>
                    <p className="text-gray-600 mb-6">@username</p>
                    
                    <div className="w-full space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Posts</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Friends</span>
                        <span className="font-medium">128</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Group Orders</span>
                        <span className="font-medium">24</span>
                      </div>
                    </div>
                    
                    <button className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
                      Edit Profile
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <Utensils className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Ordered from Pizza Palace</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Joined a group order</p>
                        <p className="text-sm text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedConversation.participants[0]?.username.charAt(0).toUpperCase() || 'G'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedConversation.participants.length > 2 
                        ? `${selectedConversation.participants.length} people` 
                        : selectedConversation.participants.map((p: any) => p.fullName).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.participants.length} participants
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <Video size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.senderId !== 'current-user-id' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'current-user-id' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'current-user-id' ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <Plus size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <Gift size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 mx-2 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-900">Welcome to CampusEats Messenger</h3>
                <p className="mt-2 text-gray-500">Select a conversation to start messaging</p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Friends
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
    </AnimatePresence>
  )
}