const jwt = require('jsonwebtoken');

// This function takes a customer's MongoDB _id and turns it into
// a signed JWT (JSON Web Token). Think of it as a stamped ID card
// that proves "this request really belongs to this customer".
function generateToken(customerId) {
  const token = jwt.sign(
    { id: customerId }, // payload: the data we want to store inside the token
    process.env.JWT_SECRET, // secret key used to "sign" (stamp) the token
    { expiresIn: '7d' } // token becomes invalid automatically after 7 days
  );

  return token;
}

module.exports = generateToken;
