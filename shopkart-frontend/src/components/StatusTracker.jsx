const STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

// Bonus: visual order-status progression. Steps up to and including the
// current status are highlighted.
export default function StatusTracker({ status }) {
  const current = STEPS.indexOf(status);

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const reached = i <= current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  reached ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                {reached ? "✓" : ""}
              </div>
              <span
                className={`mt-1 text-[10px] font-medium ${
                  reached ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 mb-4 ${
                  i < current ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
