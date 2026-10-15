// Client-side shipping validation. This only gives instant feedback —
// the backend re-validates everything, since client checks can be bypassed.
export const EMPTY_SHIPPING = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

const LABELS = {
  fullName: "Full name",
  phone: "Phone number",
  addressLine1: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

export function validateShipping(form) {
  const errors = {};

  for (const key of Object.keys(LABELS)) {
    // trim() so whitespace-only input counts as empty
    if (!form[key].trim()) errors[key] = `${LABELS[key]} is required`;
  }

  if (!errors.phone && !/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = "Phone number must contain 10 digits.";
  }

  if (!errors.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
}
