'use client'

import { useState } from 'react'
import { Users, MessageCircle, Shield, BarChart3, Search, UserPlus, AlertTriangle, CheckCircle, XCircle, Eye, TrendingUp, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function CommunityMonitoring() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'reports' | 'monitoring'>('overview')

  // Mock community data
  const communityStats = {
    totalUsers: 1240,
    totalVendors: 24,
    activeGroups: 42,
    totalMessages: 12500,
    flaggedContent: 3,
    reportedUsers: 2
  }

  // Mock messages
  const messages = [
    { id: 1, user: 'John Doe', message: 'Great service!', time: '2 hours ago', status: 'normal' },
    { id: 2, user: 'Jane Smith', message: 'This is inappropriate content', time: '1 hour ago', status: 'flagged' },
    { id: 3, user: 'Mike Johnson', message: 'Love the new features!', time: '30 mins ago', status: 'normal' },
  ]

  // Mock reports
  const reports = [
    { id: 1, reporter: 'User123', reported: 'Vendor456', reason: 'Inappropriate behavior', status: 'pending', time: '2 hours ago' },
    { id: 2, reporter: 'User456', reported: 'User789', reason: 'Spam content', status: 'resolved', time: '1 day ago' },
  ]

  // Mock monitoring data
  const monitoringData = [
    { id: 1, user: 'User123', activity: 'Excessive messaging', risk: 'high', time: '10 mins ago' },
    { id: 2, user: 'Vendor456', activity: 'Unusual order pattern', risk: 'medium', time: '30 mins ago' },
    { id: 3, user: 'User789', activity: 'Multiple failed payments', risk: 'high', time: '1 hour ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-textPrimary">Community Monitoring</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search community..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="inline mr-2" size={18} />
          Overview
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
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'reports'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className="inline mr-2" size={18} />
          Reports
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'monitoring'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Eye className="inline mr-2" size={18} />
          Real-time Monitoring
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.totalUsers}</p>
                  <p className="text-gray-600">Total Users</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.totalVendors}</p>
                  <p className="text-gray-600">Total Vendors</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.activeGroups}</p>
                  <p className="text-gray-600">Active Groups</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{communityStats.flaggedContent + communityStats.reportedUsers}</p>
                  <p className="text-gray-600">Issues Reported</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Recent Community Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-gray-600">User123 joined the community</p>
                </div>
                <div className="text-sm text-gray-500">5 mins ago</div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New group created</p>
                  <p className="text-sm text-gray-600">Lunch Group #42 was created</p>
                </div>
                <div className="text-sm text-gray-500">15 mins ago</div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-yellow-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Content flagged</p>
                  <p className="text-sm text-gray-600">Inappropriate message reported</p>
                </div>
                <div className="text-sm text-gray-500">30 mins ago</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold">Community Messages</h3>
            <p className="text-gray-600">Monitor and moderate community conversations</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {message.user.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{message.user}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{message.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {message.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.status === 'flagged' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Flagged
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Review</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold">User Reports</h3>
            <p className="text-gray-600">Manage reported content and user complaints</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.reporter}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.reported}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.status === 'pending' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Investigate</button>
                      <button className="text-green-600 hover:text-green-900 mr-3">Resolve</button>
                      <button className="text-red-600 hover:text-red-900">Ban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Real-time Monitoring</h3>
            <p className="text-gray-600 mb-6">Active monitoring of suspicious activities and potential violations</p>
            
            <div className="space-y-4">
              {monitoringData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{item.user}</p>
                      <p className="text-sm text-gray-600">{item.activity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.risk === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : item.risk === 'medium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)} Risk
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{item.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Eye size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium">Messaging System</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Operational</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium">Community Features</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Operational</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-600" size={20} />
                  <span className="font-medium">Monitoring System</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Degraded Performance</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}