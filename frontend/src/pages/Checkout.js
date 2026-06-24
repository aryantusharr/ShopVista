import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CheckoutForm from "../components/CheckoutForm";
import API from "../api";
import toast from "react-hot-toast";
import { HiArrowLeft, HiShoppingCart } from "react-icons/hi";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-400 text-lg">Please sign in to checkout</p>
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-6 px-4">
        <div className="p-6 rounded-full bg-brand-900/50 border border-brand-800/30">
          <HiShoppingCart className="w-16 h-16 text-brand-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          Your cart is empty
        </h2>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (shippingAddress) => {
    try {
      setLoading(true);
      await API.post("/orders", { shippingAddress });
      await clearCart();
      toast.success("Order placed successfully!", {
        style: {
          background: "#1e1b4b",
          color: "#e0e7ff",
          border: "1px solid #10b981",
        },
        iconTheme: { primary: "#10b981", secondary: "#e0e7ff" },
        duration: 4000,
      });
      navigate("/orders");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="font-display text-3xl font-bold text-white mb-8">
          Checkout
        </h1>

        <div className="bg-brand-900/30 border border-brand-800/30 rounded-2xl p-6 sm:p-8 mb-6">
          <h3 className="font-display text-lg font-bold text-white mb-4">
            Order Items
          </h3>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 py-3 border-b border-brand-800/30 last:border-0"
              >
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {item.product?.name}
                  </p>
                  <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="text-white font-semibold">
                  ${(item.product?.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-900/30 border border-brand-800/30 rounded-2xl p-6 sm:p-8">
          <CheckoutForm
            onSubmit={handleSubmit}
            loading={loading}
            cartTotal={cartTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
