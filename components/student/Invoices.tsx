'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, Search, Printer, Share2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  orderNumber: string
  createdAt: string
  totalAmount: number
  vendor: {
    shopName: string
  }
  status: string
  participantCount: number
  splitType: string
  items?: any[]
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => 
    invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.vendor.shopName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const closeInvoiceDetails = () => {
    setSelectedInvoice(null)
  }

  const downloadInvoice = (invoiceId: string) => {
    toast.success('Invoice download started')
    // In a real implementation, this would download the actual invoice
  }

  const printInvoice = (invoiceId: string) => {
    toast.success('Printing invoice...')
    // In a real implementation, this would open a print dialog
  }

  const shareInvoice = (invoiceId: string) => {
    const shareUrl = `${window.location.origin}/invoice/${invoiceId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Invoice link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-textPrimary">Invoices</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-textSecondary">No invoices found</p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="text-primary" size={24} />
                    <div>
                      <h3 className="font-bold text-lg text-textPrimary">Invoice #{invoice.orderNumber}</h3>
                      <p className="text-sm text-textSecondary">{invoice.vendor.shopName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-textSecondary">
                    <span>{formatDate(new Date(invoice.createdAt))}</span>
                    <span>•</span>
                    <span>{invoice.participantCount} participants</span>
                    <span>•</span>
                    <span className="capitalize">{invoice.splitType} split</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{formatCurrency(invoice.totalAmount)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => viewInvoiceDetails(invoice)}
                      className="p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all duration-300"
                      title="View details"
                    >
                      <Eye size={18} className="text-gray-500 hover:text-primary transition-colors" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => downloadInvoice(invoice.id)}
                      className="p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-500/10 flex items-center justify-center transition-all duration-300"
                      title="Download"
                    >
                      <Download size={18} className="text-gray-500 hover:text-green-500 transition-colors" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => shareInvoice(invoice.id)}
                      className="p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-500/10 flex items-center justify-center transition-all duration-300"
                      title="Share"
                    >
                      <Share2 size={18} className="text-gray-500 hover:text-purple-500 transition-colors" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-textPrimary">Invoice Details</h3>
                <p className="text-textSecondary">{selectedInvoice.orderNumber}</p>
              </div>
              <button 
                onClick={closeInvoiceDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-textPrimary mb-2">Vendor</h4>
                  <p className="text-textSecondary">{selectedInvoice.vendor.shopName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-textPrimary mb-2">Date</h4>
                  <p className="text-textSecondary">{formatDate(new Date(selectedInvoice.createdAt))}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-textPrimary mb-2">Participants</h4>
                  <p className="text-textSecondary">{selectedInvoice.participantCount}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-textPrimary mb-2">Split Type</h4>
                  <p className="text-textSecondary capitalize">{selectedInvoice.splitType}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-textPrimary mb-2">Amount</h4>
                <p className="text-3xl font-bold text-primary">{formatCurrency(selectedInvoice.totalAmount)}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              
              <div>
                <h4 className="font-semibold text-textPrimary mb-2">Actions</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={() => printInvoice(selectedInvoice.id)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    <Printer size={18} />
                    <span>Print</span>
                  </button>
                  <button 
                    onClick={() => downloadInvoice(selectedInvoice.id)}
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}