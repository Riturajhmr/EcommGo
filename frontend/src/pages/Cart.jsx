import { useCart } from '../context/CartContext'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { items, update, remove, clear } = useCart()
  const navigate = useNavigate()
  
  // Consolidate duplicate items by product ID and sum their quantities
  const consolidatedItems = useMemo(() => {
    const itemMap = new Map()
    
    items.forEach(item => {
      const productId = item.Product_ID || item.product_id || item._id || item.id
      if (itemMap.has(productId)) {
        // If item exists, add quantities
        const existing = itemMap.get(productId)
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1)
      } else {
        // If item doesn't exist, add it
        itemMap.set(productId, {
          ...item,
          quantity: item.quantity || 1
        })
      }
    })
    
    return Array.from(itemMap.values())
  }, [items])

  const total = consolidatedItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)
  const deliveryFee = 15
  const discount = total * 0.2 // 20% discount
  const finalTotal = total - discount + deliveryFee

  const handleCheckout = () => {
    if (consolidatedItems.length === 0) {
      alert('Your cart is empty!')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">YOUR CART</h1>
        
        {consolidatedItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-6">Your cart is empty.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {consolidatedItems.map((it, index) => {
                const productId = it.Product_ID || it.product_id || it._id || it.id
                const uniqueKey = `${productId}-${index}`
                
                return (
                  <div key={uniqueKey} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
                    {/* Remove Button */}
                    <button 
                      onClick={() => remove(productId)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {it.product_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          Size: Large • Color: {it.color || 'Default'}
                        </p>
                        <p className="font-bold text-lg text-gray-900">
                          ${it.price}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => update(productId, Math.max(1, (it.quantity || 1) - 1))}
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="w-12 text-center font-medium text-gray-900">
                          {it.quantity || 1}
                        </span>
                        
                        <button
                          onClick={() => update(productId, (it.quantity || 1) + 1)}
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Cost Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Discount (-20%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Add promo code"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                      />
                    </div>
                    <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-black hover:bg-gray-800 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    Go to Checkout
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={clear}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


