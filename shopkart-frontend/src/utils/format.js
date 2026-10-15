export const formatINR = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// The first characters of a Mongo id are a timestamp (nearly identical
// for orders placed close together), so the LAST characters are the
// distinguishing ones.
export const shortOrderId = (id) => `#${String(id).slice(-8).toUpperCase()}`;
