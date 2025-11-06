// Mock payment controller - Assignment doesn't require real payments
// These endpoints are stubs for frontend compatibility

// POST /api/payment/create-order
exports.createPaymentOrder = async (req, res) => {
  try {
    // Mock payment order creation
    // In a real app, this would create a Razorpay order
    const { amount, items, address } = req.body;

    // Generate mock order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      order_id: orderId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      razorpay_key: process.env.RAZORPAY_KEY || 'rzp_test_key' // Mock key
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    // Mock payment verification
    // In a real app, this would verify Razorpay payment signature
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, address, total } = req.body;

    // Mock verification - always succeeds
    res.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

// GET /api/payment/:id
exports.getPaymentStatus = async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Mock payment status
    res.json({
      payment_id: paymentId,
      status: 'completed',
      amount: 0
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

