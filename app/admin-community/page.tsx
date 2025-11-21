'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, MessageCircle, AlertTriangle, Shield, BarChart3, Filter, MoreHorizontal } from 'lucide-react'
import APITunnel from '@/lib/api-tunnel'

export default function AdminCommunityPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages' | 'reports'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [users, setUsers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch data from the API
      // For now, we'll use placeholder data
      if (activeTab === 'overview') {
        setUsers([
          { id: '1', username: 'user1', fullName: 'User One', role: 'STUDENT', status: 'active', lastSeen: '2 hours ago' },
          { id: '2', username: 'user2', fullName: 'User Two', role: 'VENDOR', status: 'active', lastSeen: '1 hour ago' },
          { id: '3', username: 'user3', fullName: 'User Three', role: 'STUDENT', status: 'suspended', lastSeen: '5 days ago' }
        ])
        setMessages([
          { id: '1', from: 'user1', to: 'user2', content: 'Hello, how are you?', timestamp: '2 hours ago', flagged: false },
          { id: '2', from: 'user2', to: 'user1', content: 'I\'m good, thanks!', timestamp: '1 hour ago', flagged: false },
          { id: '3', from: 'user3', to: 'user1', content: 'This is inappropriate content', timestamp: '30 minutes ago', flagged: true }
        ])
      } else if (activeTab === 'users') {
        setUsers([
          { id: '1', username: 'user1', fullName: 'User One', role: 'STUDENT', status: 'active', lastSeen: '2 hours ago' },
          { id: '2', username: 'user2', fullName: 'User Two', role: 'VENDOR', status: 'active', lastSeen: '1 hour ago' },
          { id: '3', username: 'user3', fullName: 'User Three', role: 'STUDENT', status: 'suspended', lastSeen: '5 days ago' },
          { id: '4', username: 'user4', fullName: 'User Four', role: 'ADMIN', status: 'active', lastSeen: '10 minutes ago' }
        ])
      } else if (activeTab === 'messages') {
        setMessages([
          { id: '1', from: 'user1', to: 'user2', content: 'Hello, how are you?', timestamp: '2 hours ago', flagged: false },
          { id: '2', from: 'user2', to: 'user1', content: 'I\'m good, thanks!', timestamp: '1 hour ago', flagged: false },
          { id: '3', from: 'user3', to: 'user1', content: 'This is inappropriate content', timestamp: '30 minutes ago', flagged: true },
          { id: '4', from: 'user4', to: 'user2', content: 'Admin message for vendor', timestamp: '15 minutes ago', flagged: false }
        ])
      } else if (activeTab === 'reports') {
        setReports([
          { id: '1', reporter: 'user1', reported: 'user3', reason: 'Inappropriate content', status: 'pending', timestamp: '1 hour ago' },
          { id: '2', reporter: 'user2', reported: 'user4', reason: 'Spam', status: 'resolved', timestamp: '2 days ago' }
        ])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      // In a real implementation, this would call the API to suspend the user
      console.log(`Suspending user ${userId}`)
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error suspending user:', error)
    }
  }

  const handleResolveReport = async (reportId: string) => {
    try {
      // In a real implementation, this would call the API to resolve the report
      console.log(`Resolving report ${reportId}`)
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error resolving report:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
          <p className="mt-2 text-gray-600">Monitor and manage community interactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center py-4 px-6 font-medium transition duration-200 ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center py-4 px-6 font-medium transition duration-200 ${
                activeTab === 'users'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center py-4 px-6 font-medium transition duration-200 ${
                activeTab === 'messages'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center py-4 px-6 font-medium transition duration-200 ${
                activeTab === 'reports'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reports
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
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
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="text-white" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">1,248</p>
                      <p className="text-gray-600">Total Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">5,621</p>
                      <p className="text-gray-600">Messages Today</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="text-white" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-gray-600">Pending Reports</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'VENDOR' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastSeen}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className={`${
                              user.status === 'active' 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 rounded-lg border ${
                      message.flagged 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {message.from.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {message.from} → {message.to}
                          </p>
                          <p className="text-xs text-gray-500">{message.timestamp}</p>
                        </div>
                      </div>
                      {message.flagged && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{message.content}</p>
                    <div className="mt-3 flex justify-end">
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {report.reporter.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 text-sm font-medium text-gray-900">
                              {report.reporter}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {report.reported.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 text-sm font-medium text-gray-900">
                              {report.reported}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            disabled={report.status === 'resolved'}
                            className={`${
                              report.status === 'pending' 
                                ? 'text-green-600 hover:text-green-900' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}