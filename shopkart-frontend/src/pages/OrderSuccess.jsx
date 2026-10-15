import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../services/api";
import { formatINR } from "../utils/format";

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "not-found" | "error"

  const fetchOrder = useCallback(() => {
    setStatus("loading");
    getOrderById(id)
      .then((res) => {
        setOrder(res.data.order);
        setStatus("success");
      })
      .catch((err) => {
        const code = err.response?.status;
        if (code === 401) navigate("/login");
        else if (code === 404 || code === 400) setStatus("not-found");
        else setStatus("error");
      });
  }, [id, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (status === "loading") {
    return <p className="text-center text-gray-400 text-sm py-16">Loading your order...</p>;
  }

  if (status === "not-found") {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm mb-4">Order not found.</p>
        <Link to="/orders" className="text-indigo-600 text-sm font-medium hover:underline">
          Go to My Orders
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-sm mb-4">Unable to load your order.</p>
        <button
          onClick={fetchOrder}
          className="text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Someone opened the success URL of an order that was never paid.
  if (order.paymentStatus !== "PAID") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-700 font-medium">This order hasn't been paid yet.</p>
        <p className="text-sm text-gray-500 mt-1 mb-5">Your cart is still waiting for you.</p>
        <Link
          to="/cart"
          className="inline-block text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
        >
          Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-4xl mb-2">✅</p>
        <h1 className="text-xl font-semibold text-gray-900">Order Placed Successfully</h1>

        <dl className="mt-6 text-sm text-left space-y-3">
          <div>
            <dt className="text-gray-500">Order ID</dt>
            <dd className="text-gray-900 font-medium break-all">{order._id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Total</dt>
            <dd className="text-gray-900 font-medium">{formatINR(order.totalAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900 font-medium">{order.status}</dd>
          </div>
        </dl>

        <p className="text-sm text-gray-500 mt-6">Your order has been saved successfully.</p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/orders"
            className="text-sm font-medium rounded-lg bg-indigo-600 text-white py-2.5 hover:bg-indigo-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium rounded-lg border border-gray-300 text-gray-700 py-2.5 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
