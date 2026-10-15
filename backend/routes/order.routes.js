const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

const {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');

// Every order route is protected — the user always comes from the JWT.
router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.post('/payment-failed', authMiddleware, markPaymentFailed);

router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);

// Bonus (dev only): move an order through PLACED -> ... -> DELIVERED
router.patch('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
