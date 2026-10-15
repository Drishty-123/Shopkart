const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Order = require('../models/order.model');
const { getRazorpay } = require('../config/razorpay');
const validateShippingAddress = require('../utils/validateShippingAddress');
const verifyRazorpaySignature = require('../utils/razorpaySignature');

// -------------------- CREATE PAYMENT ORDER --------------------
// POST /orders/create-payment-order
// Body: { shippingAddress }  — nothing else is trusted from the client.
// (If the client also sends totalAmount / items / prices, they are
// simply never read.)
async function createPaymentOrder(req, res) {
  try {
    const userId = req.user._id;

    // 1. Validate shipping details (server-side, independent of the UI)
    const { valid, errors, cleaned } = validateShippingAddress(req.body.shippingAddress);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: Object.values(errors)[0],
        errors,
      });
    }

    // 2. Load the authenticated user's cart with the LATEST product data
    const customer = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price image stock',
    });

    if (!customer.cart.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 3. Re-verify every product + stock, build the snapshot, and
    //    calculate the total ON THE SERVER. Money is summed in paise
    //    (integers) to avoid floating point errors like 0.1 + 0.2.
    const items = [];
    let totalPaise = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product; // null if the product was deleted

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            'A product in your cart is no longer available. Please remove it and try again.',
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalPaise += Math.round(product.price * 100) * cartItem.quantity;
    }

    const totalAmount = totalPaise / 100;

    // 4. Make sure the payment gateway is configured BEFORE we write
    //    anything, so a missing key never leaves an orphan pending order.
    let razorpay;
    try {
      razorpay = getRazorpay();
    } catch (error) {
      console.error(error.message);
      return res
        .status(500)
        .json({ success: false, message: 'Payment gateway is not configured' });
    }

    // 5. Persist the PENDING ShopKart order (cart is left untouched)
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress: cleaned,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    // 6. Create the Razorpay Order. Razorpay wants the amount in the
    //    smallest currency unit (paise for INR): Rs 7,497 -> 749700.
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: totalPaise,
        currency: 'INR',
        receipt: order._id.toString(),
      });
    } catch (error) {
      console.error('Razorpay order creation failed:', error?.error || error);
      order.paymentStatus = 'FAILED';
      await order.save();
      return res
        .status(502)
        .json({ success: false, message: 'Unable to start payment. Please try again.' });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // 7. Return ONLY safe checkout data. The Key ID is public by design;
    //    the Key SECRET never leaves the server.
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- VERIFY PAYMENT --------------------
// POST /orders/verify-payment
async function verifyPayment(req, res) {
  try {
    const userId = req.user._id;
    const {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing payment details' });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    // Only the owner's own order can be verified.
    const order = await Order.findOne({ _id: shopKartOrderId, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Already confirmed (e.g. the browser retried) -> idempotent success.
    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, order });
    }

    // The browser-supplied order id must match the one WE stored.
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
      return res
        .status(400)
        .json({ success: false, message: 'Payment does not match this order' });
    }

    // Signature is computed with the order id from OUR database, not the
    // browser's copy. Invalid -> order stays pending, cart is NOT cleared.
    const signatureValid = verifyRazorpaySignature({
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId,
      signature,
    });

    if (!signatureValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid payment signature' });
    }

    // Mark PAID atomically. The `$ne: 'PAID'` condition means two
    // simultaneous verify calls can't both "win" — the loser gets null.
    const confirmed = await Order.findOneAndUpdate(
      { _id: order._id, user: userId, paymentStatus: { $ne: 'PAID' } },
      {
        $set: {
          paymentStatus: 'PAID',
          status: 'PLACED',
          razorpayPaymentId,
        },
      },
      { new: true }
    );

    if (!confirmed) {
      const existing = await Order.findById(order._id);
      return res.status(200).json({ success: true, order: existing });
    }

    // Payment is verified -> NOW (and only now) clear the cart. If this
    // step fails the payment is still safely recorded, so we log it and
    // still report success rather than telling a paid customer it failed.
    try {
      const customer = await Customer.findById(userId);
      customer.cart = [];
      await customer.save();
    } catch (error) {
      console.error('Order confirmed but clearing cart failed:', error);
    }

    return res.status(200).json({ success: true, order: confirmed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- PAYMENT FAILED (optional bookkeeping) --------------------
// POST /orders/payment-failed   body: { shopKartOrderId }
// Called by the frontend when Razorpay Checkout reports payment.failed.
// Only flips PENDING -> FAILED; a later successful retry can still move
// the order to PAID. The cart is never touched here.
async function markPaymentFailed(req, res) {
  try {
    const { shopKartOrderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOneAndUpdate(
      { _id: shopKartOrderId, user: req.user._id, paymentStatus: 'PENDING' },
      { $set: { paymentStatus: 'FAILED' } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pending order not found' });
    }

    return res.status(200).json({ success: true, message: 'Payment marked as failed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- GET MY ORDERS --------------------
// GET /orders
// Only the authenticated user's orders, newest first. Orders still
// waiting for payment (abandoned checkouts) are not real purchases yet,
// so they are left out of "My Orders".
async function getOrders(req, res) {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: { $ne: 'PENDING_PAYMENT' },
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- GET ONE ORDER --------------------
// GET /orders/:id
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    // Ownership is enforced in the query itself: someone else's order
    // simply doesn't match, so it's indistinguishable from "not found"
    // (this also avoids confirming that another user's order ID exists).
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- BONUS: ORDER STATUS PROGRESSION --------------------
// PATCH /orders/:id/status   body: { status }
// Temporary DEVELOPMENT endpoint (disabled when NODE_ENV=production).
// A real app would restrict this to an admin role.
const ALLOWED_PROGRESS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

async function updateOrderStatus(req, res) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res
        .status(403)
        .json({ success: false, message: 'Not available in production' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    if (!ALLOWED_PROGRESS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_PROGRESS.join(', ')}`,
      });
    }

    // Only paid orders can progress.
    const order = await Order.findOneAndUpdate(
      { _id: id, user: req.user._id, paymentStatus: 'PAID' },
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Paid order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
