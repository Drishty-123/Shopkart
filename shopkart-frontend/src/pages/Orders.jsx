import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "../services/api";
import OrderCard from "../components/OrderCard";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  const fetchOrders = useCallback(() => {
    setStatus("loading");
    getOrders()
      .then((res) => {
        setOrders(res.data.orders);
        setStatus("success");
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login");
        else setStatus("error");
      });
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Orders</h1>

      {status === "loading" && (
        <p className="text-center text-gray-400 text-sm py-16">Loading your orders...</p>
      )}

      {status === "error" && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-4">Unable to load your orders.</p>
          <button
            onClick={fetchOrders}
            className="text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {status === "success" && orders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-700 font-medium">You have not placed any orders yet.</p>
          <Link
            to="/products"
            className="inline-block mt-5 text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {status === "success" && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
