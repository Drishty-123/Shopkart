const mongoose = require('mongoose');
const Product = require('../models/product.model');

// -------------------- CREATE PRODUCT --------------------
// POST /products
async function createProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image) {
      return res
        .status(400)
        .json({ success: false, message: 'name, description, category and image are required' });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Price must be greater than 0' });
    }

    if (stock === undefined || stock === null || Number(stock) < 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Stock cannot be negative' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    // Mongoose validation errors (e.g. min:0.01 on price) land here too
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- GET ALL PRODUCTS (search + filter + sort) --------------------
// GET /products?search=keyboard&category=Electronics&sort=price_asc
async function getAllProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    // Build the query object dynamically instead of writing a separate
    // endpoint/branch for every possible combination of filters.
    const query = {};

    if (search) {
      // case-insensitive match on product name
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    let productsQuery = Product.find(query);

    if (sort === 'price_asc') {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      productsQuery = productsQuery.sort({ price: -1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 }); // newest first by default
    }

    const products = await productsQuery;

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- GET SINGLE PRODUCT --------------------
// GET /products/:id
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
