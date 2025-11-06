const User = require('../models/User');

// POST /api/checkout - Mock checkout with receipt {cartItems} → {total, timestamp}
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { cartItems } = req.body; // Optional: can use cartItems from body or get from user's cart

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Use cartItems from body if provided, otherwise use user's cart
    const itemsToCheckout = cartItems || user.usercart;

    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const total = itemsToCheckout.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);

    // Create order
    const order = {
      order_list: itemsToCheckout,
      ordered_on: new Date(),
      total_price: total,
      payment_method: {
        digital: false,
        cod: true
      },
      status: 'completed'
    };

    // Add order to user's orders
    user.orders.push(order);

    // Clear cart
    user.usercart = [];

    await user.save();

    // Return mock receipt with total and timestamp
    const receipt = {
      total: total,
      timestamp: new Date().toISOString(),
      order_id: order._id,
      items: itemsToCheckout.length
    };

    res.json(receipt);
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ error: 'Failed to process checkout' });
  }
};

