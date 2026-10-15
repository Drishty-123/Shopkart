// Loads Razorpay's Standard Checkout script on demand. Resolves true if
// window.Razorpay is available afterwards, false if the script couldn't
// be loaded (offline, blocked by an extension...) — callers must handle
// false instead of assuming window.Razorpay always exists.
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
