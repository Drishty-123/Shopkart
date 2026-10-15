const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// -------------------- ADD TO WISHLIST --------------------
// POST /wishlist/:productId  (protected)
async function addToWishlist(req, res) {
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

    const alreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadyWishlisted) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- GET CURRENT USER'S WISHLIST --------------------
// GET /wishlist  (protected — always the authenticated user's own list)
async function getWishlist(req, res) {
  try {
    const userId = req.user._id;

    const customer = await Customer.findById(userId).populate({
      path: 'wishlist',
      select: 'name description price category image stock',
    });

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- REMOVE FROM WISHLIST --------------------
// DELETE /wishlist/:productId  (protected)
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(userId);

    const isInWishlist = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (!isInWishlist) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist' });
    }

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await customer.save();

    return res.status(200).json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- BONUS: TOGGLE --------------------
// PATCH /wishlist/:productId/toggle  (protected)
async function toggleWishlist(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(userId);
    const alreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyWishlisted) {
      customer.wishlist = customer.wishlist.filter(
        (id) => id.toString() !== productId
      );
      await customer.save();
      return res.status(200).json({ success: true, saved: false, message: 'Product removed from wishlist' });
    }

    customer.wishlist.push(productId);
    await customer.save();
    return res.status(200).json({ success: true, saved: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- BONUS: WISHLIST COUNT --------------------
// GET /wishlist/count  (protected) — lightweight, no populate needed
async function getWishlistCount(req, res) {
  try {
    const userId = req.user._id;
    const customer = await Customer.findById(userId).select('wishlist');
    return res.status(200).json({ success: true, count: customer.wishlist.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
};
