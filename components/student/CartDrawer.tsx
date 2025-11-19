'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, CreditCard, Smartphone, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { QRCodeSVG } from 'qrcode.react'
import PaymentGateway from '@/components/PaymentGateway'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  vendorId?: string
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onClear: () => void
  total: number
  balance: number
  onOrderComplete: () => void
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onClear,
  total,
  balance,
  onOrderComplete,
}: CartDrawerProps) {
  const [paymentMethod, setPaymentMethod] = useState<'RFID' | 'UPI' | 'CARD'>('RFID')
  const [processing, setProcessing] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [upiQr, setUpiQr] = useState('')
  const [showCardGateway, setShowCardGateway] = useState(false)

  const tax = total * 0.05 // 5% tax
  const finalTotal = total + tax

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (paymentMethod === 'RFID' && balance < finalTotal) {
      toast.error('Insufficient RFID balance')
      return
    }

    if (paymentMethod === 'CARD') {
      setShowCardGateway(true)
      return
    }

    setShowPayment(true)

    if (paymentMethod === 'UPI') {
      const upiString = `upi://pay?pa=campuseats@ybl&pn=CampusEats&am=${finalTotal}&cu=INR`
      setUpiQr(upiString)
    }
  }

  const confirmPayment = async () => {
    setProcessing(true)

    try {
      // Get vendor ID from first cart item
      const vendorId = cart[0]?.vendorId
      
      if (!vendorId) {
        toast.error('Invalid cart data')
        setProcessing(false)
        return
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          items: cart,
          subtotal: total,
          tax,
          totalAmount: finalTotal,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Order failed')
      }

      const order = await response.json()

      toast.success(`Order placed! Pickup code: ${order.pickupCode}`)
      onClear()
      onClose()
      setShowPayment(false)
      setShowCardGateway(false)
      onOrderComplete()
    } catch (error: any) {
      toast.error(error.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-textPrimary">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-textSecondary py-12">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4 bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-textPrimary">{item.name}</h3>
                    <p className="text-primary font-bold">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1 hover:bg-red-100 text-red-500 rounded ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        {cart.length > 0 && !showPayment && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-textSecondary">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Tax (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-textPrimary">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textSecondary">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('RFID')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                    paymentMethod === 'RFID'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200'
                  }`}
                >
                  <Wallet size={20} />
                  <span className="text-xs">RFID</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                    paymentMethod === 'UPI'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200'
                  }`}
                >
                  <Smartphone size={20} />
                  <span className="text-xs">UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                    paymentMethod === 'CARD'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs">Card</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'RFID' && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-textSecondary">Available Balance</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(balance)}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Proceed to Payment
            </motion.button>
          </div>
        )}

        {/* Payment Confirmation */}
        {showPayment && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-lg">Confirm Payment</h3>

            {paymentMethod === 'UPI' && upiQr && (
              <div className="flex flex-col items-center gap-4">
                <QRCodeSVG value={upiQr} size={200} />
                <p className="text-sm text-textSecondary text-center">
                  Scan QR code with any UPI app
                </p>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Card Number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 border border-gray-200 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmPayment}
                disabled={processing}
                className="flex-1 bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-secondary/90 transition disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(finalTotal)}`}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Card Payment Gateway */}
      <PaymentGateway
        isOpen={showCardGateway}
        onClose={() => setShowCardGateway(false)}
        amount={finalTotal}
        onSuccess={confirmPayment}
      />
    </>
  )
}
