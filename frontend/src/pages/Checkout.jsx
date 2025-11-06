import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrder } from '../services/orderAPI'
import { getAddresses } from '../services/addressAPI'
import { createPaymentOrder, verifyPayment, initiateRazorpayPayment } from '../services/paymentAPI'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { items, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressData = await getAddresses()
        console.log('Fetched addresses:', addressData) // Debug log
        setAddresses(addressData || [])
        if (addressData && addressData.length > 0) {
          setSelectedAddress(addressData[0])
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        setAddresses([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAddresses()
    }
  }, [user])

  const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)

  const onPlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select an address')
      return
    }

    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (total <= 0) {
      alert('Invalid order total')
      return
    }

    setPlacing(true)
    try {
      // Step 1: Create Razorpay order
      console.log('Creating payment order...')
      
      // Prepare clean data for backend
      const orderData = {
        amount: Number(total),
        items: items.map(item => {
          const cleanItem = {
            product_id: String(item.product_id || item.Product_ID || item._id || ''),
            product_name: String(item.product_name || item.Product_Name || 'Product'),
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1)
          }
          console.log('Cleaned item:', cleanItem)
          return cleanItem
        }),
        address: {
          house_name: String(selectedAddress.house_name || selectedAddress.House || ''),
          street_name: String(selectedAddress.street_name || selectedAddress.Street || ''),
          city_name: String(selectedAddress.city_name || selectedAddress.City || ''),
          pin_code: String(selectedAddress.pin_code || selectedAddress.Pincode || '')
        }
      }
      
      console.log('=== CHECKOUT DEBUG ===')
      console.log('Total:', total)
      console.log('Items count:', items.length)
      console.log('Raw items:', items)
      console.log('Cleaned order data:', orderData)
      console.log('Order data JSON:', JSON.stringify(orderData))
      console.log('=====================')
      
      const paymentOrderData = await createPaymentOrder(orderData)

      console.log('Payment order created:', paymentOrderData)

      // Step 2: Initialize Razorpay checkout
      initiateRazorpayPayment(
        {
          key: paymentOrderData.razorpay_key,
          amount: paymentOrderData.amount,
          currency: paymentOrderData.currency,
          order_id: paymentOrderData.order_id,
          name: 'EcommGo',
          description: `Order for ${items.length} item(s)`,
          prefill: {
            name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          notes: {
            order_items: items.length,
            customer_id: user?._id || ''
          }
        },
        async (paymentResponse) => {
          // Step 3: Payment successful - verify and place order
          try {
            console.log('Payment successful, verifying...')
            const verificationResult = await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              items: items,
              address: selectedAddress,
              total: total
            })

            console.log('Payment verified:', verificationResult)
            
            // Clear cart after successful payment
            clear()
            
            alert('🎉 Payment successful! Your order has been placed.')
            navigate('/profile') // Redirect to profile/orders
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support with payment ID: ' + paymentResponse.razorpay_payment_id)
          } finally {
            setPlacing(false)
          }
        },
        (error) => {
          // Payment failed or cancelled
          console.error('Payment failed:', error)
          alert(error.message || 'Payment failed. Please try again.')
          setPlacing(false)
        }
      )
    } catch (error) {
      console.error('=== PAYMENT ERROR ===')
      console.error('Error object:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error message:', error.message)
      console.error('===================')
      
      let errorMessage = 'Failed to initiate payment'
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid payment data. Please check your cart and address.'
        if (error.response?.data?.details) {
          errorMessage += '\nDetails: ' + error.response.data.details
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again or contact support.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else {
        errorMessage = error.message
      }
      
      alert(errorMessage)
      setPlacing(false)
    }
  }

  if (loading) return <div className="p-6">Loading addresses...</div>

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        <p className="text-slate-600 mb-4">Your cart is empty.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-black text-white px-4 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      
      {/* Cart Items */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-medium mb-3">Order Summary</h2>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={`${item.Product_ID || item.product_id || item._id}-${index}`} className="flex justify-between">
              <span>{item.product_name} x {item.quantity || 1}</span>
              <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Address Selection */}
      <div className="border rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Delivery Address</h2>
          <button 
            onClick={() => navigate('/address')} 
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            + Add New Address
          </button>
        </div>
        {addresses.length === 0 ? (
          <div className="text-center">
            <p className="text-slate-600 mb-4">No addresses found. Please add an address first.</p>
            <button 
              onClick={() => navigate('/address')} 
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {addresses.map((address, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="address"
                  value={index}
                  checked={selectedAddress === address}
                  onChange={() => setSelectedAddress(address)}
                  className="mr-2"
                />
                <span>
                  {address.house_name || address.House || 'N/A'}, {address.street_name || address.Street || 'N/A'}, {address.city_name || address.City || 'N/A'} - {address.pin_code || address.Pincode || 'N/A'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Secure Payment via Razorpay</h3>
            <p className="text-sm text-gray-700 mb-3">
              Your payment is secured by Razorpay. We support multiple payment methods:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>UPI</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cards</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Net Banking</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Wallets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <button 
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg w-full font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3" 
        disabled={placing || addresses.length === 0} 
        onClick={onPlaceOrder}
      >
        {placing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Proceed to Payment - ₹{total.toFixed(2)}</span>
          </>
        )}
      </button>
      
      <p className="text-center text-xs text-gray-500">
        By placing this order, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
