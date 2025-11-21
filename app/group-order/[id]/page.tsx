'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Copy, 
  Share2, 
  QrCode, 
  CreditCard, 
  Wallet,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Participant {
  id: string
  name: string
  amount: number
  status: 'pending' | 'paid' | 'settled'
}

interface GroupOrder {
  id: string
  shareLink: string
  vendor: {
    shopName: string
    imageUrl: string
  }
  totalAmount: number
  participantCount: number
  splitType: string
  createdAt: string
  expiresAt: string
  isFinalized: boolean
  participants: Participant[]
}

export default function GroupOrderDetails() {
  const params = useParams()
  const router = useRouter()
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'creator' | 'participant'>('participant')
  const [paymentMethod, setPaymentMethod] = useState('rfid')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchGroupOrder()
  }, [params.id])

  const fetchGroupOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/group-orders/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Group order not found or has expired.')
        } else {
          setError('Failed to load group order details. Please try again.')
        }
        return
      }
      
      const data = await response.json()
      setGroupOrder(data)
    } catch (error) {
      console.error('Error fetching group order:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    if (!groupOrder) return
    
    const fullUrl = `${window.location.origin}/group-order/${groupOrder.shareLink}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Share link copied to clipboard!')
  }

  const shareGroupOrder = () => {
    if (!groupOrder) return
    
    if (navigator.share) {
      navigator.share({
        title: 'Group Order',
        text: `Join my group order at ${groupOrder.vendor.shopName}`,
        url: `${window.location.origin}/group-order/${groupOrder.shareLink}`
      })
    } else {
      copyShareLink()
    }
  }

  const handlePayment = async () => {
    if (!groupOrder || processing) return
    
    try {
      setProcessing(true)
      
      // Simulate payment processing
      const toastId = toast.loading('Processing payment...')
      
      // In a real implementation, this would process the actual payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.dismiss(toastId)
      toast.success('Payment successful!')
      
      // Update participant status
      const updatedParticipants = groupOrder.participants.map(p => 
        p.name === 'You' ? { ...p, status: 'paid' as 'paid' } : p
      )
      
      setGroupOrder({
        ...groupOrder,
        participants: updatedParticipants
      })
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const finalizeGroupOrder = async () => {
    if (!groupOrder || processing) return
    
    try {
      setProcessing(true)
      
      const toastId = toast.loading('Finalizing group order...')
      
      // In a real implementation, this would finalize the group order
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.dismiss(toastId)
      toast.success('Group order finalized!')
      
      setGroupOrder({
        ...groupOrder,
        isFinalized: true
      })
    } catch (error) {
      toast.error('Failed to finalize group order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Group Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard?tab=group-orders')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={fetchGroupOrder}
              disabled={processing}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={processing ? 'animate-spin' : ''} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!groupOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Order Not Found</h2>
          <p className="text-gray-600">The group order you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => router.push('/dashboard?tab=group-orders')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const userParticipant = groupOrder.participants.find(p => p.name === 'You')
  const isCreator = userRole === 'creator'
  const allPaid = groupOrder.participants.every(p => p.status === 'paid')

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{groupOrder.vendor.shopName}</h1>
                <p className="opacity-90">Group Order #{groupOrder.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyShareLink}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                  title="Copy link"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={shareGroupOrder}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-sm opacity-80">Total Amount</p>
                <p className="text-xl font-bold">{formatCurrency(groupOrder.totalAmount)}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-sm opacity-80">Participants</p>
                <p className="text-xl font-bold">{groupOrder.participantCount}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-sm opacity-80">Split Type</p>
                <p className="text-xl font-bold capitalize">{groupOrder.splitType}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-sm opacity-80">Status</p>
                <p className="text-xl font-bold">
                  {groupOrder.isFinalized ? 'Finalized' : 'Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Participants Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Participants</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{groupOrder.participants.length} joined</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {groupOrder.participants.map((participant) => (
                  <div 
                    key={participant.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                        <User className="text-gray-500" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{participant.name}</p>
                        <p className="text-sm text-gray-500">
                          {participant.status === 'paid' ? 'Paid' : 
                           participant.status === 'settled' ? 'Settled' : 'Pending'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">{formatCurrency(participant.amount)}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        participant.status === 'paid' ? 'bg-green-500' :
                        participant.status === 'settled' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Section */}
            {!groupOrder.isFinalized && userParticipant?.status !== 'paid' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Make Payment</h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-gray-600">Your share</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(userParticipant?.amount || 0)}</p>
                    </div>
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <QrCode size={24} />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => setPaymentMethod('rfid')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                          paymentMethod === 'rfid' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Wallet className="text-primary" size={20} />
                        <span className="text-sm font-medium">RFID</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                          paymentMethod === 'card' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="text-primary" size={20} />
                        <span className="text-sm font-medium">Card</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                          paymentMethod === 'upi' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <QrCode className="text-primary" size={20} />
                        <span className="text-sm font-medium">UPI</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                          paymentMethod === 'cash' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-primary font-bold text-lg">₹</span>
                        <span className="text-sm font-medium">Cash</span>
                      </button>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${formatCurrency(userParticipant?.amount || 0)}`
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Finalize Section */}
            {isCreator && !groupOrder.isFinalized && allPaid && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Finalize Group Order</h2>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Ready to Finalize?</h3>
                      <p className="text-gray-600">
                        All participants have paid. Finalize this group order to generate invoices.
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={finalizeGroupOrder}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      'Finalize Group Order'
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Finalized Info */}
            {groupOrder.isFinalized && (
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <CheckCircle className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Group Order Finalized!</h3>
                    <p className="text-gray-600">
                      Invoices have been generated and sent to all participants.
                    </p>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-lg font-semibold shadow hover:shadow-md transition">
                  View Invoice
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}