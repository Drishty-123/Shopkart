import { formatINR } from "../utils/format";

// Presentational: takes plain lines ([{ name, price, quantity }]) so it
// works for both live cart items (Checkout) and saved order items.
export default function OrderSummary({ lines, total, note }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h2>

      <div className="flex flex-col gap-2">
        {lines.map((line) => (
          <div key={line.key} className="flex justify-between text-sm text-gray-600 gap-3">
            <span className="min-w-0 truncate">
              {line.name} × {line.quantity}
            </span>
            <span className="shrink-0">{formatINR(line.price * line.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-100 pt-3 mt-3">
        <span>Total</span>
        <span>{formatINR(total)}</span>
      </div>

      {note && <p className="text-xs text-gray-400 mt-3">{note}</p>}
    </div>
  );
}
