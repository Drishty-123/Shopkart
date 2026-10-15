// Server-side shipping validation. The frontend validates too, but that
// can be bypassed (Postman, curl, disabled JS), so the backend must
// re-check independently and never trust the client.
const FIELDS = [
  ['fullName', 'Full name'],
  ['phone', 'Phone number'],
  ['addressLine1', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['pincode', 'Pincode'],
];

function validateShippingAddress(input) {
  const errors = {};
  const cleaned = {};

  const source = input && typeof input === 'object' ? input : {};

  for (const [key, label] of FIELDS) {
    const raw = source[key];
    // Non-strings and whitespace-only strings both count as empty.
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) {
      errors[key] = `${label} is required`;
    }
    cleaned[key] = value;
  }

  if (!errors.phone && !/^\d{10}$/.test(cleaned.phone)) {
    errors.phone = 'Phone number must contain 10 digits';
  }

  if (!errors.pincode && !/^\d{6}$/.test(cleaned.pincode)) {
    errors.pincode = 'Pincode must contain 6 digits';
  }

  return { valid: Object.keys(errors).length === 0, errors, cleaned };
}

module.exports = validateShippingAddress;
