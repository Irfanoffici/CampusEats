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

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      // In a real implementation, this would fetch vendors from the API
      setVendors([
        {
          id: '1',
          shopName: 'Campus Cafe',
          description: 'Best coffee and snacks on campus',
          rating: 4.7,
          reviewCount: 124,
          deliveryTime: '10-15 min',
          imageUrl: 'https://via.placeholder.com/300',
          categories: ['Coffee', 'Snacks'],
          isFavorite: true
        },
        {
          id: '2',
          shopName: 'Burger Junction',
          description: 'Gourmet burgers and fries',
          rating: 4.5,
          reviewCount: 98,
          deliveryTime: '15-20 min',
          imageUrl: 'https://via.placeholder.com/300',
          categories: ['Burgers', 'Fast Food'],
          isFavorite: false
        },
        {
          id: '3',
          shopName: 'Pizza Palace',
          description: 'Freshly baked pizzas',
          rating: 4.8,
          reviewCount: 156,
          deliveryTime: '20-25 min',
          imageUrl: 'https://via.placeholder.com/300',
          categories: ['Pizza', 'Italian'],
          isFavorite: true
        },
        {
          id: '4',
          shopName: 'Sandwich Hub',
          description: 'Fresh sandwiches and wraps',
          rating: 4.3,
          reviewCount: 76,
          deliveryTime: '10-15 min',
          imageUrl: 'https://via.placeholder.com/300',
          categories: ['Sandwiches', 'Healthy'],
          isFavorite: false
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
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Order Food, Share Meals
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl md:text-2xl mb-8 text-orange-100"
            >
              CampusEats - Food delivery for Madras Engineering College
            </motion.p>
            
            {session?.user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link 
                  href="/community" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-orange-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Join Community
                </Link>
                <Link 
                  href="/group-orders" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-orange-600 transition-colors"
                >
                  <Utensils className="mr-2 h-5 w-5" />
                  Create Group Order
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-orange-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </motion.div>
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
                    <img 
                      src={vendor.imageUrl} 
                      alt={vendor.shopName} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <button className={`p-2 rounded-full ${vendor.isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400'} shadow-md`}>
                        <svg className="h-5 w-5" fill={vendor.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{vendor.shopName}</h3>
                        <p className="text-gray-600 mt-1">{vendor.description}</p>
                      </div>
                      <div className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium ml-1">{vendor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {vendor.categories.map((category: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {category}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">{vendor.deliveryTime}</span>
                      </div>
                      <span className="text-sm text-gray-500">{vendor.reviewCount} reviews</span>
                    </div>
                    
                    <div className="mt-6">
                      <Link 
                        href={`/vendors/${vendor.id}`}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition-opacity"
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