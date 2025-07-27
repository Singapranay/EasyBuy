const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  emailOrMobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
  mobile: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  cart: [
    {
      name: String,
      price: Number,
      imageUrl: String,
    },
  ],
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
