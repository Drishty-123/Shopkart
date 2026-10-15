import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, reportPaymentFailed, verifyPayment } from "../services/api";
import { loadRazorpayScript } from "../services/razorpay";
import { EMPTY_SHIPPING, validateShipping } from "../utils/validateShipping";
import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";

export default function Checkout() {
  const { items, status, refreshCart, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  // Checkout form state lives HERE (not inside CheckoutForm) because this
  // component needs the values to validate and submit them.
  const [form, setForm] = useState(EMPTY_SHIPPING);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [completed, setCompleted] = useState(false);

  // True from the moment Razorpay hands us a payment until we've heard
  // back from the backend, so closing the modal in that window can't
  // re-enable the button and allow a second order.
  const verifyingRef = useRef(false);

  // Opened directly (e.g. bookmarked /checkout) before the cart loaded?
  useEffect(() => {
    if (status === "idle") refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const openRazorpayCheckout = (data, shipping) => {
    const options = {
      key: data.key,
      amount: data.amount, // paise, calculated by the BACKEND
      currency: data.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: data.razorpayOrderId,

      // Razorpay says the payment went through. That is NOT proof — we
      // only forward the three values to our backend, which verifies the
      // signature. Nothing is marked paid and the cart is not cleared
      // until the backend confirms.
      handler: async (response) => {
        verifyingRef.current = true;
        try {
          const res = await verifyPayment({
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Backend cart is already cleared. Mirror that in the shared
          // cart state so the Navbar flips to "Cart" with no count right
          // away. `completed` stops this page from reacting to the now
          // empty cart before we navigate away.
          setCompleted(true);
          clearCart();
          navigate(`/order-success/${res.data.order._id}`);
        } catch (err) {
          verifyingRef.current = false;
          setServerError(
            err.response?.data?.message ||
              "We couldn't verify your payment. Your cart has not been cleared."
          );
          setPlacing(false);
        }
      },

      prefill: { name: shipping.fullName, contact: shipping.phone },
      theme: { color: "#4f46e5" },

      modal: {
        // User closed the Razorpay window without paying.
        ondismiss: () => {
          if (verifyingRef.current) return;
          setServerError((prev) => prev || "Payment was cancelled. Your cart has not been cleared.");
          setPlacing(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", () => {
      // Best-effort bookkeeping; the cart is never touched on failure.
      reportPaymentFailed(data.shopKartOrderId).catch(() => {});
      setServerError("Payment failed. Your cart has not been cleared. Please try again.");
    });

    razorpay.open();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (placing) return; // no double submits

    setServerError("");

    // Basic client validation first — if it fails, the backend is never called.
    const found = validateShipping(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPlacing(true);

    const shipping = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    try {
      // Load Razorpay BEFORE creating the order, so a blocked script
      // never leaves a pending order behind.
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError("Unable to load the payment gateway. Check your connection and try again.");
        setPlacing(false);
        return;
      }

      // Only the shipping address is sent. The backend reads the cart,
      // re-checks stock, and works out the total itself.
      const { data } = await createPaymentOrder(shipping);
      openRazorpayCheckout(data, shipping);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setServerError(
        err.response?.data?.message || "Unable to start payment. Please try again."
      );
      setPlacing(false);
    }
  };

  // ---------- render ----------
  const cartLines = items
    .filter((item) => item.product)
    .map((item) => ({
      key: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

  let body;

  if (completed) {
    body = (
      <p className="text-center text-gray-500 text-sm py-16">Payment successful. Redirecting...</p>
    );
  } else if (status === "idle" || status === "loading") {
    body = <p className="text-center text-gray-400 text-sm py-16">Loading your cart...</p>;
  } else if (status === "error") {
    body = (
      <div className="text-center py-16">
        <p className="text-red-500 text-sm mb-4">Unable to load your cart.</p>
        <button
          onClick={refreshCart}
          className="text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  } else if (cartLines.length === 0) {
    // Direct visit to /checkout with nothing in the cart: no form, no way to pay.
    body = (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🛒</p>
        <p className="text-gray-700 font-medium">Your cart is empty</p>
        <p className="text-sm text-gray-500 mt-1 mb-5">Add something to your cart before checking out.</p>
        <Link
          to="/products"
          className="inline-block text-sm font-medium rounded-lg bg-indigo-600 text-white px-5 py-2 hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  } else {
    body = (
      <form onSubmit={handlePlaceOrder} noValidate className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <CheckoutForm form={form} errors={errors} onChange={handleChange} disabled={placing} />
        </div>

        <div className="flex flex-col gap-3 md:sticky md:top-6">
          <OrderSummary
            lines={cartLines}
            total={subtotal}
            note="The final amount is calculated securely on the server."
          />

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={placing}
            className="w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {placing ? "Processing..." : "Place Order"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            You'll pay on Razorpay's secure checkout (Test Mode).
          </p>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h1>
      {body}
    </div>
  );
}
