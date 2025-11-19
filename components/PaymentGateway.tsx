'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentGatewayProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onSuccess: () => void
}

export default function PaymentGateway({ isOpen, onClose, amount, onSuccess }: PaymentGatewayProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Invalid card number')
      return
    }

    if (cvv.length !== 3) {
      toast.error('Invalid CVV')
      return
    }

    setStep('processing')

    setTimeout(() => {
      const success = Math.random() < 0.95

      if (success) {
        setStep('success')
        setTimeout(() => {
          onSuccess()
          onClose()
          resetForm()
        }, 2000)
      } else {
        toast.error('Payment failed. Please try again.')
        setStep('form')
      }
    }, 2500)
  }

  const resetForm = () => {
    setCardNumber('')
    setExpiry('')
    setCvv('')
    setName('')
    setStep('form')
  }

  const handleClose = () => {
    if (step !== 'processing') {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {step === 'form' && (
            <>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Secure Payment</h3>
                      <p className="text-sm text-blue-100">Demo Gateway</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-100 mb-1">Amount to Pay</p>
                  <p className="text-4xl font-bold">₹{amount.toFixed(2)}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-lg"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                      maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                    placeholder="JOHN DOE"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Lock size={14} />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition"
                >
                  Pay ₹{amount.toFixed(2)}
                </motion.button>

                <p className="text-xs text-center text-gray-500">
                  Demo payment - Use any card details for testing
                </p>
              </form>
            </>
          )}

          {step === 'processing' && (
            <div className="p-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="text-green-600" size={48} />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-1">₹{amount.toFixed(2)} paid successfully</p>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
