'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  LogOut, Users, Store, ShoppingBag, TrendingUp, Wallet, DollarSign, 
  Package, Clock, CheckCircle, Plus, Edit, Trash2, X, Bell, Star, MessageSquare,
  CreditCard, Zap
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import APITunnel from '@/lib/api-tunnel'
import NotificationService from '@/lib/notifications'

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalStudents: number
  totalVendors: number
  activeOrders: number
}

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  totalAmount: number
  orderStatus: string
  pickupCode: string
  paymentMethod: string
  paymentStatus: string
  items: string
  student: {
    fullName: string
    phoneNumber: string
  }
  vendor: {
    shopName: string
  }
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  preparationTime: number
  imageUrl: string
  isAvailable: boolean
  vendorId: string
}

interface Vendor {
  id: string
  shopName: string
  description: string
  imageUrl: string
  averageRating: number
  totalReviews: number
  isActive: boolean
  openingHours: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalStudents: 0,
    totalVendors: 0,
    activeOrders: 0,
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [rfidNumber, setRfidNumber] = useState('')
  const [creditAmount, setCreditAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'vendors' | 'menu' | 'reviews'>('overview')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showRfidModal, setShowRfidModal] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'LUNCH',
    preparationTime: '15',
    imageUrl: '',
    vendorId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/dashboard')
    } else {
      fetchAllData()
    }
  }, [session, status, router])

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchVendors(),
      selectedVendor && fetchMenuItems()
    ])
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Use API Tunnel for reliable communication
      console.log('[Admin Dashboard] Fetching orders...')
      const ordersResponse = await APITunnel.getOrders()
      console.log('[Admin Dashboard] Orders response:', ordersResponse)
      
      const ordersData = ordersResponse.success ? ordersResponse.data : []
      console.log('[Admin Dashboard] Orders data:', ordersData)
      console.log('[Admin Dashboard] Orders count:', ordersData.length)
      
      setOrders(Array.isArray(ordersData) ? ordersData : [])

      // Get actual counts from database
      const usersResponse = await APITunnel.get('/api/users')
      let studentCount = 3, vendorCount = 4 // fallback
      
      if (usersResponse.success) {
        const users = usersResponse.data
        studentCount = users.filter((u: any) => u.role === 'STUDENT').length
        vendorCount = users.filter((u: any) => u.role === 'VENDOR').length
      }

      setStats({
        totalOrders: ordersData.length,
        totalRevenue: ordersData.reduce((sum: number, o: Order) => sum + o.totalAmount, 0),
        totalStudents: studentCount,
        totalVendors: vendorCount,
        activeOrders: ordersData.filter((o: Order) => !['PICKED_UP', 'CANCELLED'].includes(o.orderStatus)).length,
      })
      
      console.log('[Admin Dashboard] Orders state set successfully')
    } catch (error) {
      console.error('[Admin Dashboard] Error fetching stats:', error)
      NotificationService.error('Failed to load statistics')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await APITunnel.getVendors()
      if (response.success) {
        setVendors(Array.isArray(response.data) ? response.data : [])
      } else {
        NotificationService.error('Failed to load vendors')
        setVendors([])
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      NotificationService.error('Failed to load vendors')
      setVendors([])
    }
  }

  const fetchMenuItems = async (vendorId?: string) => {
    try {
      const id = vendorId || selectedVendor
      if (!id) {
        setMenuItems([])
        return
      }
      
      const response = await APITunnel.getMenuItems(id)
      if (response.success) {
        setMenuItems(Array.isArray(response.data) ? response.data : [])
      } else {
        NotificationService.error('Failed to load menu items')
        setMenuItems([])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      NotificationService.error('Failed to load menu items')
      setMenuItems([])
    }
  }

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!menuForm.vendorId) {
      toast.error('Please select a vendor')
      return
    }

    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm),
      })

      if (!res.ok) throw new Error('Failed to add item')

      toast.success('Menu item added successfully')
      setShowAddMenu(false)
      resetMenuForm()
      fetchMenuItems(menuForm.vendorId)
    } catch (error) {
      toast.error('Failed to add menu item')
    }
  }

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      const res = await fetch('/api/menu-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...menuForm, id: editingItem.id }),
      })

      if (!res.ok) throw new Error('Failed to update item')

      toast.success('Menu item updated successfully')
      setEditingItem(null)
      resetMenuForm()
      fetchMenuItems(menuForm.vendorId)
    } catch (error) {
      toast.error('Failed to update menu item')
    }
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/menu-items?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete item')

      toast.success('Menu item deleted')
      fetchMenuItems()
    } catch (error) {
      toast.error('Failed to delete menu item')
    }
  }

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item)
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      imageUrl: item.imageUrl,
      vendorId: item.vendorId
    })
  }

  const resetMenuForm = () => {
    setMenuForm({
      name: '',
      description: '',
      price: '',
      category: 'LUNCH',
      preparationTime: '15',
      imageUrl: '',
      vendorId: selectedVendor
    })
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await APITunnel.updateOrderStatus(orderId, newStatus)
      
      if (response.success) {
        NotificationService.success('Order status updated successfully!')
        
        // Send appropriate notification based on status
        const order = orders.find(o => o.id === orderId)
        if (order) {
          switch(newStatus) {
            case 'CONFIRMED':
              NotificationService.orderConfirmed(order.orderNumber)
              break
            case 'PREPARING':
              NotificationService.orderPreparing(order.orderNumber)
              break
            case 'READY':
              NotificationService.orderReady(order.orderNumber)
              break
            case 'PICKED_UP':
              NotificationService.orderPickedUp(order.orderNumber)
              break
            case 'CANCELLED':
              NotificationService.orderCancelled(order.orderNumber)
              break
          }
        }
        
        fetchStats()
      } else {
        NotificationService.error(response.error || 'Failed to update status')
      }
    } catch (error) {
      NotificationService.error('Failed to update order status')
    }
  }

  const handleCreditRFID = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rfidNumber || !creditAmount) {
      NotificationService.error('Please fill all fields')
      return
    }

    try {
      const response = await fetch('/api/rfid/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfidNumber, 
          amount: parseFloat(creditAmount) 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        NotificationService.error(data.error || 'Failed to credit RFID')
        return
      }

      NotificationService.success(
        `✅ Credited ₹${data.user.creditedAmount} to ${data.user.fullName}! New balance: ₹${data.user.newBalance}`
      )
      setRfidNumber('')
      setCreditAmount('')
      setShowRfidModal(false)
    } catch (error) {
      NotificationService.error('Failed to credit balance')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
              <p className="text-sm text-textSecondary">System Administration</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut({ callbackUrl: '/', redirect: true })}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
              title="Logout"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Star size={18} />
            Reviews & Feedback
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`pb-3 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'vendors'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Manage Vendors
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'menu'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Menu Management
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                  <ShoppingBag size={24} className="opacity-80" />
                </div>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-blue-100 mt-1">All time</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                  <DollarSign size={24} className="opacity-80" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-green-100 mt-1">Collected</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-100 text-sm font-medium">Students</p>
                  <Users size={24} className="opacity-80" />
                </div>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-purple-100 mt-1">Active users</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm font-medium">Vendors</p>
                  <Store size={24} className="opacity-80" />
                </div>
                <p className="text-3xl font-bold">{stats.totalVendors}</p>
                <p className="text-sm text-orange-100 mt-1">Partners</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-pink-100 text-sm font-medium">Active Orders</p>
                  <Clock size={24} className="opacity-80" />
                </div>
                <p className="text-3xl font-bold">{stats.activeOrders}</p>
                <p className="text-sm text-pink-100 mt-1">In progress</p>
              </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <Wallet className="text-primary" />
                  RFID Management
                </h2>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-textSecondary mb-1">Quick RFID Credit</p>
                      <p className="text-lg font-semibold text-textPrimary">Top-up student balances</p>
                    </div>
                    <CreditCard size={40} className="text-green-600" />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRfidModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Credit RFID Balance
                </motion.button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-textSecondary mb-3">Quick Amount Presets:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map((amount) => (
                      <div
                        key={amount}
                        className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold text-center"
                      >
                        ₹{amount}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-textPrimary mb-6">Quick Analytics</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Package className="text-white" size={20} />
                      </div>
                      <span className="font-medium text-textPrimary">Active Orders</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stats.activeOrders}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-white" size={20} />
                      </div>
                      <span className="font-medium text-textPrimary">Completed</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.totalOrders - stats.activeOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="text-white" size={20} />
                      </div>
                      <span className="font-medium text-textPrimary">Avg Order Value</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats.totalOrders > 0
                        ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                        : formatCurrency(0)}
                    </span>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <p className="text-sm text-textSecondary mb-2">System Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-textPrimary">All Systems Operational</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          /* Orders Management Tab with Full Control */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-textPrimary">Order Management</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-textSecondary">
                  Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-textSecondary">No orders yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order: any) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2 flex-wrap">
                          Order #{order.orderNumber}
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              order.orderStatus === 'PICKED_UP' || order.orderStatus === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : order.orderStatus === 'READY'
                                ? 'bg-blue-100 text-blue-700'
                                : order.orderStatus === 'PREPARING'
                                ? 'bg-orange-100 text-orange-700'
                                : order.orderStatus === 'CANCELLED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.orderStatus.replace('_', ' ')}
                          </span>
                        </h3>
                        <p className="text-sm text-textSecondary mt-1">
                          {order.student?.fullName} • {order.vendor?.shopName}
                        </p>
                        <p className="text-xs text-textSecondary mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-textSecondary mt-1">
                          {order.paymentMethod} • {order.paymentStatus}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-textSecondary mb-2">Items:</p>
                        <div className="space-y-1">
                          {JSON.parse(order.items).map((item: any, idx: number) => (
                            <div key={idx} className="text-sm flex justify-between bg-gray-50 px-3 py-2 rounded">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-semibold">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-textSecondary mb-2">Pickup Code:</p>
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-lg p-4 mb-3">
                          <p className="text-3xl font-bold text-primary font-mono text-center tracking-wider">
                            {order.pickupCode}
                          </p>
                        </div>
                        
                        {/* Admin Order Control Buttons */}
                        {!['PICKED_UP', 'COMPLETED', 'CANCELLED'].includes(order.orderStatus) && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-textSecondary mb-2">Update Status:</p>
                            {order.orderStatus === 'PLACED' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                              >
                                ✓ Confirm Order
                              </button>
                            )}
                            {order.orderStatus === 'CONFIRMED' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                              >
                                🍳 Start Preparing
                              </button>
                            )}
                            {order.orderStatus === 'PREPARING' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'READY')}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                              >
                                ✓ Mark as Ready
                              </button>
                            )}
                            {order.orderStatus === 'READY' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                              >
                                ✓ Mark as Picked Up
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this order?')) {
                                  updateOrderStatus(order.id, 'CANCELLED')
                                }
                              }}
                              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                            >
                              ✕ Cancel Order
                            </button>
                          </div>
                        )}
                        
                        {(order.orderStatus === 'PICKED_UP' || order.orderStatus === 'COMPLETED') && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p className="text-sm font-semibold text-green-700">✓ Completed</p>
                          </div>
                        )}
                        
                        {order.orderStatus === 'CANCELLED' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <p className="text-sm font-semibold text-red-700">✕ Cancelled</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                <Star className="text-yellow-500" />
                Reviews & Feedback
              </h2>
              <div className="text-sm text-textSecondary">
                All customer feedback
              </div>
            </div>

            {/* Fetch and display reviews */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Star size={64} className="mx-auto text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-textPrimary mb-2">Reviews Coming Soon!</h3>
              <p className="text-textSecondary">
                Customer reviews and ratings will be displayed here. Students can rate orders after completion.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-textPrimary">Vendor Management</h2>
              <div className="text-sm text-textSecondary">
                {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
              </div>
            </div>

            {vendors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Store size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-textSecondary">No vendors found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                      <img
                        src={vendor.imageUrl}
                        alt={vendor.shopName}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        vendor.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-textPrimary mb-2">{vendor.shopName}</h3>
                      <p className="text-sm text-textSecondary mb-4 line-clamp-2">{vendor.description}</p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${
                              i < Math.floor(vendor.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-textSecondary">
                          {vendor.averageRating.toFixed(1)} ({vendor.totalReviews} reviews)
                        </span>
                      </div>

                      <div className="text-xs text-textSecondary mb-4">
                        <Clock size={14} className="inline mr-1" />
                        {vendor.openingHours}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedVendor(vendor.id)
                          setActiveTab('menu')
                          fetchMenuItems(vendor.id)
                        }}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        Manage Menu
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-textPrimary">Menu Management</h2>
                <p className="text-sm text-textSecondary mt-1">
                  {selectedVendor ? vendors.find(v => v.id === selectedVendor)?.shopName : 'Select a vendor'}
                </p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedVendor}
                  onChange={(e) => {
                    setSelectedVendor(e.target.value)
                    fetchMenuItems(e.target.value)
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.shopName}
                    </option>
                  ))}
                </select>
                
                {selectedVendor && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setMenuForm({ ...menuForm, vendorId: selectedVendor })
                      setShowAddMenu(true)
                    }}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition whitespace-nowrap"
                  >
                    <Plus size={20} />
                    Add Item
                  </motion.button>
                )}
              </div>
            </div>

            {!selectedVendor ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-textSecondary">Please select a vendor to manage their menu</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-textSecondary mb-4">No menu items yet</p>
                <button
                  onClick={() => {
                    setMenuForm({ ...menuForm, vendorId: selectedVendor })
                    setShowAddMenu(true)
                  }}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-textPrimary">{item.name}</h3>
                          <p className="text-xs text-textSecondary bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                            {item.category}
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                      </div>
                      <p className="text-sm text-textSecondary mb-3 line-clamp-2">{item.description}</p>
                      <p className="text-xs text-textSecondary mb-4">Prep time: {item.preparationTime} min</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Menu Item Modal */}
        {(showAddMenu || editingItem) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-textPrimary">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddMenu(false)
                    setEditingItem(null)
                    resetMenuForm()
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={editingItem ? handleUpdateMenuItem : handleAddMenuItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Item Name</label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., Masala Dosa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Description</label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Delicious crispy dosa..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="40"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Prep Time (min)</label>
                    <input
                      type="number"
                      value={menuForm.preparationTime}
                      onChange={(e) => setMenuForm({ ...menuForm, preparationTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="15"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="SNACKS">Snacks</option>
                    <option value="BEVERAGES">Beverages</option>
                    <option value="DESSERTS">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    value={menuForm.imageUrl}
                    onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMenu(false)
                      setEditingItem(null)
                      resetMenuForm()
                    }}
                    className="flex-1 border border-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 flex flex-col-reverse gap-3 z-50">
        {/* Main FAB - Always visible */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.5
          }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="bg-gradient-to-r from-primary to-secondary text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-primary/50 transition-all"
          title="Quick Actions"
        >
          <Zap size={20} className="sm:w-6 sm:h-6" />
        </motion.button>

        {/* Secondary FABs */}
        <AnimatePresence>
          {isFabOpen && (
            <>
              {/* RFID Credit Button */}
              <motion.button
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0, 
                  opacity: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: 0.1
                  }
                }}
                exit={{ 
                  scale: 0, 
                  rotate: 90, 
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ 
                  scale: 1.15,
                  rotate: [0, -10, 10, -10, 0],
                  transition: { duration: 0.5 }
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowRfidModal(true)
                  setIsFabOpen(false)
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all"
                title="Credit RFID Balance"
              >
                <CreditCard size={20} className="sm:w-6 sm:h-6" />
              </motion.button>

              {/* Refresh Data Button */}
              <motion.button
                initial={{ scale: 0, rotate: 90, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0, 
                  opacity: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: 0.2
                  }
                }}
                exit={{ 
                  scale: 0, 
                  rotate: -90, 
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ 
                  scale: 1.15,
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  fetchAllData()
                  NotificationService.success('Data refreshed!')
                  setIsFabOpen(false)
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all"
                title="Refresh All Data"
              >
                <Bell size={20} className="sm:w-6 sm:h-6" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* RFID Credit Modal */}
      {showRfidModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRfidModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                <Wallet className="text-primary" size={28} />
                Credit RFID Balance
              </h2>
              <button
                onClick={() => setShowRfidModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreditRFID} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  RFID Number
                </label>
                <input
                  type="text"
                  value={rfidNumber}
                  onChange={(e) => setRfidNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  placeholder="Enter student RFID number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  placeholder="Enter amount to credit"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRfidModal(false)}
                  className="flex-1 border-2 border-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Credit Balance
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
