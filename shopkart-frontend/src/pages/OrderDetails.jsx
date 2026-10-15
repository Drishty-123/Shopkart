import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../services/api";
import OrderSummary from "../components/OrderSummary";
import StatusTracker from "../components/StatusTracker";
import { formatDate, shortOrderId } from "../utils/format";

export default function OrderDetails() {
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
    return <p className="text-center text-gray-400 text-sm py-16">Loading order...</p>;
  }

  if (status === "not-found") {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm mb-4">Order not found.</p>
        <Link to="/orders" className="text-indigo-600 text-sm font-medium hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-sm mb-4">Unable to load this order.</p>
        <button
          onClick={fetchOrder}
          className="text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const a = order.shippingAddress;
  // Prices come from the order's own snapshot, not the live Product.
  const lines = order.items.map((item) => ({
    key: item._id || item.product,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
        ← Back to My Orders
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Order {shortOrderId(order._id)}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className="text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1">
          {order.status}
        </span>
      </div>

      {order.paymentStatus === "PAID" && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <StatusTracker status={order.status} />
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-6 items-start">
        <OrderSummary lines={lines} total={order.totalAmount} />

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</h2>
            <p className="text-sm text-gray-700">{a.fullName}</p>
            <p className="text-sm text-gray-600">{a.addressLine1}</p>
            <p className="text-sm text-gray-600">
              {a.city}, {a.state} {a.pincode}
            </p>
            <p className="text-sm text-gray-600 mt-1">Phone: {a.phone}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Payment</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Status</span>
              <span className="font-medium text-gray-900">{order.paymentStatus}</span>
            </div>
            {order.razorpayPaymentId && (
              <div className="flex justify-between text-sm text-gray-600 mt-1 gap-3">
                <span>Payment ID</span>
                <span className="font-medium text-gray-900 break-all text-right">
                  {order.razorpayPaymentId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
