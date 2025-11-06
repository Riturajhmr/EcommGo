import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { placeOrder } from '../services/orderAPI'
import ReceiptModal from '../components/ReceiptModal'

export default function SimpleCheckout() {
  const { items, clear } = useCart()
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!form.name || !form.email) {
      setError('Name and email are required')
      setLoading(false)
      return
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty')
      setLoading(false)
      return
    }

    try {
      // Call checkout API with cartItems
      const receiptData = await placeOrder(items)
      
      // Show receipt modal
      setReceipt(receiptData)
      setShowReceipt(true)
      
      // Clear cart
      clear()
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.response?.data?.error || 'Failed to process checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        <p className="text-gray-600 mb-4">Your cart is empty.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="bg-black text-white px-4 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Checkout Form */}
            <div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black hover:bg-gray-800 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Order</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                      </div>
                      <p className="font-bold text-gray-900">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        receipt={receipt}
      />
    </>
  )
}

