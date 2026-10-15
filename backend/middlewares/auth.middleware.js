const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

// A "middleware" is a function that runs BEFORE the actual route handler.
// This one checks: "does this request have a valid login token?"
// If yes -> let the request continue (call next())
// If no  -> stop it here and send back a 401 error
async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token; // cookie-parser lets us read cookies like this

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated, no token found' });
    }

    // jwt.verify checks two things:
    // 1) has the token been tampered with?
    // 2) has it expired?
    // If either fails, it throws an error (caught below).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded.id is the customer _id we stored when the token was created
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res
        .status(401)
        .json({ success: false, message: 'Customer not found' });
    }

    // Attach the customer to the request so the next function
    // (the actual route handler) can use req.user
    req.user = customer;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
