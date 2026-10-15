import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

export default function Cart() {
  const { items, status, refreshCart, totalItems, subtotal } = useCart();
  const navigate = useNavigate();

  // The cart is already populated by App.jsx on initial auth check / login,
  // but refresh here too in case this page is opened directly (e.g. a
  // bookmarked /cart URL) before that initial check has run.
  useEffect(() => {
    if (status === "idle") refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = () => navigate("/checkout");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Cart</h1>

      {status === "loading" && (
        <p className="text-center text-gray-400 text-sm py-16">Loading your cart...</p>
      )}

      {status === "error" && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-4">Unable to load your cart.</p>
          <button
            onClick={refreshCart}
            className="text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {status === "success" && items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-700 font-medium">Your cart is empty</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/products"
            className="inline-block text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {status === "success" && items.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 flex flex-col gap-3">
            {items.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:sticky md:top-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-4 rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
