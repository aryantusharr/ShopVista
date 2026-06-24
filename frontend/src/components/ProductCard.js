import { Link } from "react-router-dom";
import { HiStar, HiShoppingCart } from "react-icons/hi";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`, {
        style: { background: "#1e1b4b", color: "#e0e7ff", border: "1px solid #4338ca" },
        iconTheme: { primary: "#10b981", secondary: "#e0e7ff" },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <HiStar
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400" : "text-slate-600"}`}
      />
    ));

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-brand-900/50 border border-brand-800/50 rounded-2xl overflow-hidden hover:border-brand-600/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-lg">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-lg">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-1 mb-4">
          {renderStars(product.rating)}
          <span className="text-slate-500 text-xs ml-1">({product.numReviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 text-white text-sm font-semibold hover:from-brand-500 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <HiShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
