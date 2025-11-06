const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  product_id: { type: String, unique: true },
  product_name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  rating: { type: Number },
  feature: { type: String },
  description: { type: String },
  detailed_description: { type: String },
  specifications: { type: Map, of: String },
  image: { type: String },
  images: { type: [String] },
  stock: { type: Number },
  tags: { type: [String] }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);

