import { HiPlus, HiMinus, HiTrash } from "react-icons/hi";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const product = item.product;

  if (!product || !product.name) return null;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(item._id, newQuantity);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromCart(item._id);
      toast.success("Removed from cart", {
        style: {
          background: "#1e1b4b",
          color: "#e0e7ff",
          border: "1px solid #4338ca",
        },
      });
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-brand-900/30 border border-brand-800/30 rounded-2xl hover:border-brand-700/50 transition-all duration-300">
      <img
        src={product.image}
        alt={product.name}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-display text-white font-semibold truncate">
          {product.name}
        </h3>
        <p className="text-brand-400 font-semibold mt-1">
          ${product.price?.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="p-2 rounded-lg bg-brand-800/50 text-slate-300 hover:bg-brand-700 hover:text-white transition-colors disabled:opacity-30"
        >
          <HiMinus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center text-white font-semibold">
          {item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="p-2 rounded-lg bg-brand-800/50 text-slate-300 hover:bg-brand-700 hover:text-white transition-colors"
        >
          <HiPlus className="w-4 h-4" />
        </button>
      </div>

      <div className="text-right">
        <p className="text-white font-bold">
          ${(product.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={handleRemove}
          className="mt-1 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <HiTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
