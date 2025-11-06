const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't return password
    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { first_name, last_name, email, phone } = req.body;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const update = {};
    if (first_name) update.first_name = first_name;
    if (last_name) update.last_name = last_name;
    if (email) update.email = email.toLowerCase();
    if (phone) update.phone = phone;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await User.updateOne({ user_id: userId }, { $set: update });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

