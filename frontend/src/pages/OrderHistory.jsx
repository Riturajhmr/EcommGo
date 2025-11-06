import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders } from '../services/orderAPI'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      // Handle different response formats
      const ordersList = Array.isArray(data) ? data : (data.orders || [])
      setOrders(ordersList)
      setError(null)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Failed to load order history')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-green-100 text-green-800 border-green-300'
    }
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return typeof price === 'number' ? `$${price.toFixed(2)}` : '$0.00'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Order History</h1>
              <p className="text-white/80 text-lg">View all your previous orders</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/30">
                <div className="text-3xl font-bold">{orders.length}</div>
                <div className="text-sm text-white/80">Total Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your order history here!
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order._id || order.id || index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order._id?.slice(-8) || order.id || 'N/A'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status || 'pending')}`}>
                            {(order.status || 'Pending').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on {formatDate(order.created_at || order.createdAt || order.order_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(order.total || order.total_price || order.amount)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || order.order_items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Order Items:</h4>
                  <div className="space-y-3">
                    {(order.items || order.order_items || []).map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.product_name || item.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">
                              {item.product_name || item.name || 'Product'}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPrice(item.price || 0)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  {order.address && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Delivery Address:</h4>
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          {order.address.house_name || order.address.House}, {order.address.street_name || order.address.Street || ''},{' '}
                          {order.address.city_name || order.address.City}, {order.address.pin_code || order.address.Pincode || ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Info */}
                  {order.razorpay_payment_id && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">
                        Payment ID: <span className="font-mono text-gray-900">{order.razorpay_payment_id}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


