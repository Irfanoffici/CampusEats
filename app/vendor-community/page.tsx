'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, MessageCircle, Store, Star, Filter, MoreHorizontal, Send, Paperclip, Smile } from 'lucide-react'
import APITunnel from '@/lib/api-tunnel'

export default function VendorCommunityPage() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'messages' | 'analytics'>('vendors')
  const [vendors, setVendors] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'vendors') {
        // In a real implementation, this would fetch vendors from the API
        setVendors([
          {
            id: '1',
            shopName: 'Campus Cafe',
            description: 'Best coffee and snacks on campus',
            rating: 4.7,
            reviewCount: 124,
            isActive: true,
            avatar: 'https://via.placeholder.com/40'
          },
          {
            id: '2',
            shopName: 'Burger Junction',
            description: 'Gourmet burgers and fries',
            rating: 4.5,
            reviewCount: 98,
            isActive: true,
            avatar: 'https://via.placeholder.com/40'
          },
          {
            id: '3',
            shopName: 'Pizza Palace',
            description: 'Freshly baked pizzas',
            rating: 4.8,
            reviewCount: 156,
            isActive: false,
            avatar: 'https://via.placeholder.com/40'
          }
        ])
      } else if (activeTab === 'messages') {
        // In a real implementation, this would fetch vendor conversations from the API
        setConversations([
          {
            id: '1',
            participants: [
              { id: 'vendor1', shopName: 'Campus Cafe', avatar: 'https://via.placeholder.com/40' },
              { id: 'vendor2', shopName: 'Burger Junction', avatar: 'https://via.placeholder.com/40' }
            ],
            lastMessage: 'Let\'s collaborate on a combo deal',
            lastMessageTime: '2 hours ago',
            unreadCount: 2
          },
          {
            id: '2',
            participants: [
              { id: 'vendor1', shopName: 'Campus Cafe', avatar: 'https://via.placeholder.com/40' },
              { id: 'vendor3', shopName: 'Pizza Palace', avatar: 'https://via.placeholder.com/40' },
              { id: 'vendor4', shopName: 'Sandwich Hub', avatar: 'https://via.placeholder.com/40' }
            ],
            lastMessage: 'Weekly vendor meeting this Friday',
            lastMessageTime: '1 day ago',
            unreadCount: 0
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      // In a real implementation, this would fetch messages from the API
      setMessages([
        {
          id: '1',
          senderId: 'vendor2',
          sender: { shopName: 'Burger Junction', avatar: 'https://via.placeholder.com/40' },
          content: 'Hey, let\'s collaborate on a combo deal',
          timestamp: '2 hours ago',
          read: true
        },
        {
          id: '2',
          senderId: 'current-vendor',
          sender: { shopName: 'Campus Cafe', avatar: 'https://via.placeholder.com/40' },
          content: 'That sounds great! What did you have in mind?',
          timestamp: '1 hour ago',
          read: true
        },
        {
          id: '3',
          senderId: 'vendor2',
          sender: { shopName: 'Burger Junction', avatar: 'https://via.placeholder.com/40' },
          content: 'How about a coffee and burger combo?',
          timestamp: '30 minutes ago',
          read: false
        }
      ])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    try {
      // In a real implementation, this would send the message via the API
      setNewMessage('')
      // Refresh messages
      fetchMessages(selectedConversation.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Community</h1>
          <p className="mt-2 text-gray-600">Connect and collaborate with other vendors</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition duration-200 ${
                    activeTab === 'vendors'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Store className="inline-block mr-2 h-4 w-4" />
                  Vendors
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

              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none bg-white w-full"
                  >
                    <option value="all">All Vendors</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="top-rated">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Content based on active tab */}
              <div className="h-[calc(100vh-200px)] overflow-y-auto">
                {activeTab === 'vendors' && (
                  <div className="p-4">
                    <div className="space-y-4">
                      {vendors.map((vendor) => (
                        <div key={vendor.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                              {vendor.shopName.charAt(0).toUpperCase()}
                            </div>
                            {vendor.isActive && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {vendor.shopName}
                              </p>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-500 ml-1">{vendor.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {vendor.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {vendor.reviewCount} reviews
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
                              {conversation.participants[0]?.shopName.charAt(0).toUpperCase()}
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
                                {conversation.participants.map((p: any) => p.shopName).join(', ')}
                              </p>
                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                {conversation.lastMessageTime}
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
                        {selectedConversation.participants[0]?.shopName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedConversation.participants.map((p: any) => p.shopName).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.participants.length} participants
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
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
                          className={`flex ${message.senderId === 'current-vendor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === 'current-vendor' 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === 'current-vendor' ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp}
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
                  <Store className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Vendor Community</h3>
                  <p className="mt-1 text-gray-500">Connect with other vendors and collaborate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}