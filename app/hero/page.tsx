'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag, 
  Zap, 
  Shield, 
  Clock, 
  Smartphone,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Check
} from 'lucide-react'
import Image from 'next/image'

export default function HeroPage() {
  const router = useRouter()

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Order in seconds with our optimized interface"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure RFID",
      description: "Safe and contactless payments with your campus card"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Track your order status from preparation to pickup"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Friendly",
      description: "Works seamlessly on all your devices"
    }
  ]

  const stats = [
    { value: "5000+", label: "Orders Delivered" },
    { value: "50+", label: "Menu Items" },
    { value: "10+", label: "Vendors" },
    { value: "4.8", label: "Rating" }
  ]

  const steps = [
    { step: "1", title: "Browse", desc: "Explore food from campus vendors" },
    { step: "2", title: "Order", desc: "Add items and checkout instantly" },
    { step: "3", title: "Track", desc: "Monitor your order in real-time" },
    { step: "4", title: "Pickup", desc: "Collect with your unique code" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-green-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">CampusEats</h1>
                <p className="text-xs text-textSecondary">Madras Engineering College</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="px-6 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-6"
              >
                <TrendingUp size={16} />
                <span className="text-sm font-semibold">Trusted by 5000+ Students</span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-bold text-textPrimary mb-6 leading-tight">
                Campus Food,
                <br />
                <span className="text-gradient">Delivered Smart</span>
              </h1>

              <p className="text-xl text-textSecondary mb-8 leading-relaxed">
                Order from your favorite campus vendors with RFID payments, real-time tracking, 
                and lightning-fast pickup. Your food journey starts here.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(252, 128, 25, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-lg"
                >
                  Order Now
                  <ChevronRight size={20} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white border-2 border-primary text-primary font-bold rounded-xl flex items-center gap-2"
                >
                  <Users size={20} />
                  Become a Vendor
                </motion.button>
              </div>

              <div className="flex items-center gap-6">
                {stats.slice(0, 2).map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                  >
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-textSecondary">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[600px] hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-0 right-0 w-64 bg-white rounded-2xl shadow-2xl p-6 rotate-3"
              >
                <div className="w-full h-40 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl mb-4"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">Masala Dosa</span>
                  <span className="text-primary font-bold">₹40</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-textSecondary">
                  <Star className="fill-accent text-accent" size={14} />
                  <span>4.5 (120 reviews)</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-20 left-0 w-64 bg-white rounded-2xl shadow-2xl p-6 -rotate-3"
              >
                <div className="w-full h-40 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl mb-4"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">Veg Burger</span>
                  <span className="text-primary font-bold">₹50</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-textSecondary">
                  <Star className="fill-accent text-accent" size={14} />
                  <span>4.8 (95 reviews)</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl"
              >
                <ShoppingBag className="text-white" size={40} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-textPrimary mb-4">Why Choose CampusEats?</h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              Experience the future of campus dining with our cutting-edge features
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-textPrimary mb-2">{feature.title}</h3>
                <p className="text-textSecondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-textPrimary mb-4">How It Works</h2>
            <p className="text-xl text-textSecondary">Simple steps to satisfy your cravings</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                    {item.step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-textPrimary mb-2">{item.title}</h3>
                <p className="text-textSecondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
                  className="text-5xl font-bold mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-textPrimary mb-6">
            Ready to Transform Your Campus Dining?
          </h2>
          <p className="text-xl text-textSecondary mb-8">
            Join thousands of students already enjoying faster, smarter food ordering
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(252, 128, 25, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="px-12 py-5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-2xl text-xl flex items-center gap-3 mx-auto"
          >
            Start Ordering Now
            <ChevronRight size={24} />
          </motion.button>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-textSecondary">
            <div className="flex items-center gap-2">
              <Check className="text-secondary" size={20} />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-secondary" size={20} />
              <span>RFID enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-secondary" size={20} />
              <span>Instant setup</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-textPrimary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CampusEats</h3>
              <p className="text-gray-400 text-sm">
                Making campus dining smarter, faster, and more convenient.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer">About Us</div>
                <div className="hover:text-white cursor-pointer">How It Works</div>
                <div className="hover:text-white cursor-pointer">Vendors</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer">Help Center</div>
                <div className="hover:text-white cursor-pointer">Contact Us</div>
                <div className="hover:text-white cursor-pointer">FAQs</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="hover:text-white cursor-pointer">Privacy Policy</div>
                <div className="hover:text-white cursor-pointer">Terms of Service</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 CampusEats MEC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
