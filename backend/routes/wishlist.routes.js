const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
} = require('../controllers/wishlist.controller');

// /wishlist/count is registered before /:productId patterns so it's
// matched literally rather than treated as a productId value.
router.get('/count', authMiddleware, getWishlistCount);

router.get('/', authMiddleware, getWishlist);
router.post('/:productId', authMiddleware, addToWishlist);
router.delete('/:productId', authMiddleware, removeFromWishlist);
router.patch('/:productId/toggle', authMiddleware, toggleWishlist);

module.exports = router;
