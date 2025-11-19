'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut, Bell, TrendingUp, DollarSign, ShoppingBag, 
  Plus, Edit, Trash2, X, Check, Clock, Package, Utensils, Star, MessageSquare, Zap 
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import APITunnel from '@/lib/api-tunnel'
import NotificationService from '@/lib/notifications'

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  totalAmount: number
  orderStatus: string
  pickupCode: string
  paymentMethod: string
  items: string
  student: {
    fullName: string
    phoneNumber: string
  }
}

export default function VendorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'reviews'>('orders')
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'LUNCH',
    preparationTime: '15',
    imageUrl: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'VENDOR') {
      router.push('/dashboard')
    } else {
      if (activeTab === 'orders') {
        fetchOrders()
      } else if (activeTab === 'menu') {
        fetchMenuItems()
      } else if (activeTab === 'reviews') {
        fetchReviews()
      }
    }
  }, [session, status, router, activeTab])

  const fetchOrders = async () => {
    try {
      console.log('[Vendor Dashboard] Fetching orders...')
      setLoading(true)
      
      const response = await APITunnel.getOrders()
      
      if (response.success && Array.isArray(response.data)) {
        setOrders(response.data)
        console.log('[Vendor Dashboard] Loaded', response.data.length, 'orders')
      } else {
        console.error('[Vendor Dashboard] API Error:', response.error)
        NotificationService.error(response.error || 'Failed to load orders')
        setOrders([])
      }
    } catch (error: any) {
      console.error('[Vendor Dashboard] Error:', error)
      NotificationService.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      if (!session?.user.vendorId) return
      const res = await fetch(`/api/menu/${session.user.vendorId}`)
      const data = await res.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      if (!session?.user.vendorId) return
      const res = await fetch(`/api/reviews?vendorId=${session.user.vendorId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(Array.isArray(data) ? data : [])
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    }
  }

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm),
      })

      if (!res.ok) throw new Error('Failed to add item')

      NotificationService.success('Menu item added successfully')
      setShowAddMenu(false)
      setMenuForm({ name: '', description: '', price: '', category: 'LUNCH', preparationTime: '15', imageUrl: '' })
      fetchMenuItems()
    } catch (error) {
      NotificationService.error('Failed to add menu item')
    }
  }

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/menu-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...menuForm, id: editingItem.id }),
      })

      if (!res.ok) throw new Error('Failed to update item')

      NotificationService.success('Menu item updated successfully')
      setEditingItem(null)
      setMenuForm({ name: '', description: '', price: '', category: 'LUNCH', preparationTime: '15', imageUrl: '' })
      fetchMenuItems()
    } catch (error) {
      NotificationService.error('Failed to update menu item')
    }
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/menu-items?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete item')

      NotificationService.success('Menu item deleted')
      fetchMenuItems()
    } catch (error) {
      NotificationService.error('Failed to delete menu item')
    }
  }

  const handleEditClick = (item: any) => {
    setEditingItem(item)
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      imageUrl: item.imageUrl
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
          }
        }
        
        fetchOrders()
      } else {
        NotificationService.error(response.error || 'Failed to update status')
      }
    } catch (error) {
      NotificationService.error('Failed to update order status')
    }
  }

  const pendingOrders = orders.filter((o) => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.orderStatus))
  const readyOrders = orders.filter((o) => o.orderStatus === 'READY')
  const completedOrders = orders.filter((o) => o.orderStatus === 'PICKED_UP')

  const todayRevenue = orders
    .filter((o) => {
      const orderDate = new Date(o.createdAt)
      const today = new Date()
      return orderDate.toDateString() === today.toDateString() && o.orderStatus === 'PICKED_UP'
    })
    .reduce((sum, o) => sum + o.totalAmount, 0)

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
              <h1 className="text-2xl font-bold text-gradient">Vendor Dashboard</h1>
              <p className="text-sm text-textSecondary">Welcome, {session?.user?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-secondary text-white px-4 py-2 rounded-lg">
                <p className="text-xs opacity-90">Today's Revenue</p>
                <p className="font-bold">{formatCurrency(todayRevenue)}</p>
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-6 font-semibold transition ${
              activeTab === 'orders'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Order Management
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 px-6 font-semibold transition ${
              activeTab === 'menu'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Food Management
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-6 font-semibold transition flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'text-primary border-b-2 border-primary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <Star size={18} />
            Reviews & Feedback
          </button>
        </div>

        {activeTab === 'orders' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-sm">Pending Orders</p>
                <p className="text-3xl font-bold text-primary">{pendingOrders.length}</p>
              </div>
              <Bell className="text-primary" size={40} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-sm">Ready for Pickup</p>
                <p className="text-3xl font-bold text-secondary">{readyOrders.length}</p>
              </div>
              <Package className="text-secondary" size={40} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-sm">Completed Today</p>
                <p className="text-3xl font-bold text-gray-600">{completedOrders.length}</p>
              </div>
              <Check className="text-gray-600" size={40} />
            </div>
          </motion.div>
        </div>

        {/* Active Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-textPrimary">Active Orders</h2>

          {pendingOrders.length === 0 && readyOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-textSecondary">No active orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...pendingOrders, ...readyOrders].map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-textPrimary">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-textSecondary">{order.student.fullName}</p>
                      <p className="text-xs text-textSecondary">{order.student.phoneNumber}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-textSecondary mb-2">Items:</p>
                    <div className="space-y-1">
                      {JSON.parse(order.items).map((item: any, idx: number) => (
                        <div key={idx} className="text-sm flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-textSecondary mb-1 uppercase tracking-wide">Pickup Code</p>
                    <p className="text-3xl font-bold text-primary font-mono text-center tracking-wider">
                      {order.pickupCode}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {order.orderStatus === 'PLACED' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold"
                      >
                        Confirm
                      </motion.button>
                    )}
                    {order.orderStatus === 'CONFIRMED' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold"
                      >
                        Start Preparing
                      </motion.button>
                    )}
                    {order.orderStatus === 'PREPARING' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="flex-1 bg-secondary text-white py-2 rounded-lg font-semibold"
                      >
                        Mark as Ready
                      </motion.button>
                    )}
                    {order.orderStatus === 'READY' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        Confirm Pickup
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}        </div>
          </>
        )}

        {activeTab === 'menu' && (
          /* Menu Management Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-textPrimary">Menu Items</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddMenu(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
              >
                <Plus size={20} />
                Add New Item
              </motion.button>
            </div>

            {/* Menu Items Grid */}
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
                      src={item.imageUrl}
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

            {menuItems.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-textSecondary mb-4">No menu items yet</p>
                <button
                  onClick={() => setShowAddMenu(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Add Your First Item
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                  <Star className="text-yellow-500" />
                  Customer Reviews & Feedback
                </h2>
                <p className="text-sm text-textSecondary mt-1">
                  {reviews.length} total review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Summary Card */}
              {reviews.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={`${
                            star <= Math.round(reviews.reduce((sum, r) => sum + (r.foodRating + r.serviceRating) / 2, 0) / reviews.length)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-textPrimary">
                      {(reviews.reduce((sum, r) => sum + (r.foodRating + r.serviceRating) / 2, 0) / reviews.length).toFixed(1)}
                    </p>
                    <p className="text-xs text-textSecondary">Average Rating</p>
                  </div>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Star size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-textPrimary mb-2">No Reviews Yet</h3>
                <p className="text-textSecondary">
                  Customer reviews and ratings will appear here once students start reviewing your food.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                {reviews.map((review: any, index: number) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-textPrimary">
                          {review.student?.fullName || 'Anonymous'}
                        </h3>
                        <p className="text-xs text-textSecondary">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${
                                star <= Math.round((review.foodRating + review.serviceRating) / 2)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-bold text-textPrimary mt-1">
                          {((review.foodRating + review.serviceRating) / 2).toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-textSecondary mb-1">Food Quality</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= review.foodRating
                                    ? 'text-blue-500 fill-blue-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-textPrimary">{review.foodRating}</span>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-textSecondary mb-1">Service</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= review.serviceRating
                                    ? 'text-green-500 fill-green-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-textPrimary">{review.serviceRating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-textPrimary italic">"{review.comment}"</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Menu Item Modal - Outside main to prevent overlap */}
      <AnimatePresence>
        {(showAddMenu || editingItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => {
              setShowAddMenu(false)
              setEditingItem(null)
              setMenuForm({ name: '', description: '', price: '', category: 'LUNCH', preparationTime: '15', imageUrl: '' })
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-textPrimary">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddMenu(false)
                    setEditingItem(null)
                    setMenuForm({ name: '', description: '', price: '', category: 'LUNCH', preparationTime: '15', imageUrl: '' })
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
                      setMenuForm({ name: '', description: '', price: '', category: 'LUNCH', preparationTime: '15', imageUrl: '' })
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
          </motion.div>
        )}
      </AnimatePresence>

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
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all"
          title="Quick Actions"
        >
          <Zap size={20} className="sm:w-6 sm:h-6" />
        </motion.button>

        {/* Secondary FABs */}
        <AnimatePresence>
          {isFabOpen && (
            <>
              {/* Add Menu Item Button */}
              {activeTab === 'menu' && (
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
                    setShowAddMenu(true)
                    setIsFabOpen(false)
                  }}
                  className="bg-gradient-to-r from-primary to-secondary text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-primary/50 transition-all"
                  title="Add Menu Item"
                >
                  <Plus size={20} className="sm:w-6 sm:h-6" />
                </motion.button>
              )}

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
                  if (activeTab === 'orders') fetchOrders()
                  else if (activeTab === 'menu') fetchMenuItems()
                  else if (activeTab === 'reviews') fetchReviews()
                  NotificationService.success('Data refreshed!')
                  setIsFabOpen(false)
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all"
                title="Refresh Data"
              >
                <Bell size={20} className="sm:w-6 sm:h-6" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
