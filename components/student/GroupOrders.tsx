'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Share2, Clock, CheckCircle, Copy, ExternalLink, AlertCircle, RefreshCw, Search, Filter, UserPlus, Hash, Lock, Globe } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface GroupOrder {
  id: string
  shareLink: string
  vendor: {
    shopName: string
  }
  totalAmount: number
  participantCount: number
  splitType: string
  createdAt: string
  expiresAt: string
  isFinalized: boolean
}

export default function GroupOrders() {
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupOrder, setNewGroupOrder] = useState({
    participantCount: 3,
    splitType: 'equal',
    groupName: '',
    groupCode: '',
    isPrivate: false
  })
  const [creating, setCreating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, active, finalized
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'friends' | 'invites' | 'create'>('orders')

  useEffect(() => {
    fetchGroupOrders()
  }, [])

  const fetchGroupOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/group-orders')
      if (response.ok) {
        const data = await response.json()
        setGroupOrders(data)
      } else {
        throw new Error('Failed to fetch group orders')
      }
    } catch (error) {
      console.error('Error fetching group orders:', error)
      setError('Failed to load group orders. Please try again.')
      toast.error('Failed to fetch group orders')
    } finally {
      setLoading(false)
    }
  }

  const refreshGroupOrders = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/group-orders')
      if (response.ok) {
        const data = await response.json()
        setGroupOrders(data)
        toast.success('Group orders refreshed')
      } else {
        throw new Error('Failed to refresh group orders')
      }
    } catch (error) {
      console.error('Error refreshing group orders:', error)
      toast.error('Failed to refresh group orders')
    } finally {
      setRefreshing(false)
    }
  }

  const createGroupOrder = async () => {
    if (!newGroupOrder.groupName) {
      toast.error('Please enter a group name')
      return
    }
    
    if (newGroupOrder.participantCount < 2 || newGroupOrder.participantCount > 20) {
      toast.error('Participants must be between 2 and 20')
      return
    }
    
    try {
      setCreating(true)
      
      const response = await fetch('/api/group-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantCount: newGroupOrder.participantCount,
          splitType: newGroupOrder.splitType,
          groupName: newGroupOrder.groupName,
          groupCode: newGroupOrder.groupCode,
          isPrivate: newGroupOrder.isPrivate
        }),
      })

      if (response.ok) {
        const newOrder = await response.json()
        setGroupOrders(prev => [newOrder, ...prev])
        setShowCreateModal(false)
        setNewGroupOrder({
          participantCount: 3,
          splitType: 'equal',
          groupName: '',
          groupCode: '',
          isPrivate: false
        })
        toast.success('Group order created successfully!')
        setActiveSubTab('orders')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create group order')
      }
    } catch (error: any) {
      console.error('Error creating group order:', error)
      toast.error(error.message || 'Failed to create group order')
    } finally {
      setCreating(false)
    }
  }

  const copyShareLink = (shareLink: string) => {
    const fullUrl = `${window.location.origin}/group-order/${shareLink}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Share link copied to clipboard!')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setNewGroupOrder(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'participantCount' ? parseInt(value) : value
    }))
  }

  // Filter and search group orders
  const filteredGroupOrders = groupOrders.filter(order => {
    const matchesSearch = order.vendor.shopName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !order.isFinalized) || 
                         (filter === 'finalized' && order.isFinalized)
    return matchesSearch && matchesFilter
  })

  // Friends component
  const FriendsComponent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-textPrimary">Friends</h2>
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
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <UserPlus size={20} />
            <span>Invite Friends</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((friend) => (
          <div key={friend} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                F{friend}
              </div>
              <div>
                <h3 className="font-bold text-lg">Friend {friend}</h3>
                <p className="text-sm text-gray-600">Online</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Message</button>
              <button className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Invites component
  const InvitesComponent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-textPrimary">Group Invites</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search invites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3].map((invite) => (
          <div key={invite} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Group Order #{invite}</h3>
                <p className="text-gray-600">Vendor Name</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="text-gray-500" size={16} />
                  <span className="text-sm">5 participants</span>
                </div>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Pending</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">Accept</button>
              <button className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Create group component
  const CreateGroupComponent = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-textPrimary mb-6">Create New Group</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            Group Name *
          </label>
          <input
            type="text"
            name="groupName"
            value={newGroupOrder.groupName}
            onChange={handleInputChange}
            placeholder="Enter group name"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            Number of Participants
          </label>
          <input
            type="number"
            name="participantCount"
            min="2"
            max="20"
            value={newGroupOrder.participantCount}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 2, maximum 20 participants</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            Split Type
          </label>
          <select 
            name="splitType"
            value={newGroupOrder.splitType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          >
            <option value="equal">Equal Split</option>
            <option value="custom">Custom Split</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            Group Code (Optional)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="groupCode"
              value={newGroupOrder.groupCode}
              onChange={handleInputChange}
              placeholder="Enter group code"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Create a unique code for others to join</p>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPrivate"
            checked={newGroupOrder.isPrivate}
            onChange={handleInputChange}
            className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Make this group private
          </label>
          {newGroupOrder.isPrivate ? (
            <Lock className="ml-2 text-gray-500" size={16} />
          ) : (
            <Globe className="ml-2 text-gray-500" size={16} />
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setActiveSubTab('orders')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-textPrimary py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={createGroupOrder}
            disabled={creating}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Group Orders</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchGroupOrders}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs for community features */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'orders'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="inline mr-2" size={18} />
          Group Orders
        </button>
        <button
          onClick={() => setActiveSubTab('friends')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'friends'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserPlus className="inline mr-2" size={18} />
          Friends
        </button>
        <button
          onClick={() => setActiveSubTab('invites')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'invites'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Share2 className="inline mr-2" size={18} />
          Invites
        </button>
        <button
          onClick={() => setActiveSubTab('create')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'create'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Plus className="inline mr-2" size={18} />
          Create Group
        </button>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'orders' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-textPrimary">Group Orders</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none bg-white transition"
                >
                  <option value="all">All Orders</option>
                  <option value="active">Active</option>
                  <option value="finalized">Finalized</option>
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshGroupOrders}
                disabled={refreshing}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSubTab('create')}
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Group Order</span>
                <span className="sm:hidden">Create</span>
              </motion.button>
            </div>
          </div>

          {filteredGroupOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-textSecondary mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'No group orders match your search/filter criteria' 
                  : 'No group orders yet'}
              </p>
              <button 
                onClick={() => setActiveSubTab('create')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Create Your First Group Order
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroupOrders.map((groupOrder) => (
                <motion.div
                  key={groupOrder.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-textPrimary">{groupOrder.vendor.shopName}</h3>
                      <p className="text-sm text-textSecondary">Group Order</p>
                    </div>
                    {groupOrder.isFinalized ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <Clock size={24} className="text-yellow-500" />
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Total</span>
                      <span className="font-bold text-primary">{formatCurrency(groupOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Vendor</span>
                      <span className="font-semibold">{groupOrder.vendor.shopName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Participants</span>
                      <span className="font-semibold">{groupOrder.participantCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Split Type</span>
                      <span className="font-semibold capitalize">{groupOrder.splitType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Created</span>
                      <span className="text-sm">{formatDate(new Date(groupOrder.createdAt))}</span>
                    </div>
                    {!groupOrder.isFinalized && (
                      <div className="flex justify-between">
                        <span className="text-textSecondary">Expires</span>
                        <span className="text-sm">{formatDate(new Date(groupOrder.expiresAt))}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(`/group-order/${groupOrder.id}`, '_blank')}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      <ExternalLink size={16} />
                      <span>View Details</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyShareLink(groupOrder.shareLink)}
                      className="p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all duration-300"
                      title="Copy share link"
                    >
                      <Copy size={18} className="text-gray-500 hover:text-primary transition-colors" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeSubTab === 'friends' && <FriendsComponent />}
      {activeSubTab === 'invites' && <InvitesComponent />}
      {activeSubTab === 'create' && <CreateGroupComponent />}

      {/* Create Group Order Modal (deprecated but kept for backward compatibility) */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-textPrimary">Create Group Order</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-textSecondary mb-6">Start a new group order with your friends</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    name="participantCount"
                    min="2"
                    max="20"
                    value={newGroupOrder.participantCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 2, maximum 20 participants</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Split Type
                  </label>
                  <select 
                    name="splitType"
                    value={newGroupOrder.splitType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    <option value="equal">Equal Split</option>
                    <option value="custom">Custom Split</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-textPrimary py-3 rounded-lg font-semibold transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={createGroupOrder}
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}