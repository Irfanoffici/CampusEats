'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, UserPlus, MessageCircle, Users, Hash, MoreHorizontal, Send, Paperclip, Smile, Phone, Video } from 'lucide-react'
import APITunnel from '@/lib/api-tunnel'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'friends' | 'messages' | 'groups'>('friends')
  const [friends, setFriends] = useState<any[]>([])
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'friends') {
        const friendsResponse = await APITunnel.getFriends()
        const requestsResponse = await APITunnel.getFriendRequests()
        
        if (friendsResponse.success) {
          setFriends(friendsResponse.data || [])
        }
        
        if (requestsResponse.success) {
          setFriendRequests(requestsResponse.data || [])
        }
      } else if (activeTab === 'messages') {
        const conversationsResponse = await APITunnel.getConversations()
        
        if (conversationsResponse.success) {
          setConversations(conversationsResponse.data || [])
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

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await APITunnel.acceptFriendRequest(requestId)
      if (response.success) {
        // Refresh data
        fetchData()
      }
    } catch (error) {
      console.error('Error accepting friend request:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await APITunnel.rejectFriendRequest(requestId)
      if (response.success) {
        // Refresh data
        fetchData()
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error)
    }
  }

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                    activeTab === 'friends'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="inline-block mr-2 h-4 w-4" />
                  Friends
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                    activeTab === 'messages'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle className="inline-block mr-2 h-4 w-4" />
                  Messages
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Content based on active tab */}
              <div className="h-[calc(100vh-200px)] overflow-y-auto">
                {activeTab === 'friends' && (
                  <div className="p-4">
                    {friendRequests.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Friend Requests
                        </h3>
                        <div className="space-y-3">
                          {friendRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {request.fromUser.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {request.fromUser.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    @{request.fromUser.username}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAcceptRequest(request.id)}
                                  className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Friends
                    </h3>
                    <div className="space-y-3">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
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
                  </div>
                )}

                {activeTab === 'messages' && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {conversations.map((conversation) => (
                        <div 
                          key={conversation.id} 
                          onClick={() => handleSelectConversation(conversation)}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation?.id === conversation.id 
                              ? 'bg-orange-50 border border-orange-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                              {conversation.participants[0]?.username.charAt(0).toUpperCase()}
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
                                {conversation.participants.map((p: any) => p.fullName).join(', ')}
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            {activeTab === 'messages' ? (
              selectedConversation ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-100px)] flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedConversation.participants[0]?.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedConversation.participants.map((p: any) => p.fullName).join(', ')}
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
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <Paperclip size={20} />
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
                        className="flex-1 mx-2 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-100px)] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No conversation selected</h3>
                    <p className="mt-1 text-gray-500">Select a conversation from the list to start messaging</p>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-100px)] flex items-center justify-center">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Friends Community</h3>
                  <p className="mt-1 text-gray-500">Connect with your friends and start conversations</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}