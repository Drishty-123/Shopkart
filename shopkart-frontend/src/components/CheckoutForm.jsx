const FIELDS = [
  { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma", autoComplete: "name" },
  { name: "phone", label: "Phone", placeholder: "9876543210", autoComplete: "tel", inputMode: "numeric" },
  { name: "addressLine1", label: "Address", placeholder: "22 MG Road", autoComplete: "street-address" },
  { name: "city", label: "City", placeholder: "Bengaluru", autoComplete: "address-level2" },
  { name: "state", label: "State", placeholder: "Karnataka", autoComplete: "address-level1" },
  { name: "pincode", label: "Pincode", placeholder: "560001", autoComplete: "postal-code", inputMode: "numeric" },
];

// Controlled form: all values live in the parent (Checkout.jsx), which
// needs them to validate and submit — this component only displays.
export default function CheckoutForm({ form, errors, onChange, disabled }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Shipping Details</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.name === "addressLine1" ? "sm:col-span-2" : ""}>
            <label htmlFor={f.name} className="block text-sm font-medium text-gray-700 mb-1">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type="text"
              value={form[f.name]}
              onChange={onChange}
              disabled={disabled}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              inputMode={f.inputMode}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 ${
                errors[f.name] ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors[f.name] && <p className="mt-1 text-xs text-red-600">{errors[f.name]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
