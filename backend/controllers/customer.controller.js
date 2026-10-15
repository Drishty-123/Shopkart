const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10; // how many times bcrypt "scrambles" the password (more = slower but safer)

// -------------------- REGISTER --------------------
// POST /customers/register
async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already registered' });
    }

    // Never store the real password. Hash it first.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        // password is deliberately left out of the response
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- LOGIN --------------------
// POST /customers/login
async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    const customer = await Customer.findOne({ email });

    // Same error message whether the email or the password was wrong.
    // This stops attackers from figuring out which emails are registered.
    if (!customer) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(customer._id);

    // Put the token inside an HttpOnly cookie instead of the JSON response.
    // HttpOnly means JavaScript running in the browser CANNOT read this
    // cookie — it can only be sent automatically by the browser itself.
    // This protects the token from being stolen via XSS attacks.
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only over HTTPS in production
      sameSite: 'strict', // cookie won't be sent on cross-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

// -------------------- MY PROFILE --------------------
// GET /customers/me
async function getMyProfile(req, res) {
  // By the time we get here, authMiddleware has already verified the
  // token and attached the customer document to req.user.
  return res.status(200).json(req.user);
}

// -------------------- LOGOUT --------------------
// POST /customers/logout
async function logoutCustomer(req, res) {
  // Overwrites the cookie with an empty/expired one so the browser deletes it.
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// -------------------- CHANGE PASSWORD (Bonus) --------------------
// PATCH /customers/change-password
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Old and new password are required' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const customer = await Customer.findById(req.user._id);

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, customer.password);
    if (!isOldPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: 'Old password is incorrect' });
    }

    customer.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await customer.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};
