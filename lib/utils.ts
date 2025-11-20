import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD${timestamp}${random}`
}

export function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateShareLink(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`
}

export function formatDate(date: any): string {
  if (!date) return 'N/A'
  
  try {
    let dateObj: Date
    
    // Handle Firebase Timestamp
    if (date?.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate()
    }
    // Handle Firestore Timestamp object with seconds
    else if (date?.seconds) {
      dateObj = new Date(date.seconds * 1000)
    }
    // Handle ISO string or number
    else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date)
    }
    // Already a Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Fallback
    else {
      dateObj = new Date(date)
    }
    
    // Validate date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(dateObj)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid Date'
  }
}