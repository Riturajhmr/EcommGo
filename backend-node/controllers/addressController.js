const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/address
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ addresses: user.address || [] });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to get addresses' });
  }
};

// POST /api/address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { house_name, street_name, city_name, pin_code } = req.body;

    if (!house_name || !street_name || !city_name || !pin_code) {
      return res.status(400).json({ error: 'All address fields are required' });
    }

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newAddress = {
      house_name,
      street_name,
      city_name,
      pin_code
    };

    user.address.push(newAddress);
    await user.save();

    res.json({ message: 'Address added successfully', address: newAddress });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

// PUT /api/address/:id
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.uid;
    const addressId = req.params.id;
    const { house_name, street_name, city_name, pin_code } = req.body;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addressIndex = user.address.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (house_name) user.address[addressIndex].house_name = house_name;
    if (street_name) user.address[addressIndex].street_name = street_name;
    if (city_name) user.address[addressIndex].city_name = city_name;
    if (pin_code) user.address[addressIndex].pin_code = pin_code;

    await user.save();

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

// DELETE /api/address/:id
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.uid;
    const addressId = req.params.id;

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.address = user.address.filter(
      addr => addr._id.toString() !== addressId
    );

    await user.save();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};

