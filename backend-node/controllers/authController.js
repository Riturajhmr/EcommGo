const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { tokenGenerator, updateAllTokens } = require('../utils/token');
const mongoose = require('mongoose');

// POST /api/auth/register
exports.signUp = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (first_name.length < 2 || first_name.length > 30) {
      return res.status(400).json({ error: 'First name must be between 2 and 30 characters' });
    }

    if (last_name.length < 2 || last_name.length > 30) {
      return res.status(400).json({ error: 'Last name must be between 2 and 30 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone is already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 14);

    // Create user
    const user_id = new mongoose.Types.ObjectId().toString();
    const { token, refreshToken } = tokenGenerator(email, first_name, last_name, user_id);

    const user = new User({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      token,
      refresh_token: refreshToken,
      user_id,
      usercart: [],
      address: [],
      orders: []
    });

    await user.save();

    res.status(201).json({ message: 'Successfully Signed Up!!' });
  } catch (error) {
    console.error('Error signing up:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field === 'email' ? 'Email' : field === 'phone' ? 'Phone' : field} is already in use` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'login or password incorrect' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Login Or Password is Incorrect' });
    }

    // Generate new tokens
    const { token, refreshToken } = tokenGenerator(
      user.email,
      user.first_name,
      user.last_name,
      user.user_id
    );

    // Update tokens in database
    await updateAllTokens(token, refreshToken, user.user_id);

    // Return user data (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      ...userResponse,
      token,
      refresh_token: refreshToken
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

