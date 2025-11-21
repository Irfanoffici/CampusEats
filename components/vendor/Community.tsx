'use client'

import { useState } from 'react'
import { Users, MessageCircle, BarChart3, Search, UserPlus, Hash, TrendingUp, Award, Star, Send } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function VendorCommunity() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'vendors' | 'messages' | 'analytics'>('vendors')
  const [newMessage, setNewMessage] = useState('')

  // Mock vendor data
  const vendors = [
    { id: 1, name: 'Campus Cafe', rating: 4.8, orders: 124, revenue: 15420 },
    { id: 2, name: 'Burger Junction', rating: 4.6, orders: 98, revenue: 12350 },
    { id: 3, name: 'Pizza Palace', rating: 4.9, orders: 156, revenue: 18750 },
    { id: 4, name: 'Sandwich Hub', rating: 4.5, orders: 87, revenue: 9800 },
    { id: 5, name: 'Juice Corner', rating: 4.7, orders: 142, revenue: 11200 },
    { id: 6, name: 'Snack Station', rating: 4.4, orders: 76, revenue: 8500 },
  ]

  // Mock messages
  const messages = [
    { id: 1, vendor: 'Campus Cafe', message: 'Great collaboration on the combo offer!', time: '2 hours ago' },
    { id: 2, vendor: 'Burger Junction', message: 'Can we discuss the weekend pricing?', time: '5 hours ago' },
    { id: 3, vendor: 'Pizza Palace', message: 'New recipe for the summer menu?', time: '1 day ago' },
  ]

  // Mock analytics data
  const analytics = {
    totalVendors: 24,
    avgRating: 4.6,
    totalOrders: 1240,
    totalRevenue: 156000,
    topPerformers: [
      { name: 'Pizza Palace', revenue: 32000, change: '+12%' },
      { name: 'Campus Cafe', revenue: 28500, change: '+8%' },
      { name: 'Burger Junction', revenue: 24500, change: '+5%' },
    ]
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to Firebase
      console.log('Sending message:', newMessage)
      setNewMessage('')
      // Show success feedback
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-textPrimary">Vendor Community</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
            <UserPlus size={20} />
            <span>Invite Vendor</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'vendors'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="inline mr-2" size={18} />
          All Vendors
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'messages'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageCircle className="inline mr-2" size={18} />
          Messages
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'analytics'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="inline mr-2" size={18} />
          Community Analytics
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{vendor.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="text-yellow-500 fill-current" size={16} />
                    <span className="text-sm font-medium">{vendor.rating}</span>
                    <span className="text-gray-500 text-sm">({vendor.orders} orders)</span>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-primary">{formatCurrency(vendor.revenue)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium">Message</button>
                <button className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg text-sm font-medium">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Conversations sidebar */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold">Vendor Conversations</h3>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {vendors.slice(0, 5).map((vendor) => (
                <div key={vendor.id} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{vendor.name}</p>
                    <p className="text-sm text-gray-500 truncate">Last message...</p>
                  </div>
                  <div className="text-xs text-gray-400">10:30</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold">Campus Cafe</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-3 max-w-xs">
                    <p>Hello there! How are you doing with the new menu items?</p>
                    <p className="text-xs text-gray-400 mt-1">10:30 AM</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-lg p-3 max-w-xs">
                    <p>They're doing great! Customers love the new options.</p>
                    <p className="text-xs text-white/70 mt-1">10:32 AM</p>
                  </div>
                </div>
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
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalVendors}</p>
                  <p className="text-gray-600">Total Vendors</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="text-yellow-600 fill-current" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.avgRating}</p>
                  <p className="text-gray-600">Avg. Rating</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                  <p className="text-gray-600">Total Orders</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                  <p className="text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Top Performing Vendors</h3>
            <div className="space-y-4">
              {analytics.topPerformers.map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold">{vendor.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(vendor.revenue)}</p>
                    <p className="text-sm text-green-600">{vendor.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}