'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import VendorGrid from '@/components/student/VendorGrid'
import CartDrawer from '@/components/student/CartDrawer'
import OrderHistory from '@/components/student/OrderHistory'
import { ShoppingCart, LogOut, History, Wallet, Users } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  vendorId?: string
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'vendors' | 'history'>('vendors')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.role === 'STUDENT') {
      fetchBalance()
    }
  }, [session])

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/balance')
      const data = await res.json()
      setBalance(data.rfidBalance)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast.success(`${item.name} added to cart`)
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (status === 'loading') {
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
              <h1 className="text-2xl font-bold text-gradient">CampusEats</h1>
              <p className="text-sm text-textSecondary">Welcome, {session?.user?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* RFID Balance */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Wallet size={20} />
                <div className="text-right">
                  <p className="text-xs opacity-90">RFID Balance</p>
                  <p className="font-bold">{balance !== null ? formatCurrency(balance) : '...'}</p>
                </div>
              </motion.div>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCart(true)}
                className="relative bg-primary text-white p-3 rounded-full shadow-lg"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: 'https://campuseatsmec.netlify.app/login' })}
                className="bg-red-500 text-white p-3 rounded-full"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`pb-2 px-4 font-medium transition ${
                activeTab === 'vendors'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary'
              }`}
            >
              Browse Vendors
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-4 font-medium transition ${
                activeTab === 'history'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary'
              }`}
            >
              Order History
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'vendors' ? (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VendorGrid onAddToCart={addToCart} />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <OrderHistory />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        total={cartTotal}
        balance={balance || 0}
        onOrderComplete={() => {
          fetchBalance()
          setActiveTab('history')
        }}
      />
    </div>
  )
}
