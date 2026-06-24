import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { HiArrowLeft, HiStar, HiShoppingCart, HiPlus, HiMinus } from "react-icons/hi";
import API from "../api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      toast.success(`${product.name} added to cart!`, {
        style: { background: "#1e1b4b", color: "#e0e7ff", border: "1px solid #4338ca" },
        iconTheme: { primary: "#10b981", secondary: "#e0e7ff" },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-brand-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 text-lg">Product not found</p>
        <Link
          to="/"
          className="text-brand-400 hover:text-brand-300 flex items-center gap-2"
        >
          <HiArrowLeft /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative overflow-hidden rounded-3xl bg-brand-900/30 border border-brand-800/30">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover aspect-square"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-2">
              {product.category}
            </p>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <HiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.rating)
                        ? "text-amber-400"
                        : "text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-400 text-sm">
                {product.rating} ({product.numReviews} reviews)
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="font-display text-4xl font-extrabold text-white mb-8">
              ${product.price.toFixed(2)}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-slate-300 text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-3 bg-brand-900/50 border border-brand-700/50 rounded-xl px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-300 hover:text-white transition-colors"
                >
                  <HiMinus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-white font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-slate-300 hover:text-white transition-colors"
                >
                  <HiPlus className="w-4 h-4" />
                </button>
              </div>
              <span className={`text-sm font-medium ${product.stock <= 10 ? "text-amber-400" : "text-slate-500"}`}>
                {product.stock <= 10 && product.stock > 0
                  ? `Only ${product.stock} left in stock!`
                  : `${product.stock} available`}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 text-white font-bold text-lg hover:from-brand-500 hover:to-emerald-500 transition-all duration-300 shadow-xl shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <HiShoppingCart className="w-6 h-6" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Free Shipping", icon: "🚚" },
                { label: "Secure Checkout", icon: "🔒" },
                { label: "Easy Returns", icon: "↩️" },
              ].map((perk) => (
                <div
                  key={perk.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-brand-900/30 border border-brand-800/30"
                >
                  <span className="text-2xl">{perk.icon}</span>
                  <span className="text-slate-400 text-xs text-center font-medium">
                    {perk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
