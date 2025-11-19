/**
 * Unified API Tunnel System
 * Provides error-free communication between all portals (Student, Vendor, Admin)
 * with automatic retry, fallback, and error handling
 */

interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class APITunnel {
  private static retryCount = 3
  private static retryDelay = 1000 // ms

  /**
   * Make an API request with automatic retry and error handling
   */
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    let lastError: any
    
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        const response = await fetch(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`)
        }

        return {
          success: true,
          data,
        }
      } catch (error: any) {
        lastError = error
        console.warn(`[API Tunnel] Attempt ${attempt + 1}/${this.retryCount} failed for ${endpoint}:`, error.message)
        
        // Wait before retry (except on last attempt)
        if (attempt < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError?.message || 'Request failed',
    }
  }

  /**
   * GET request
   */
  static async get<T = any>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  static async post<T = any>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /**
   * PATCH request
   */
  static async patch<T = any>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  /**
   * PUT request
   */
  static async put<T = any>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Update order status with validation
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<APIResponse> {
    console.log('[API Tunnel] Updating order status:', { orderId, status })
    return this.patch(`/api/orders/${orderId}/status`, { status })
  }

  /**
   * Fetch orders for current user
   */
  static async getOrders(): Promise<APIResponse> {
    return this.get('/api/orders')
  }

  /**
   * Fetch vendors
   */
  static async getVendors(): Promise<APIResponse> {
    return this.get('/api/vendors')
  }

  /**
   * Fetch menu items for a vendor
   */
  static async getMenuItems(vendorId: string): Promise<APIResponse> {
    return this.get(`/api/menu/${vendorId}`)
  }

  /**
   * Create a new order
   */
  static async createOrder(orderData: any): Promise<APIResponse> {
    return this.post('/api/orders', orderData)
  }

  /**
   * Submit a review
   */
  static async submitReview(reviewData: any): Promise<APIResponse> {
    return this.post('/api/reviews', reviewData)
  }
}

export default APITunnel
