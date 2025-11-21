'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Utensils, Users, FileText, LogIn, UserPlus, X, Menu, MessageCircle, BarChart3, Settings, User, Users2, Shield, LogOut, Wallet, ShoppingCart, UserCircle, Home } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { formatCurrency } from '@/lib/utils'

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [rfidBalance, setRfidBalance] = useState<number | null>(null)
  const [isMessengerMode, setIsMessengerMode] = useState(false)
  
  // Different navigation items based on user role
  const getNavItems = () => {
    if (userRole === 'STUDENT') {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Restaurants', href: '/', icon: Utensils },
        { name: 'Community', href: '/community', icon: Users2 },
        { name: 'Messenger', href: '/messenger', icon: MessageCircle },
        { name: 'Group Orders', href: '/group-orders', icon: Users },
        { name: 'Invoices', href: '/invoices', icon: FileText },
      ]
    } else if (userRole === 'VENDOR') {
      return [
        { name: 'Dashboard', href: '/dashboard/vendor', icon: BarChart3 },
        { name: 'Orders', href: '/dashboard/vendor/orders', icon: Users },
        { name: 'Menu', href: '/dashboard/vendor/menu', icon: Utensils },
        { name: 'Community', href: '/vendor-community', icon: Users2 },
        { name: 'Analytics', href: '/dashboard/vendor/analytics', icon: BarChart3 },
      ]
    } else if (userRole === 'ADMIN') {
      return [
        { name: 'Dashboard', href: '/dashboard/admin', icon: BarChart3 },
        { name: 'Users', href: '/dashboard/admin/users', icon: User },
        { name: 'Vendors', href: '/dashboard/admin/vendors', icon: Utensils },
        { name: 'Community', href: '/admin-community', icon: Users2 },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
        { name: 'Monitoring', href: '/dashboard/admin/monitoring', icon: Shield },
      ]
    } else {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Restaurants', href: '/', icon: Utensils },
        { name: 'Group Orders', href: '/group-orders', icon: Users },
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Login', href: '/login', icon: LogIn },
        { name: 'Sign Up', href: '/signup', icon: UserPlus },
      ]
    }
  }

  const navItems = getNavItems()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false)
    
    // Get user role from session
    if (session?.user) {
      setUserRole(session.user.role)
      setRfidBalance(session.user.rfidBalance || null)
    } else {
      setUserRole(null)
      setRfidBalance(null)
    }
  }, [pathname, session])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const toggleMessengerMode = () => {
    setIsMessengerMode(!isMessengerMode)
    // Emit a custom event to notify the app about the mode change
    window.dispatchEvent(new CustomEvent('messengerModeToggle', { detail: !isMessengerMode }))
    
    // Update the body class for styling
    if (!isMessengerMode) {
      document.body.classList.add('messenger-mode')
      // Navigate to messenger if not already there
      if (pathname !== '/messenger') {
        window.location.href = '/messenger'
      }
    } else {
      document.body.classList.remove('messenger-mode')
      // Navigate to home if currently in messenger
      if (pathname === '/messenger') {
        window.location.href = '/'
      }
    }
  }

  return (
    <>
      <nav className={`bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">CampusEats</span>
              </div>
              <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
            
            {/* User Info and Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {session?.user ? (
                <>
                  {/* RFID Balance */}
                  {rfidBalance !== null && userRole === 'STUDENT' && (
                    <div className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      <Wallet className="mr-2 h-4 w-4" />
                      {formatCurrency(rfidBalance)}
                    </div>
                  )}
                  
                  {/* Cart Button */}
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                  
                  {/* Messenger Mode Toggle */}
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMessengerMode}
                    className={`p-2 rounded-lg transition-all duration-300 ${isMessengerMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                    title={isMessengerMode ? 'Exit Messenger Mode' : 'Enter Messenger Mode'}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {isMessengerMode && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                      />
                    )}
                  </motion.button>
                  
                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <Link 
                      href="/profile"
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden md:block">
                        {session.user.name || 'User'}
                      </span>
                    </Link>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center space-x-2 lg:hidden">
              {/* Messenger Mode Toggle for Mobile */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMessengerMode}
                className={`p-2 rounded-lg transition-all duration-300 ${isMessengerMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                title={isMessengerMode ? 'Exit Messenger Mode' : 'Enter Messenger Mode'}
              >
                <MessageCircle className="h-5 w-5" />
                {isMessengerMode && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  />
                )}
              </motion.button>
                              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
            
            {/* Mobile User Actions */}
            {session?.user ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Link href="/profile">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                    </Link>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {session.user.name || 'User'}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {session.user.email}
                    </div>
                  </div>
                </div>
                
                {rfidBalance !== null && userRole === 'STUDENT' && (
                  <div className="mt-3 px-4">
                    <div className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      <Wallet className="mr-2 h-4 w-4" />
                      RFID Balance: {formatCurrency(rfidBalance)}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 space-y-1 px-4">
                  <Link
                    href="/profile"
                    className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <UserCircle className="mr-3 h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200 space-y-2 px-4">
                <Link
                  href="/login"
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogIn className="mr-3 h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="mr-3 h-5 w-5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}