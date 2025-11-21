'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Clock, TrendingUp, Award } from 'lucide-react'
import Image from 'next/image'

interface Vendor {
  id: string
  shopName: string
  description: string
  imageUrl: string
  averageRating: number
  totalReviews: number
  openingHours: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  preparationTime: number
}

interface VendorGridProps {
  onAddToCart: (item: { id: string; name: string; price: number; imageUrl: string; vendorId: string }) => void
}

export default function VendorGrid({ onAddToCart }: VendorGridProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [recommendedItems, setRecommendedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
    fetchRecommendedItems()
  }, [])

  const fetchRecommendedItems = async () => {
    try {
      const res = await fetch('/api/menu/recommended')
      const data = await res.json()
      if (data.success) {
        setRecommendedItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors')
      const data = await res.json()
      setVendors(data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenu = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/menu/${vendorId}`)
      const data = await res.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    fetchMenu(vendor.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (selectedVendor) {
    return (
      <div>
        <button
          onClick={() => setSelectedVendor(null)}
          className="mb-4 text-primary hover:underline"
        >
          ← Back to Vendors
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Image
              src={selectedVendor.imageUrl}
              alt={selectedVendor.shopName}
              width={100}
              height={100}
              className="rounded-lg object-cover w-full sm:w-32 h-32 sm:h-32"
            />
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-2">
                {selectedVendor.shopName}
              </h2>
              <p className="text-textSecondary text-sm mb-3">{selectedVendor.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Star className="fill-accent text-accent" size={14} />
                  <span className="font-semibold">{selectedVendor.averageRating.toFixed(1)}</span>
                  <span className="text-textSecondary hidden xs:inline">({selectedVendor.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-textSecondary">
                  <Clock size={14} />
                  <span>{selectedVendor.openingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item) => {
            // Check if this item is recommended
            const isRecommended = recommendedItems.some(rec => rec.id === item.id)
            const recItem = recommendedItems.find(rec => rec.id === item.id)
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-2xl shadow-soft overflow-hidden border ${
                  isRecommended 
                    ? 'border-2 border-yellow-400 shadow-yellow-200/50' 
                    : 'border-gray-100'
                } relative touch-pan-y`}
              >
                {isRecommended && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Award size={12} className="fill-white" />
                      <span className="hidden xs:inline">Recommended</span>
                    </div>
                  </div>
                )}
                <div className="relative h-32 sm:h-48">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-base sm:text-lg text-textPrimary mb-1">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-textSecondary mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl sm:text-2xl font-bold text-primary">₹{item.price}</span>
                    <span className="text-xs text-textSecondary flex items-center gap-1">
                      <Clock size={12} />
                      <span className="hidden xs:inline">{item.preparationTime} min</span>
                      <span className="xs:hidden">{item.preparationTime}m</span>
                    </span>
                  </div>
                  {isRecommended && recItem && (
                    <div className="flex items-center gap-1 mb-2 text-xs text-yellow-600">
                      <Star size={12} className="fill-yellow-600" />
                      <span className="font-semibold">{recItem.vendorRating.toFixed(1)} rating</span>
                      <span className="text-textSecondary hidden xs:inline">• {recItem.reviewCount} reviews</span>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart({ ...item, vendorId: selectedVendor.id })}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      isRecommended
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Recommended Items Section */}
      {recommendedItems.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-2 rounded-lg">
              <Award className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                Recommended for You
                <span className="text-sm font-normal text-textSecondary">Based on ratings & reviews</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {recommendedItems.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 relative touch-pan-y"
              >
                {/* Recommended Badge */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg">
                    <Star size={10} className="fill-white hidden xs:inline" />
                    <span className="xs:hidden">{item.vendorRating.toFixed(1)}</span>
                    <span className="hidden xs:inline">{item.vendorRating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="relative h-24 sm:h-40">
                  <Image
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2 sm:p-4">
                  <h3 className="font-bold text-sm sm:text-base text-textPrimary mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] sm:text-xs text-textSecondary mb-2 hidden xs:block">{item.vendor.shopName}</p>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-lg sm:text-xl font-bold text-primary">₹{item.price}</span>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-textSecondary">
                      <Clock size={10} className="sm:size-12" />
                      <span>{item.preparationTime}m</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart({ ...item, vendorId: item.vendorId })}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition"
                  >
                    <span className="hidden xs:inline">Add to Cart</span>
                    <span className="xs:hidden">Add</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
        <TrendingUp size={24} className="text-primary" />
        Available Vendors
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {vendors.map((vendor) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer border border-gray-100 hover:border-primary/20 transition-all duration-300 touch-pan-y"
            onClick={() => handleVendorClick(vendor)}
          >
            <div className="relative h-32 sm:h-40 md:h-48">
              <Image
                src={vendor.imageUrl}
                alt={vendor.shopName}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="text-lg sm:text-xl font-bold text-textPrimary mb-2">{vendor.shopName}</h3>
              <p className="text-xs sm:text-sm text-textSecondary mb-3 line-clamp-2">{vendor.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="fill-accent text-accent" size={14} />
                  <span className="font-semibold text-sm">{vendor.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-textSecondary hidden xs:inline">({vendor.totalReviews})</span>
                </div>
                <span className="text-xs text-textSecondary hidden sm:inline">{vendor.openingHours}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
