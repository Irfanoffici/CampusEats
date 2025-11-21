'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CreditCard, QrCode, Wallet, Users } from 'lucide-react'

export default function NonMECPortal() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'signup' | 'payment'>('signup')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    collegeEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isMECStudent: false
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      toast.success('Registration successful!')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CampusEats for Everyone</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community of students from all colleges. Order food together and split bills easily.
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'signup'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Student Registration
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'payment'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment Methods
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'signup' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Register as a Student</h2>
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College Email (for verification)
                    </label>
                    <input
                      type="email"
                      name="collegeEmail"
                      value={formData.collegeEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      placeholder="you@yourcollege.edu"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => router.push('/login')}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                <p className="text-gray-600">
                  As a non-MEC student, you can use various payment methods for your orders:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <CreditCard className="text-blue-600" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Credit/Debit Card</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Pay securely with your credit or debit card. We support all major card networks.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Visa, Mastercard, Rupay accepted</li>
                      <li>• 256-bit SSL encryption</li>
                      <li>• PCI DSS compliant</li>
                    </ul>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <QrCode className="text-green-600" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">UPI Payments</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Instant payments through UPI. Link your bank account and pay with a single click.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Google Pay, PhonePe, Paytm supported</li>
                      <li>• Instant transfers</li>
                      <li>• No transaction fees</li>
                    </ul>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <Wallet className="text-purple-600" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Wallet Payments</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Use digital wallets for quick and easy payments. Save your cards for faster checkout.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Apple Pay, Samsung Pay supported</li>
                      <li>• One-tap payments</li>
                      <li>• Biometric authentication</li>
                    </ul>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg mr-4">
                        <Users className="text-orange-600" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Cash on Delivery</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Pay in cash when your order is delivered. Perfect for those who prefer traditional payment methods.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• No advance payment required</li>
                      <li>• Exact change appreciated</li>
                      <li>• Available for all orders</li>
                    </ul>
                  </motion.div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">Group Ordering Benefits</h3>
                  <p className="text-yellow-700">
                    When ordering with friends, you can split bills automatically and track payments from each participant.
                    No more awkward money exchanges!
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}