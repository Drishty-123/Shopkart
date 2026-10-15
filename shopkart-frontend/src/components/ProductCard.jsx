import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, initiallyWishlisted = false, onWishlistChange }) {
  const outOfStock = product.stock <= 0;

  // -------------------- Wishlist (Lab-04) --------------------
  // "idle" (♡ Add to Wishlist) | "saving" (⏳ Saving...)
  // "saved" (♥ Added to Wishlist) | "error" (inline failure message)
  const [wishlistStatus, setWishlistStatus] = useState(
    initiallyWishlisted ? "saved" : "idle"
  );

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "saving" || wishlistStatus === "saved") return;

    setWishlistStatus("saving");
    try {
      await addToWishlist(product._id);
      setWishlistStatus("saved");
      onWishlistChange?.();
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistStatus("saved");
        onWishlistChange?.();
      } else {
        setWishlistStatus("error");
      }
    }
  };

  // -------------------- Cart (Lab-05) --------------------
  // Reads from and mutates through the SAME shared context the Navbar
  // and Cart page use — this card never keeps its own copy of cart data.
  const { addItem, itemLoading, isInCart } = useCart();
  const [cartError, setCartError] = useState("");
  const addingToCart = itemLoading[product._id] || false;
  const alreadyInCart = isInCart(product._id);

  const handleAddToCart = async () => {
    if (addingToCart || outOfStock) return;
    setCartError("");
    const result = await addItem(product._id);
    if (!result.ok) setCartError(result.message);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x400?text=No+Image";
          }}
        />
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-xs text-indigo-600 font-medium">{product.category}</span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <p className="text-lg font-bold text-gray-900 mt-1">₹{product.price.toLocaleString("en-IN")}</p>
        <p className={`text-xs mt-1 ${outOfStock ? "text-red-500" : "text-gray-500"}`}>
          {outOfStock ? "Out of stock" : `${product.stock} units left`}
        </p>

        {wishlistStatus === "error" && (
          <p className="text-xs text-red-500 mt-1">Unable to save product. Please try again.</p>
        )}
        {cartError && <p className="text-xs text-red-500 mt-1">{cartError}</p>}

        <div className="mt-3 flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="text-center text-sm font-medium rounded-lg bg-indigo-600 text-white py-2 hover:bg-indigo-700 transition-colors"
          >
            View Details
          </Link>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart || outOfStock}
            className="text-sm font-medium rounded-lg py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {outOfStock
              ? "Out of Stock"
              : addingToCart
              ? "Adding..."
              : alreadyInCart
              ? "Add Another"
              : "Add to Cart"}
          </button>

          <button
            onClick={handleAddToWishlist}
            disabled={wishlistStatus === "saving" || wishlistStatus === "saved"}
            className={`text-sm font-medium rounded-lg py-2 border transition-colors ${
              wishlistStatus === "saved"
                ? "border-pink-200 bg-pink-50 text-pink-600 cursor-default"
                : "border-gray-300 text-gray-700 hover:border-pink-300 hover:text-pink-600"
            } disabled:opacity-80`}
          >
            {wishlistStatus === "idle" && "♡ Add to Wishlist"}
            {wishlistStatus === "saving" && "⏳ Saving..."}
            {wishlistStatus === "saved" && "♥ Added to Wishlist"}
            {wishlistStatus === "error" && "♡ Add to Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
