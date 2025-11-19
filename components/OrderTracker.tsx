'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Clock, Package, Utensils, XCircle } from 'lucide-react'

interface OrderTrackerProps {
  status: string
  createdAt: string
  pickupCode?: string
}

interface TrackingStep {
  key: string
  label: string
  icon: any
  description: string
}

const trackingSteps: TrackingStep[] = [
  { key: 'PLACED', label: 'Order Placed', icon: CheckCircle, description: 'Your order has been received' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, description: 'Vendor confirmed your order' },
  { key: 'PREPARING', label: 'Preparing', icon: Utensils, description: 'Your food is being prepared' },
  { key: 'READY', label: 'Ready', icon: Package, description: 'Order ready for pickup' },
  { key: 'PICKED_UP', label: 'Completed', icon: CheckCircle, description: 'Order completed' },
]

export default function OrderTracker({ status, createdAt, pickupCode }: OrderTrackerProps) {
  const currentStepIndex = trackingSteps.findIndex(step => step.key === status)
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="bg-red-50 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-600">
          <XCircle size={32} />
          <div>
            <h3 className="font-semibold text-lg">Order Cancelled</h3>
            <p className="text-sm text-red-500">This order has been cancelled</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-textPrimary">Order Status</h3>
        {pickupCode && status === 'READY' && (
          <div className="text-center">
            <p className="text-xs text-textSecondary mb-1">Pickup Code</p>
            <p className="text-2xl font-bold text-primary">{pickupCode}</p>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div 
          className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-primary to-secondary transition-all duration-500"
          style={{ height: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {trackingSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = step.icon

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Icon Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Clock size={24} />
                    </motion.div>
                  ) : (
                    <Icon size={24} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h4
                    className={`font-semibold ${
                      isCompleted ? 'text-textPrimary' : 'text-textSecondary'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-sm text-textSecondary mt-1">{step.description}</p>
                  
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        In Progress
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Time Badge (only for completed steps) */}
                {isCompleted && index === 0 && (
                  <div className="text-xs text-textSecondary">
                    {new Date(createdAt).toLocaleTimeString()}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Estimated Time */}
      {!['PICKED_UP', 'CANCELLED'].includes(status) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg"
        >
          <div className="flex items-center gap-2 text-blue-700">
            <Clock size={18} />
            <div>
              <p className="text-sm font-semibold">
                {status === 'READY' ? 'Ready for Pickup!' : 'Estimated Time'}
              </p>
              <p className="text-xs text-blue-600">
                {status === 'READY'
                  ? 'Please collect your order'
                  : status === 'PREPARING'
                  ? 'Preparing your order... 10-15 mins'
                  : status === 'CONFIRMED'
                  ? 'Vendor will start preparing soon... 15-20 mins'
                  : 'Waiting for confirmation... 2-5 mins'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
