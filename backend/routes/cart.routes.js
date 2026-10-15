const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require('../controllers/cart.controller');

router.get('/', authMiddleware, getCart);
router.post('/:productId', authMiddleware, addToCart);
router.patch('/:productId', authMiddleware, updateCartQuantity);
router.delete('/:productId', authMiddleware, removeFromCart);

module.exports = router;
