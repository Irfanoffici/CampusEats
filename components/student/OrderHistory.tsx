'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, Package, Star, Eye, MessageSquare } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import OrderTracker from '@/components/OrderTracker'
import APITunnel from '@/lib/api-tunnel'
import NotificationService from '@/lib/notifications'

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  totalAmount: number
  orderStatus: string
  pickupCode: string
  vendor: {
    id: string
    shopName: string
  }
  items: string
}

interface Review {
  orderId: string
  rating: number
  comment: string
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState<Review>({
    orderId: '',
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await APITunnel.getOrders()
      if (response.success) {
        setOrders(response.data || [])
      } else {
        NotificationService.error('Failed to load orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      NotificationService.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!reviewForm.orderId) return

    try {
      const response = await APITunnel.submitReview({
        orderId: reviewForm.orderId,
        vendorId: orders.find(o => o.id === reviewForm.orderId)?.vendor.id,
        foodRating: reviewForm.rating,
        serviceRating: reviewForm.rating, // Use same rating for both
        comment: reviewForm.comment,
      })

      if (response.success) {
        NotificationService.success('Review submitted successfully! 🌟')
        setShowReviewModal(false)
        setReviewForm({ orderId: '', rating: 5, comment: '' })
      } else {
        NotificationService.error(response.error || 'Failed to submit review')
      }
    } catch (error) {
      NotificationService.error('Failed to submit review')
    }
  }

  const openReviewModal = (order: Order) => {
    setReviewForm({ orderId: order.id, rating: 5, comment: '' })
    setShowReviewModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800'
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800'
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'PICKED_UP':
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <p className="text-textSecondary">No orders yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-textPrimary mb-6">Order History</h2>

      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-textPrimary">
                {order.vendor.shopName}
              </h3>
              <p className="text-sm text-textSecondary">Order #{order.orderNumber}</p>
              <p className="text-xs text-textSecondary flex items-center gap-1 mt-1">
                <Clock size={12} />
                {formatDate(new Date(order.createdAt))}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-primary">
                {formatCurrency(order.totalAmount)}
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              {selectedOrder?.id === order.id ? 'Hide Tracking' : 'Track Order'}
            </button>
            
            {['PICKED_UP', 'COMPLETED'].includes(order.orderStatus) && (
              <button
                onClick={() => openReviewModal(order)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Star size={18} />
                Review
              </button>
            )}
          </div>

          {/* Order Tracker */}
          <AnimatePresence>
            {selectedOrder?.id === order.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <OrderTracker
                  status={order.orderStatus}
                  createdAt={order.createdAt}
                  pickupCode={order.pickupCode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {order.orderStatus !== 'PICKED_UP' && order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'COMPLETED' && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-4">
              <p className="text-sm text-textSecondary mb-1">Pickup Code</p>
              <p className="text-3xl font-bold text-primary font-mono">
                {order.pickupCode}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-textSecondary mb-2">Items:</p>
            <div className="text-sm text-textPrimary">
              {JSON.parse(order.items).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-textPrimary mb-4">Rate Your Experience</h3>
              
              {/* Star Rating */}
              <div className="mb-6">
                <p className="text-sm text-textSecondary mb-2">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <p className="text-sm text-textSecondary mb-2">Comment (Optional)</p>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-textPrimary py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-3 rounded-lg font-semibold transition"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
