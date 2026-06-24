import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      const local = localStorage.getItem("shopvista_cart");
      setCart(local ? JSON.parse(local) : { items: [] });
      return;
    }
    try {
      setLoading(true);
      const { data } = await API.get("/cart");
      setCart(data);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      const local = JSON.parse(
        localStorage.getItem("shopvista_cart") || '{"items":[]}'
      );
      const existing = local.items.find(
        (i) => (i.product?._id || i.product) === productId
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        local.items.push({ product: productId, quantity });
      }
      localStorage.setItem("shopvista_cart", JSON.stringify(local));
      setCart(local);
      return;
    }
    try {
      const { data } = await API.post("/cart", { productId, quantity });
      setCart(data);
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) return;
    try {
      const { data } = await API.put(`/cart/${itemId}`, { quantity });
      setCart(data);
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) {
      const local = JSON.parse(
        localStorage.getItem("shopvista_cart") || '{"items":[]}'
      );
      local.items = local.items.filter(
        (i) => (i._id || i.product) !== itemId
      );
      localStorage.setItem("shopvista_cart", JSON.stringify(local));
      setCart(local);
      return;
    }
    try {
      const { data } = await API.delete(`/cart/${itemId}`);
      setCart(data);
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem("shopvista_cart");
      setCart({ items: [] });
      return;
    }
    try {
      await API.delete("/cart/clear");
      setCart({ items: [] });
    } catch (error) {
      throw error;
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
