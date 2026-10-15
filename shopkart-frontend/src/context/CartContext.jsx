import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartQuantity as updateCartQuantityApi,
  removeFromCart as removeFromCartApi,
} from "../services/api";

const CartContext = createContext(null);

// This is the single shared source of cart truth for the whole app.
// Navbar, ProductCard, ProductDetails and the Cart page all read from
// (and mutate through) this same context instead of each fetching or
// storing their own copy — so "Navbar says Cart (2), Cart Page shows 3
// items" can't happen, because there's only ever one `items` array.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ product, quantity }]
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"

  // Per-product in-flight flag, so e.g. clicking "+" on one cart row
  // only disables THAT row's buttons, not the entire cart/page.
  const [itemLoading, setItemLoading] = useState({});
  const setBusy = (productId, busy) =>
    setItemLoading((prev) => ({ ...prev, [productId]: busy }));

  const refreshCart = useCallback(() => {
    setStatus("loading");
    return getCart()
      .then((res) => {
        setItems(res.data.cart);
        setStatus("success");
      })
      .catch((err) => {
        // Not logged in yet (e.g. first load before auth check resolves)
        // isn't a real error — just means an empty cart for now.
        if (err.response?.status === 401) {
          setItems([]);
          setStatus("success");
        } else {
          setStatus("error");
        }
      });
  }, []);

  // Called right after logout so the navbar count / cart page reset
  // instantly instead of showing the previous user's items.
  const clearCart = useCallback(() => {
    setItems([]);
    setStatus("success");
  }, []);

  const addItem = useCallback(async (productId) => {
    setBusy(productId, true);
    try {
      const res = await addToCartApi(productId);
      setItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || "Unable to add to cart.",
      };
    } finally {
      setBusy(productId, false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setBusy(productId, true);
    try {
      const res = await updateCartQuantityApi(productId, quantity);
      setItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || "Unable to update quantity.",
      };
    } finally {
      setBusy(productId, false);
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    setBusy(productId, true);
    try {
      const res = await removeFromCartApi(productId);
      setItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || "Unable to remove item.",
      };
    } finally {
      setBusy(productId, false);
    }
  }, []);

  // Derived values — never stored separately, always calculated fresh
  // from `items` so they can never drift out of sync with it.
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [items]
  );

  const isInCart = useCallback(
    (productId) => items.some((item) => item.product?._id === productId),
    [items]
  );

  const value = {
    items,
    status,
    itemLoading,
    refreshCart,
    clearCart,
    addItem,
    updateQuantity,
    removeItem,
    totalItems,
    subtotal,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
