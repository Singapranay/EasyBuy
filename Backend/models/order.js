const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  address: {
    village: String,
    streetNo: String,
    city: String,
    state: String,
    pincode: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;