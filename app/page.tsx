'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { GraduationCap, Store, Shield, ArrowRight, Zap, Clock, Star, ChefHat, Sparkles, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 300], [0, -50])
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8])
  const [activeFeature, setActiveFeature] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const portals = [
    {
      title: 'Student Portal',
      description: 'Browse vendors, order food instantly, and track your orders in real-time',
      icon: <GraduationCap size={40} />,
      path: '/login?role=student',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      shadow: 'hover:shadow-blue-500/50'
    },
    {
      title: 'Vendor Portal',
      description: 'Manage your menu, track orders, and grow your business',
      icon: <Store size={40} />,
      path: '/login?role=vendor',
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      shadow: 'hover:shadow-emerald-500/50'
    },
    {
      title: 'Admin Portal',
      description: 'Complete system control, analytics, and user management',
      icon: <Shield size={40} />,
      path: '/login?role=admin',
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      shadow: 'hover:shadow-purple-500/50'
    }
  ]

  const features = [
    { icon: <Zap />, title: 'Lightning Fast', desc: 'Order in under 30 seconds' },
    { icon: <Clock />, title: 'Real-time Tracking', desc: 'Know exactly when your food is ready' },
    { icon: <Star />, title: 'Top Rated', desc: 'Only the best vendors on campus' },
    { icon: <ChefHat />, title: 'Quality Food', desc: 'Fresh and delicious every time' }
  ]

  const foodImages = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleNavigation = (path: string) => {
    setIsLoading(true)
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Sticky Header */}
      <motion.nav 
        style={{ y: headerY, opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">CampusEats</h1>
                <p className="text-[10px] text-gray-500 -mt-0.5">Madras Engineering College</p>
              </div>
            </motion.div>
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation('/login')}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Sign In'}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-orange-50 to-red-50 opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-full mb-6 font-medium text-sm"
              >
                <Sparkles size={16} className="text-orange-500" />
                India's Fastest Campus Food Delivery
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Order Food<br />
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  In Minutes
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Delicious meals from your favorite campus vendors. Fast, fresh, and delivered with love.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation('/login')}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-xl flex items-center gap-2 text-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Order Now'}
                  <ArrowRight size={20} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:border-orange-500 transition-all duration-200"
                >
                  Learn More
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                {[
                  { value: '5000+', label: 'Happy Students' },
                  { value: '50+', label: 'Menu Items' },
                  { value: '10+', label: 'Vendors' }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Floating Food Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-[600px] hidden lg:block"
            >
              {foodImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: [0, -10, 0],
                    rotate: idx % 2 === 0 ? [0, 2, 0] : [0, -2, 0]
                  }}
                  transition={{ 
                    opacity: { delay: 0.2 + idx * 0.1, duration: 0.3 },
                    y: { duration: 2 + idx * 0.5, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 3 + idx * 0.5, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className="absolute rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    width: idx === 0 ? '300px' : '280px',
                    height: idx === 0 ? '400px' : '350px',
                    top: idx === 0 ? '10%' : idx === 1 ? '40%' : idx === 2 ? '5%' : '50%',
                    left: idx === 0 ? '10%' : idx === 1 ? '50%' : idx === 2 ? '60%' : '5%',
                    zIndex: idx === 0 ? 10 : idx
                  }}
                >
                  <Image 
                    src={img} 
                    alt="Food" 
                    fill 
                    className="object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-restaurant.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-1 mb-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">4.8</span>
                    </div>
                    <p className="text-xs opacity-90">Starting from ₹40</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  activeFeature === idx 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 border-transparent text-white shadow-2xl scale-105' 
                    : 'bg-white border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  activeFeature === idx ? 'bg-white/20' : 'bg-orange-50'
                }`}>
                  <div className={activeFeature === idx ? 'text-white' : 'text-orange-600'}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className={`text-sm ${activeFeature === idx ? 'text-white/90' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Cards Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Portal</h2>
            <p className="text-xl text-gray-600">Select your role to get started</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {portals.map((portal, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleNavigation(portal.path)}
                className={`bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer group border-2 border-transparent hover:border-orange-200 transition-all duration-300 ${portal.shadow}`}
              >
                <div className={`bg-gradient-to-br ${portal.gradient} p-10 transition-all duration-300`}>
                  <div className="text-white transform group-hover:scale-110 transition-transform duration-300">
                    {portal.icon}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {portal.description}
                  </p>
                  <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Access Portal
                    <ArrowRight size={20} className="ml-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Order?</h2>
            <p className="text-xl mb-8 text-white/90">Join thousands of students enjoying delicious food every day</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {['No Delivery Charges', 'Fast Pickup', 'RFID Payments'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <CheckCircle size={18} />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation('/login')}
              disabled={isLoading}
              className="mt-8 px-10 py-4 bg-white text-orange-600 font-bold rounded-xl text-lg shadow-2xl hover:shadow-white/50 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Start Ordering Now'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">CampusEats</span>
              </div>
              <p className="text-gray-400 text-sm">Making campus dining smarter, faster, and more convenient.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer transition">About Us</div>
                <div className="hover:text-white cursor-pointer transition">How It Works</div>
                <div className="hover:text-white cursor-pointer transition">Vendors</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer transition">Help Center</div>
                <div className="hover:text-white cursor-pointer transition">Contact Us</div>
                <div className="hover:text-white cursor-pointer transition">FAQs</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer transition">Privacy Policy</div>
                <div className="hover:text-white cursor-pointer transition">Terms of Service</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 CampusEats MEC. All rights reserved. Made with ❤️ for students</p>
          </div>
        </div>
      </footer>
    </div>
  )
}