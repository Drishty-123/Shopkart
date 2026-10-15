const Razorpay = require('razorpay');

let instance = null;

// The Razorpay client is created lazily (on first use) instead of at
// require-time. Reason: `new Razorpay()` throws immediately if the keys
// are missing, which would crash the WHOLE server on startup for anyone
// who hasn't added their test keys to .env yet. With lazy creation the
// rest of ShopKart (auth, products, cart...) keeps working, and only the
// payment endpoint reports a clear "gateway not configured" error.
function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay keys are not configured');
    error.code = 'RAZORPAY_NOT_CONFIGURED';
    throw error;
  }

  if (!instance) {
    instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return instance;
}

module.exports = { getRazorpay };
