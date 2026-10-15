import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams(); // URL parameter from the route /products/:id
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "not-found"

  const { addItem, itemLoading, isInCart } = useCart();
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    getProductById(id)
      .then((res) => {
        if (!cancelled) {
          setProduct(res.data.product);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setStatus("not-found");
        } else {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return <p className="text-center text-gray-400 text-sm py-16">Loading product...</p>;
  }

  if (status === "not-found") {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm mb-4">Product not found.</p>
        <Link to="/products" className="text-indigo-600 text-sm font-medium hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-red-500 text-sm py-16">
        Something went wrong while loading this product.
      </p>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/products" className="text-sm text-indigo-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid sm:grid-cols-2 gap-0">
        <div className="bg-gray-50 aspect-square flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600?text=No+Image";
            }}
          />
        </div>

        <div className="p-6 flex flex-col">
          <span className="text-xs text-indigo-600 font-medium">{product.category}</span>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{product.name}</h1>
          <p className="text-2xl font-bold text-gray-900 mt-3">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className={`text-sm mt-1 ${outOfStock ? "text-red-500" : "text-gray-500"}`}>
            {outOfStock ? "Out of stock" : `${product.stock} units left`}
          </p>

          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          <button
            disabled={outOfStock}
            className="mt-6 rounded-lg bg-indigo-600 text-white text-sm font-medium py-3 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
