'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Utensils, Users, FileText, BarChart3, MessageCircle, Users2, TrendingUp, ShoppingCart, CreditCard, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import GroupOrders from '@/components/student/GroupOrders'
import { useSession } from 'next-auth/react'

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'vendors' | 'history' | 'group-orders' | 'invoices' | 'community' | 'messages'>('vendors')
  
  // Mock data for dashboard
  const stats = {
    totalOrders: 24,
    totalSpent: 1240.50,
    favoriteVendor: 'Campus Cafe',
    avgRating: 4.7
  }

  const recentOrders = [
    {
      id: '1',
      vendor: 'Campus Cafe',
      items: '2x Coffee, 1x Sandwich',
      total: 12.50,
      status: 'Delivered',
      date: '2023-06-15'
    },
    {
      id: '2',
      vendor: 'Burger Junction',
      items: '1x Cheeseburger, 1x Fries',
      total: 8.75,
      status: 'Delivered',
      date: '2023-06-14'
    },
    {
      id: '3',
      vendor: 'Pizza Palace',
      items: '1x Margherita Pizza',
      total: 15.00,
      status: 'Delivered',
      date: '2023-06-13'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name || 'Student'}!</h1>
          <p className="mt-2 text-gray-600">Ready to order some delicious food?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Utensils className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.favoriteVendor}</p>
                <p className="text-gray-600">Favorite Vendor</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600 fill-current" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                <p className="text-gray-600">Avg. Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('vendors')}
                className={`flex items-center py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'vendors'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Utensils className="mr-2 h-4 w-4" />
                Restaurants
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Order History
              </button>
              <button
                onClick={() => setActiveTab('group-orders')}
                className={`flex items-center py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'group-orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="mr-2 h-4 w-4" />
                Group Orders
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'invoices'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Invoices
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`flex items-center py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'community'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users2 className="mr-2 h-4 w-4" />
                Community
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Messages
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'vendors' && (
              <div className="text-center py-12">
                <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Browse Restaurants</h3>
                <p className="mt-1 text-gray-500">Discover delicious food options from campus vendors</p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    View Restaurants
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.vendor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.total)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'group-orders' && <GroupOrders />}

            {activeTab === 'invoices' && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Invoices</h3>
                <p className="mt-1 text-gray-500">View and manage your invoices</p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.href = '/invoices'}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    View Invoices
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="text-center py-12">
                <Users2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Campus Community</h3>
                <p className="mt-1 text-gray-500">Connect with friends and join group orders</p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.href = '/community'}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Join Community
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Messages</h3>
                <p className="mt-1 text-gray-500">Chat with friends and vendors</p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.href = '/messenger'}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Open Messenger
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}