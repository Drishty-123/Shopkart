const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Shared helper: reload the user's cart with each Product reference
// swapped for real product data (name/price/image/stock), instead of
// just a bare ObjectId. Used after every mutation so the response
// always reflects fresh product info (price/stock can't go stale).
async function getPopulatedCart(userId) {
  const customer = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: 'name description price category image stock',
  });
  return customer.cart;
}

// -------------------- ADD TO CART --------------------
// POST /cart/:productId  (protected)
// Not in cart yet -> add with quantity 1. Already in cart -> quantity + 1.
async function addToCart(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user._id; // from authMiddleware — never trust req.body.userId

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(userId);
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({ success: false, message: 'Not enough stock available' });
      }
      existingItem.quantity += 1;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: 'Not enough stock available' });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();
    const cart = await getPopulatedCart(userId);

    return res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- GET CURRENT USER'S CART --------------------
// GET /cart  (protected — always the authenticated user's own cart)
async function getCart(req, res) {
  try {
    const cart = await getPopulatedCart(req.user._id);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- UPDATE QUANTITY --------------------
// PATCH /cart/:productId  (protected)  body: { quantity }
async function updateCartQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a number' });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
    }

    const customer = await Customer.findById(userId);
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    existingItem.quantity = quantity;
    await customer.save();

    const cart = await getPopulatedCart(userId);
    return res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- REMOVE FROM CART --------------------
// DELETE /cart/:productId  (protected)
async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(userId);
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await customer.save();

    const cart = await getPopulatedCart(userId);
    return res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
