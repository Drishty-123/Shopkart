import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist } from "../services/api";
import WishlistCard from "../components/WishlistCard";

export default function Wishlist({ onWishlistChange }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  const fetchWishlist = useCallback(() => {
    setStatus("loading");
    getWishlist()
      .then((res) => {
        setProducts(res.data.wishlist);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoved = (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    onWishlistChange?.();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">My Wishlist</h1>
      {status === "success" && (
        <p className="text-sm text-gray-500 mt-1 mb-6">
          {products.length} {products.length === 1 ? "product" : "products"} saved
        </p>
      )}

      {status === "loading" && (
        <p className="text-center text-gray-400 text-sm py-16">Loading your wishlist...</p>
      )}

      {status === "error" && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-4">
            Something went wrong.
            <br />
            We couldn't load your wishlist.
          </p>
          <button
            onClick={fetchWishlist}
            className="text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {status === "success" && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">❤️</p>
          <p className="text-gray-700 font-medium">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Save products you love and find them here later.
          </p>
          <Link
            to="/products"
            className="inline-block text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {status === "success" && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <WishlistCard key={product._id} product={product} onRemoved={handleRemoved} />
          ))}
        </div>
      )}
    </div>
  );
}
