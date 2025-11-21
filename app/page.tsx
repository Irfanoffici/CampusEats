'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Clock, Utensils, Users, MessageCircle, TrendingUp, Award, Gift } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { formatCurrency } from '@/lib/utils'

export default function HomePage() {
  const { data: session } = useSession()
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [location, setLocation] = useState('Campus Main Gate')

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      // In a real implementation, this would fetch vendors from the API
      // In a real implementation, this would fetch vendors from the API
      // For now, we'll use more realistic placeholder data
      setVendors([
        {
          id: '1',
          shopName: 'Campus Cafe',
          description: 'Best coffee and snacks on campus',
          rating: 4.7,
          reviewCount: 124,
          deliveryTime: '10-15 min',
          imageUrl: 'https://images.unsplash.com/photo-1554112343-9c0c1d4d9b0a?w=300&h=200&fit=crop',
          categories: ['Coffee', 'Snacks'],
          isFavorite: true,
          discount: '20% OFF',
          deliveryFee: 0,
          minOrder: 50
        },
        {
          id: '2',
          shopName: 'Burger Junction',
          description: 'Gourmet burgers and fries',
          rating: 4.5,
          reviewCount: 98,
          deliveryTime: '15-20 min',
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
          categories: ['Burgers', 'Fast Food'],
          isFavorite: false,
          deliveryFee: 10,
          minOrder: 100
        },
        {
          id: '3',
          shopName: 'Pizza Palace',
          description: 'Freshly baked pizzas',
          rating: 4.8,
          reviewCount: 156,
          deliveryTime: '20-25 min',
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
          categories: ['Pizza', 'Italian'],
          isFavorite: true,
          discount: 'BUY 1 GET 1',
          deliveryFee: 15,
          minOrder: 150
        },
        {
          id: '4',
          shopName: 'Sandwich Hub',
          description: 'Fresh sandwiches and wraps',
          rating: 4.3,
          reviewCount: 76,
          deliveryTime: '10-15 min',
          imageUrl: 'https://images.unsplash.com/photo-1553901753-24420a20596d?w=300&h=200&fit=crop',
          categories: ['Sandwiches', 'Healthy'],
          isFavorite: false,
          deliveryFee: 5,
          minOrder: 75
        },
        {
          id: '5',
          shopName: 'Sushi Corner',
          description: 'Fresh sushi and Japanese dishes',
          rating: 4.9,
          reviewCount: 89,
          deliveryTime: '25-30 min',
          imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
          categories: ['Sushi', 'Japanese'],
          isFavorite: true,
          discount: '15% OFF',
          deliveryFee: 20,
          minOrder: 200
        },
        {
          id: '6',
          shopName: 'Taco Fiesta',
          description: 'Authentic Mexican tacos and burritos',
          rating: 4.6,
          reviewCount: 112,
          deliveryTime: '15-20 min',
          imageUrl: 'https://images.unsplash.com/photo-1599978702024-0e50b027f4d7?w=300&h=200&fit=crop',
          categories: ['Tacos', 'Mexican'],
          isFavorite: false,
          deliveryFee: 10,
          minOrder: 120
        }
      ])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.categories.some((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === 'all' || 
                         (filter === 'favorites' && vendor.isFavorite) ||
                         vendor.categories.includes(filter)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Order Food, Share Meals
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg md:text-xl mb-6 text-orange-100"
              >
                CampusEats - Food delivery for Madras Engineering College
              </motion.p>
              
              <div className="mb-6">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 max-w-md">
                  <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white font-medium truncate">{location}</span>
                  <button className="ml-auto text-white text-sm font-medium">Change</button>
                </div>
              </div>
              
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search for restaurants or dishes..."
                  className="w-full px-6 py-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                      <Utensils className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Quick Order</h3>
                      <p className="text-orange-100 text-sm">Order in 30 seconds</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center bg-white/20 rounded-lg p-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span>Group Ordering</span>
                    </div>
                    
                    <div className="flex items-center bg-white/20 rounded-lg p-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <span>Chat with Friends</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {session?.user ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Link 
                    href="/community" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-orange-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Join Community
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Link 
                    href="/group-orders" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-orange-600 transition-colors"
                  >
                    <Utensils className="mr-2 h-5 w-5" />
                    Create Group Order
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-orange-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-orange-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CampusEats?</h2>
            <p className="text-xl text-gray-600">The best food ordering experience on campus</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your food delivered in 10-25 minutes, right to your campus location.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Group Ordering</h3>
              <p className="text-gray-600">Share meals with friends and split bills easily with our group ordering feature.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Food</h3>
              <p className="text-gray-600">Partnered with top campus vendors to ensure fresh and delicious meals.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Vendors Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Vendors</h2>
              <p className="text-gray-600 mt-2">Discover the best food options on campus</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="favorites">Favorites</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Burgers">Burgers</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Sandwiches">Sandwiches</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <div className="animate-pulse bg-gray-200 rounded-full w-12 h-12" />
                    </div>
                    <img 
                      src={vendor.imageUrl} 
                      alt={vendor.shopName} 
                      className="w-full h-40 object-cover absolute top-0 left-0 rounded-t-lg transition-opacity duration-300 opacity-0"
                      loading="lazy"
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.classList.remove('opacity-0');
                        target.classList.add('opacity-100');
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop';
                        target.classList.remove('opacity-0');
                        target.classList.add('opacity-100');
                      }}
                    />
                    {vendor.discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                        {vendor.discount}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button className={`p-2 rounded-full ${vendor.isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400'} shadow-md`}>
                        <svg className="h-5 w-5" fill={vendor.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{vendor.shopName}</h3>
                        <p className="text-gray-600 text-sm mt-1 truncate">{vendor.description}</p>
                      </div>
                      <div className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium ml-1">{vendor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {vendor.categories.slice(0, 2).map((category: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {category}
                        </span>
                      ))}
                      {vendor.categories.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{vendor.categories.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{vendor.deliveryTime}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span>₹{vendor.deliveryFee} delivery</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link 
                        href={`/vendors/${vendor.id}`}
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition-opacity"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8 text-orange-100">Join thousands of students enjoying delicious meals on campus</p>
          
          {session?.user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/community" 
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-orange-600 bg-white hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Join Community
              </Link>
              <Link 
                href="/group-orders" 
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-orange-600 transition-colors"
              >
                <Users className="mr-2 h-5 w-5" />
                Create Group Order
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-orange-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-orange-600 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}