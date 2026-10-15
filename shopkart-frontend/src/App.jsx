import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import { getMyProfile, getWishlistCount } from "./services/api";
import { CartProvider, useCart } from "./context/CartContext";

function AppRoutes() {
  // We can't read the HttpOnly cookie directly, so this state is just a
  // UI hint for showing/hiding Products/Wishlist/Cart/Logout in the
  // navbar. It's kept in sync at two points: an initial check on page
  // load (so a refresh while genuinely logged in still shows the
  // links), and explicit flips on login success / logout. Home.jsx's
  // own GET /customers/me call remains the real access control for /home.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Bonus: wishlist count in the navbar, always pulled from the backend
  // (never hardcoded) and refreshed whenever a page tells us the
  // wishlist changed (added/removed a product).
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlistCount = useCallback(() => {
    getWishlistCount()
      .then((res) => setWishlistCount(res.data.count))
      .catch(() => {});
  }, []);

  // Cart's global state lives in CartContext (see context/CartContext.jsx)
  // — this component only tells it WHEN to refresh/clear, it never
  // holds cart data itself.
  const { refreshCart, clearCart } = useCart();

  useEffect(() => {
    getMyProfile()
      .then(() => {
        setIsAuthenticated(true);
        refreshWishlistCount();
        refreshCart();
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setCheckedAuth(true));
    // Only ever run once on initial mount — refreshWishlistCount/refreshCart
    // are stable (wrapped in useCallback), so this isn't an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Avoid a flash of "logged out" navbar while the initial check is
  // still in flight on first load.
  if (!checkedAuth) return null;

  return (
    <BrowserRouter>
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          setIsAuthenticated(false);
          clearCart();
        }}
        wishlistCount={wishlistCount}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                refreshWishlistCount();
                refreshCart();
              }}
            />
          }
        />
        <Route path="/home" element={<Home />} />
        <Route
          path="/products"
          element={<Products onWishlistChange={refreshWishlistCount} />}
        />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route
          path="/wishlist"
          element={<Wishlist onWishlistChange={refreshWishlistCount} />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}
