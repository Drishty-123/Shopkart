import axios from "axios";

// Base URL of your Lab 01 backend. Change this if it runs on a different port.
const BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  // withCredentials tells the browser to send/receive cookies on
  // cross-origin requests. Without this, the HttpOnly "token" cookie
  // the backend sets on login would never be stored or sent back.
  withCredentials: true,
});

export const registerCustomer = (data) => api.post("/customers/register", data);

export const loginCustomer = (data) => api.post("/customers/login", data);

export const getMyProfile = () => api.get("/customers/me");

export const logoutCustomer = () => api.post("/customers/logout");

// Products. `params` is passed straight through as axios query params,
// e.g. getProducts({ search: "phone", category: "Electronics" }) becomes
// GET /products?search=phone&category=Electronics
export const getProducts = (params = {}) => api.get("/products", { params });

export const getProductById = (id) => api.get(`/products/${id}`);

// Wishlist. All of these are protected on the backend — the user is
// identified from the auth cookie, never sent by the client.
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);

export const getWishlist = () => api.get("/wishlist");

export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

export const getWishlistCount = () => api.get("/wishlist/count");

// Cart. All protected — user identified from the auth cookie.
export const addToCart = (productId) => api.post(`/cart/${productId}`);

export const getCart = () => api.get("/cart");

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// Orders + payment. All protected. The frontend only ever sends the
// shipping address when creating a payment order — the backend reads the
// cart itself and calculates the total, so nothing price-related is sent.
export const createPaymentOrder = (shippingAddress) =>
  api.post("/orders/create-payment-order", { shippingAddress });

// Sends Razorpay's three returned values to the backend for signature
// verification. The browser never decides whether a payment succeeded.
export const verifyPayment = (payload) => api.post("/orders/verify-payment", payload);

export const reportPaymentFailed = (shopKartOrderId) =>
  api.post("/orders/payment-failed", { shopKartOrderId });

export const getOrders = () => api.get("/orders");

export const getOrderById = (id) => api.get(`/orders/${id}`);

export default api;
