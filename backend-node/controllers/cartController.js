const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// POST /api/cart - Add item to cart {productId, qty}
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId, qty } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const quantity = qty || 1;

    // Find product - try by MongoDB _id first, then by product_id
    let product = null;
    try {
      // Try MongoDB ObjectID
      if (productId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(productId);
      }
      // If not found or not ObjectID, try by product_id field
      if (!product) {
        product = await Product.findOne({ product_id: productId });
      }
      // Last try: find by _id as string
      if (!product) {
        product = await Product.findById(productId);
      }
    } catch (err) {
      // Invalid ObjectID format, try product_id
      product = await Product.findOne({ product_id: productId });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find user
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if product already in cart (match by product_id or MongoDB _id)
    const existingItemIndex = user.usercart.findIndex(
      item => {
        const itemProductId = item.product_id || item._id?.toString();
        const productIdMatch = itemProductId === product.product_id || 
                              itemProductId === product._id.toString() ||
                              item._id?.toString() === product._id.toString();
        return productIdMatch;
      }
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      user.usercart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      user.usercart.push({
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
        rating: product.rating,
        image: product.image,
        quantity: quantity
      });
    }

    await user.save();
    res.json({ message: 'Successfully added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
};

// DELETE /api/cart/:id - Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.uid;
    const productId = req.params.id;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove item from cart - match by _id or product_id
    user.usercart = user.usercart.filter(
      item => {
        const itemId = item._id?.toString();
        const itemProductId = item.product_id;
        return itemId !== productId && itemProductId !== productId;
      }
    );

    await user.save();
    res.json({ message: 'Successfully removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove product from cart' });
  }
};

// GET /api/cart - Get cart with total
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate total
    const total = user.usercart.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    res.json({
      items: user.usercart,
      total: total
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to get user cart' });
  }
};

// PUT /api/cart/items/:id - Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const itemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.usercart.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    user.usercart[itemIndex].quantity = quantity;
    await user.save();

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

// DELETE /api/cart - Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.usercart = [];
    await user.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

