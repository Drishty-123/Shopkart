const express = require('express');
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
} = require('../controllers/customer.controller');

const authMiddleware = require('../middlewares/auth.middleware');

// Public routes (no login needed)
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes (authMiddleware runs first, then the controller)
router.get('/me', authMiddleware, getMyProfile);
router.post('/logout', authMiddleware, logoutCustomer);
router.patch('/change-password', authMiddleware, changePassword);

module.exports = router;
