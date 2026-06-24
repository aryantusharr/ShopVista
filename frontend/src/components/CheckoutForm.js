import { useState } from "react";
import { HiLocationMarker } from "react-icons/hi";

const CheckoutForm = ({ onSubmit, loading, cartTotal }) => {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!address.street.trim()) newErrors.street = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";
    if (!address.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(address);
    }
  };

  const handleChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const inputClasses = (field) =>
    `w-full px-4 py-3 rounded-xl bg-brand-900/50 border ${
      errors[field] ? "border-red-500" : "border-brand-700/50"
    } text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all duration-200`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-brand-600/20">
          <HiLocationMarker className="w-6 h-6 text-brand-400" />
        </div>
        <h2 className="font-display text-xl font-bold text-white">
          Shipping Address
        </h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Street Address
        </label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => handleChange("street", e.target.value)}
          placeholder="123 Main Street, Apt 4"
          className={inputClasses("street")}
        />
        {errors.street && (
          <p className="mt-1 text-sm text-red-400">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            City
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Mumbai"
            className={inputClasses("city")}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-400">{errors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            State
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => handleChange("state", e.target.value)}
            placeholder="Maharashtra"
            className={inputClasses("state")}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-400">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            value={address.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            placeholder="400001"
            className={inputClasses("zipCode")}
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-400">{errors.zipCode}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Country
          </label>
          <input
            type="text"
            value={address.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className={inputClasses("country")}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-brand-800/50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-300 font-medium">Order Total</span>
          <span className="font-display text-2xl font-bold text-white">
            ${cartTotal.toFixed(2)}
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
