import api from '../lib/api'

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details including amount, items, address
 * @returns {Promise} Razorpay order details
 */
export const createPaymentOrder = async (orderData) => {
  try {
    console.log('PaymentAPI: Sending request to /payment/create-order')
    console.log('PaymentAPI: Request data:', JSON.stringify(orderData, null, 2))
    
    const response = await api.post('/payment/create-order', orderData)
    
    console.log('PaymentAPI: Response received:', response.data)
    return response.data
  } catch (error) {
    console.error('PaymentAPI: Error creating payment order')
    console.error('PaymentAPI: Error response:', error.response?.data)
    console.error('PaymentAPI: Error status:', error.response?.status)
    console.error('PaymentAPI: Error message:', error.message)
    throw error
  }
}

/**
 * Verify Razorpay payment
 * @param {Object} paymentData - Payment verification details
 * @returns {Promise} Verification result
 */
export const verifyPayment = async (paymentData) => {
  try {
    console.log('PaymentAPI: Verifying payment...')
    console.log('PaymentAPI: Verification data:', paymentData)
    
    const response = await api.post('/payment/verify', paymentData)
    
    console.log('PaymentAPI: Verification successful:', response.data)
    return response.data
  } catch (error) {
    console.error('PaymentAPI: Verification failed')
    console.error('PaymentAPI: Error response:', error.response?.data)
    console.error('PaymentAPI: Error status:', error.response?.status)
    console.error('PaymentAPI: Token being sent:', localStorage.getItem('token')?.substring(0, 20))
    throw error
  }
}

/**
 * Initialize Razorpay Checkout
 * @param {Object} options - Razorpay options
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const initiateRazorpayPayment = (options, onSuccess, onFailure) => {
  if (!window.Razorpay) {
    console.error('Razorpay SDK not loaded')
    onFailure(new Error('Payment gateway not available. Please refresh the page.'))
    return
  }

  const razorpayOptions = {
    key: options.key, // Razorpay key from backend
    amount: options.amount, // Amount in paise
    currency: options.currency || 'INR',
    name: options.name || 'EcommGo',
    description: options.description || 'Order Payment',
    image: options.image || '/vite.svg',
    order_id: options.order_id, // Razorpay order ID from backend
    handler: function (response) {
      // Payment successful
      console.log('Payment successful:', response)
      onSuccess(response)
    },
    prefill: {
      name: options.prefill?.name || '',
      email: options.prefill?.email || '',
      contact: options.prefill?.contact || ''
    },
    notes: options.notes || {},
    theme: {
      color: '#9333ea' // Purple color matching your theme
    },
    modal: {
      ondismiss: function() {
        console.log('Payment modal closed')
        onFailure(new Error('Payment cancelled by user'))
      }
    }
  }

  const razorpay = new window.Razorpay(razorpayOptions)
  
  razorpay.on('payment.failed', function (response) {
    console.error('Payment failed:', response)
    onFailure(response.error)
  })

  razorpay.open()
}

