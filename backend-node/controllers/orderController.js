const User = require('../models/User');

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ orders: user.orders || [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const orderId = req.params.id;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const order = user.orders.find(
      ord => ord._id.toString() === orderId
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

