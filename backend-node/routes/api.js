const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

// Import controllers
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const checkoutController = require('../controllers/checkoutController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');

// Auth routes (public)
router.post('/auth/register', authController.signUp);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Product routes (public)
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/search', productController.searchProducts);

// Cart routes (protected - require authentication)
router.get('/cart', authenticate, cartController.getCart);
router.post('/cart', authenticate, cartController.addToCart); // Assignment requirement: POST /api/cart
router.put('/cart/items/:id', authenticate, cartController.updateCartItem); // Update cart item quantity
router.delete('/cart/:id', authenticate, cartController.removeFromCart); // Assignment requirement: DELETE /api/cart/:id
router.delete('/cart', authenticate, cartController.clearCart); // Clear entire cart

// Checkout route (protected)
router.post('/checkout', authenticate, checkoutController.checkout); // Assignment requirement: POST /api/checkout

// User routes (protected)
router.get('/user/profile', authenticate, userController.getProfile);
router.put('/user/profile', authenticate, userController.updateProfile);

// Address routes (protected)
router.get('/address', authenticate, addressController.getAddresses);
router.post('/address', authenticate, addressController.addAddress);
router.put('/address/:id', authenticate, addressController.updateAddress);
router.delete('/address/:id', authenticate, addressController.deleteAddress);

// Order routes (protected)
router.get('/orders', authenticate, orderController.getOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);

// Payment routes (protected) - Mock endpoints for frontend compatibility
router.post('/payment/create-order', authenticate, paymentController.createPaymentOrder);
router.post('/payment/verify', authenticate, paymentController.verifyPayment);
router.get('/payment/:id', authenticate, paymentController.getPaymentStatus);

module.exports = router;

