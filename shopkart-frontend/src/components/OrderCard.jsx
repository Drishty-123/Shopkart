import { Link } from "react-router-dom";
import StatusTracker from "./StatusTracker";
import { formatDate, formatINR, shortOrderId } from "../utils/format";

export default function OrderCard({ order }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Order {shortOrderId(order._id)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className="text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1">
          {order.status}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {order.items.map((item) => (
          <p key={item._id || item.product} className="text-sm text-gray-600">
            {item.name} × {item.quantity}
          </p>
        ))}
      </div>

      <div className="mt-4">
        <StatusTracker status={order.status} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Total: {formatINR(order.totalAmount)}</p>
        <Link
          to={`/orders/${order._id}`}
          className="text-sm font-medium rounded-lg border border-gray-300 text-gray-700 px-4 py-1.5 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
