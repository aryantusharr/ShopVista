import { Link } from "react-router-dom";
import { HiShoppingCart, HiArrowRight } from "react-icons/hi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";

const CartPage = () => {
  const { cart, cartTotal, loading } = useCart();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-brand-400 rounded-full animate-spin" />
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
        <p className="text-slate-400 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our
          amazing products and find something you love!
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:from-brand-500 hover:to-brand-400 transition-all duration-300 shadow-lg shadow-brand-500/25"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold text-white mb-8">
          Shopping Cart
          <span className="text-brand-400 text-lg font-normal ml-3">
            ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-brand-900/30 border border-brand-800/30 rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                <div className="border-t border-brand-800/50 pt-3 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="font-display text-xl font-bold text-white">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {user ? (
                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-500/25"
                >
                  Proceed to Checkout
                  <HiArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:from-brand-500 hover:to-brand-400 transition-all duration-300 shadow-lg shadow-brand-500/25"
                >
                  Sign in to Checkout
                  <HiArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
