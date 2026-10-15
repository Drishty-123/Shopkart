const crypto = require('crypto');

// Razorpay signs "<razorpay_order_id>|<razorpay_payment_id>" with HMAC
// SHA256 using your Key SECRET. Only Razorpay and our server know that
// secret, so only a genuine payment can produce a matching signature —
// the browser cannot forge one.
function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  if (
    typeof razorpayOrderId !== 'string' ||
    typeof razorpayPaymentId !== 'string' ||
    typeof signature !== 'string'
  ) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const givenBuf = Buffer.from(signature, 'utf8');

  // timingSafeEqual throws if lengths differ, so check length first.
  if (expectedBuf.length !== givenBuf.length) return false;

  // Constant-time compare, so response timing can't leak how many
  // leading characters of a guessed signature were correct.
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

module.exports = verifyRazorpaySignature;
