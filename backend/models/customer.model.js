const mongoose = require('mongoose');

// This is the "shape" of a Customer document in MongoDB.
// Mongoose uses this schema to validate data before saving it.
const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // no two customers can have the same email
      lowercase: true, // "John@Gmail.com" gets saved as "john@gmail.com"
      trim: true, // removes accidental spaces
    },
    password: {
      type: String,
      required: true,
      // NOTE: this will always store the bcrypt HASH, never the real password
    },
    phone: {
      type: String,
      required: true,
    },
    wishlist: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      default: [],
    },
    cart: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            min: 1,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Customer', customerSchema);
