import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const ShopContext = createContext();

export function useShop() {
  return useContext(ShopContext);
}

export function ShopProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], warnings: [] });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('shopvista_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check 24h session expiry
        if (Date.now() - parsed.loginTime > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('shopvista_user');
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem('shopvista_user');
      }
    }
    setLoading(false);
  }, []);

  // Fetch cart, wishlist, addresses whenever user changes
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
      fetchAddresses();
    } else {
      setCart({ items: [], warnings: [] });
      setWishlist([]);
      setAddresses([]);
    }
  }, [user]);

  // ===== AUTH =====

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    const userData = { ...data, loginTime: Date.now() };
    localStorage.setItem('shopvista_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await API.post('/auth/register', { name, email, password, phone });
    const userData = { ...data, loginTime: Date.now() };
    localStorage.setItem('shopvista_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('shopvista_user');
    setUser(null);
    setOrders([]);
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/profile', profileData);
    const updatedUser = { ...user, ...data };
    localStorage.setItem('shopvista_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  // ===== PRODUCTS =====

  const fetchProducts = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await API.get(`/products?${params}`);
      setProducts(data);
      return data;
    } catch (err) {
      setError('Failed to load products');
      return [];
    }
  };

  // ===== CART =====

  const fetchCart = async () => {
    if (!user) return;
    try {
      setCartLoading(true);
      const { data } = await API.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Cart fetch error', err);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await API.post('/cart/add', { productId, quantity });
    setCart(data);
    return data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await API.put(`/cart/update/${itemId}`, { quantity });
    setCart(data);
    return data;
  };

  const removeFromCart = async (itemId) => {
    const { data } = await API.delete(`/cart/${itemId}`);
    setCart(data);
    return data;
  };

  const clearCart = async () => {
    await API.delete('/cart/clear');
    setCart({ items: [], warnings: [] });
  };

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // ===== ORDERS =====

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      setOrders(data);
      return data;
    } catch (err) {
      return [];
    }
  };

  const createOrder = async (orderData) => {
    const { data } = await API.post('/orders', orderData);
    await fetchOrders();
    await clearCart();
    return data;
  };

  const cancelOrder = async (orderId) => {
    const { data } = await API.put(`/orders/${orderId}/cancel`);
    await fetchOrders();
    return data;
  };

  const returnOrder = async (orderId, reason) => {
    const { data } = await API.put(`/orders/${orderId}/return`, { reason });
    await fetchOrders();
    return data;
  };

  // ===== WISHLIST =====

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/wishlist');
      setWishlist(data.products || []);
    } catch (err) {
      console.error('Wishlist fetch error', err);
    }
  };

  const toggleWishlist = async (productId) => {
    const { data } = await API.post('/wishlist/toggle', { productId });
    await fetchWishlist();
    return data;
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => {
      const id = p._id || p;
      return id.toString() === productId.toString();
    });
  };

  const moveToCart = async (productId) => {
    const { data } = await API.post('/wishlist/move-to-cart', { productId });
    await fetchWishlist();
    await fetchCart();
    return data;
  };

  // ===== ADDRESSES =====

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/addresses');
      setAddresses(data);
    } catch (err) {
      console.error('Addresses fetch error', err);
    }
  };

  const addAddress = async (addressData) => {
    const { data } = await API.post('/addresses', addressData);
    await fetchAddresses();
    return data;
  };

  const updateAddress = async (id, addressData) => {
    const { data } = await API.put(`/addresses/${id}`, addressData);
    await fetchAddresses();
    return data;
  };

  const deleteAddress = async (id) => {
    await API.delete(`/addresses/${id}`);
    await fetchAddresses();
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        cart,
        products,
        orders,
        wishlist,
        addresses,
        loading,
        cartLoading,
        error,
        cartItemCount,
        login,
        register,
        logout,
        updateProfile,
        fetchProducts,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchOrders,
        createOrder,
        cancelOrder,
        returnOrder,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}
