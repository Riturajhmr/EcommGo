const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  house_name: { type: String },
  street_name: { type: String },
  city_name: { type: String },
  pin_code: { type: String }
}, { _id: true });

const ProductUserSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  product_name: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number },
  image: { type: String },
  quantity: { type: Number, default: 1 }
}, { _id: true });

const PaymentSchema = new mongoose.Schema({
  digital: { type: Boolean, default: false },
  cod: { type: Boolean, default: false }
});

const OrderSchema = new mongoose.Schema({
  order_list: [ProductUserSchema],
  ordered_on: { type: Date, default: Date.now },
  total_price: { type: Number, required: true },
  discount: { type: Number },
  payment_method: PaymentSchema,
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  status: { type: String },
  delivery_address: AddressSchema
}, { _id: true });

const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true, minlength: 2, maxlength: 30 },
  last_name: { type: String, required: true, minlength: 2, maxlength: 30 },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  token: { type: String },
  refresh_token: { type: String },
  user_id: { type: String, unique: true },
  usercart: { type: [ProductUserSchema], default: [] },
  address: { type: [AddressSchema], default: [] },
  orders: { type: [OrderSchema], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);

