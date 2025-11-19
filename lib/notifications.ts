/**
 * Real-time Notification System
 * Provides toast notifications and order status tracking
 */

import toast from 'react-hot-toast'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
}

class NotificationService {
  private static notifications: Notification[] = []
  private static listeners: Array<(notifications: Notification[]) => void> = []

  /**
   * Show a toast notification
   */
  static show(message: string, type: NotificationType = 'info') {
    switch (type) {
      case 'success':
        toast.success(message, {
          duration: 4000,
          position: 'top-right',
          icon: '✅',
        })
        break
      case 'error':
        toast.error(message, {
          duration: 5000,
          position: 'top-right',
          icon: '❌',
        })
        break
      case 'warning':
        toast(message, {
          duration: 4000,
          position: 'top-right',
          icon: '⚠️',
        })
        break
      default:
        toast(message, {
          duration: 3000,
          position: 'top-right',
          icon: 'ℹ️',
        })
    }
  }

  /**
   * Success notification
   */
  static success(message: string) {
    this.show(message, 'success')
  }

  /**
   * Error notification
   */
  static error(message: string) {
    this.show(message, 'error')
  }

  /**
   * Info notification
   */
  static info(message: string) {
    this.show(message, 'info')
  }

  /**
   * Warning notification
   */
  static warning(message: string) {
    this.show(message, 'warning')
  }

  /**
   * Order status notifications
   */
  static orderPlaced(orderNumber: string) {
    this.success(`Order #${orderNumber} placed successfully! 🎉`)
  }

  static orderConfirmed(orderNumber: string) {
    this.info(`Order #${orderNumber} confirmed by vendor ✓`)
  }

  static orderPreparing(orderNumber: string) {
    this.info(`Your order #${orderNumber} is being prepared 🍳`)
  }

  static orderReady(orderNumber: string) {
    this.success(`Order #${orderNumber} is ready for pickup! 📦`)
  }

  static orderPickedUp(orderNumber: string) {
    this.success(`Order #${orderNumber} completed! Thank you! 🙏`)
  }

  static orderCancelled(orderNumber: string) {
    this.warning(`Order #${orderNumber} has been cancelled`)
  }

  /**
   * Add a persistent notification
   */
  static addNotification(title: string, message: string, type: NotificationType = 'info') {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    }

    this.notifications.unshift(notification)
    this.notifyListeners()
    
    // Also show toast
    this.show(message, type)
  }

  /**
   * Get all notifications
   */
  static getAll(): Notification[] {
    return this.notifications
  }

  /**
   * Get unread count
   */
  static getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  /**
   * Mark notification as read
   */
  static markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  /**
   * Mark all as read
   */
  static markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.notifyListeners()
  }

  /**
   * Clear all notifications
   */
  static clear() {
    this.notifications = []
    this.notifyListeners()
  }

  /**
   * Subscribe to notification updates
   */
  static subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications))
  }
}

export default NotificationService
