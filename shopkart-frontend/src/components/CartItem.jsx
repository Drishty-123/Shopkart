import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, itemLoading } = useCart();
  const { product, quantity } = item;
  const busy = itemLoading[product._id] || false;
  const lineTotal = product.price * quantity;

  const handleDecrease = () => {
    if (busy) return;
    // Quantity 1 is the floor — use the explicit Remove action to go
    // to zero, per the lab spec ("for quantity = 1, use Remove").
    if (quantity <= 1) return;
    updateQuantity(product._id, quantity - 1);
  };

  const handleIncrease = () => {
    if (busy) return;
    if (quantity >= product.stock) return; // never exceed stock client-side either
    updateQuantity(product._id, quantity + 1);
  };

  const handleRemove = () => {
    if (busy) return;
    removeItem(product._id);
  };

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="w-20 h-20 shrink-0 rounded-lg bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/200x200?text=No+Image";
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${product._id}`}
          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-sm text-gray-500 mt-0.5">₹{product.price.toLocaleString("en-IN")}</p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={handleDecrease}
              disabled={busy || quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={handleIncrease}
              disabled={busy || quantity >= product.stock}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={busy}
            className="text-xs font-medium text-gray-500 hover:text-red-600 disabled:opacity-50"
          >
            {busy ? "Updating..." : "Remove"}
          </button>
        </div>

        {quantity >= product.stock && (
          <p className="text-xs text-amber-600 mt-1">Max stock reached ({product.stock} available)</p>
        )}
      </div>

      <div className="text-sm font-semibold text-gray-900 shrink-0">
        ₹{lineTotal.toLocaleString("en-IN")}
      </div>
    </div>
  );
}
