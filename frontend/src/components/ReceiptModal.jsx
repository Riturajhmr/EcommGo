import { useEffect } from 'react'

export default function ReceiptModal({ isOpen, onClose, receipt }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !receipt) return null

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Order Confirmed!</h2>
              <p className="text-green-100 text-sm mt-1">Thank you for your purchase</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4 mb-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Order ID</p>
              <p className="font-mono text-sm text-gray-800">{receipt.order_id || 'N/A'}</p>
            </div>

            <div className="border-t border-b py-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">${receipt.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Order Date & Time</p>
              <p className="font-medium text-gray-900">{formatDate(receipt.timestamp)}</p>
            </div>

            {receipt.items && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Items Ordered</p>
                <p className="font-medium text-gray-900">{receipt.items} item(s)</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose()
                window.location.href = '/'
              }}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

