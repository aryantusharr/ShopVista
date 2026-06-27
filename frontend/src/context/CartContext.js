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
  const [cart, setCart] = useState({ items: [], savedForLater: [], warnings: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      const local = localStorage.getItem("shopvista_cart");
      setCart(local ? JSON.parse(local) : { items: [], savedForLater: [], warnings: [] });
      return;
    }

    try {
      setLoading(true);
      
      // Merge local cart to database on login
      const localCartStr = localStorage.getItem("shopvista_cart");
      if (localCartStr) {
        try {
          const localCart = JSON.parse(localCartStr);
          if (localCart.items && localCart.items.length > 0) {
            for (const item of localCart.items) {
              const pId = item.product?._id || item.product;
              if (pId) {
                await API.post("/cart", { productId: pId, quantity: item.quantity });
              }
            }
          }
        } catch (e) {
          console.error("Failed to sync local cart", e);
        }
        localStorage.removeItem("shopvista_cart");
      }

      const { data } = await API.get("/cart");
      setCart({
        items: data.items || [],
        savedForLater: data.savedForLater || [],
        warnings: data.warnings || [],
      });
    } catch {
      setCart({ items: [], savedForLater: [], warnings: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      // Prompt redirection in components, but save to local storage as fallback
      const local = JSON.parse(
        localStorage.getItem("shopvista_cart") || '{"items":[],"savedForLater":[]}'
      );
      const existing = local.items.find(
        (i) => (i.product?._id || i.product) === productId
      );
      if (existing) {
        existing.quantity += Number(quantity);
      } else {
        local.items.push({ product: productId, quantity: Number(quantity) });
      }
      localStorage.setItem("shopvista_cart", JSON.stringify(local));
      setCart(local);
      return;
    }
    
    try {
      const { data } = await API.post("/cart", { productId, quantity });
      setCart({
        items: data.items || [],
        savedForLater: data.savedForLater || [],
        warnings: data.warnings || [],
      });
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) return;
    try {
      const { data } = await API.put(`/cart/${itemId}`, { quantity });
      setCart({
        items: data.items || [],
        savedForLater: data.savedForLater || [],
        warnings: data.warnings || [],
      });
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) {
      const local = JSON.parse(
        localStorage.getItem("shopvista_cart") || '{"items":[],"savedForLater":[]}'
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
      setCart({
        items: data.items || [],
        savedForLater: data.savedForLater || [],
        warnings: data.warnings || [],
      });
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem("shopvista_cart");
      setCart({ items: [], savedForLater: [], warnings: [] });
      return;
    }
    try {
      await API.delete("/cart/clear");
      setCart({ items: [], savedForLater: [], warnings: [] });
    } catch (error) {
      throw error;
    }
  };

  const toggleSaveForLater = async (itemId) => {
    if (!user) return;
    try {
      const { data } = await API.post(`/cart/save-for-later/${itemId}`);
      setCart({
        items: data.items || [],
        savedForLater: data.savedForLater || [],
        warnings: data.warnings || [],
      });
    } catch (error) {
      throw error;
    }
  };

  const bulkCartAction = async (action, itemIds) => {
    if (!user) return;
    try {
      const { data } = await API.post("/cart/bulk-action", { action, itemIds });
      setCart({
        items: data.items || [],
        savedForLater: data.savedForLater || [],
        warnings: data.warnings || [],
      });
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
        toggleSaveForLater,
        bulkCartAction,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
