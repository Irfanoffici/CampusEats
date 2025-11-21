'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Utensils, Users, FileText, LogIn, UserPlus, X, Menu, MessageCircle, BarChart3, Settings, User, Users2, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  // Different navigation items based on user role
  const getNavItems = () => {
    if (userRole === 'STUDENT') {
      return [
        { name: 'Restaurants', href: '/', icon: Utensils },
        { name: 'Community', href: '/community', icon: Users2 },
        { name: 'Group Orders', href: '/group-orders', icon: Users },
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
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
    
    // Get user role from localStorage or session
    const role = localStorage.getItem('userRole') || null
    setUserRole(role)
  }, [pathname])

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
            
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
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