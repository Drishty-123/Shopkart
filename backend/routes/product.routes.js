const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
} = require('../controllers/product.controller');

// Open for this lab — admin auth for product creation comes in a later lab
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;
