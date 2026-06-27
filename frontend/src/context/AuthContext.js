import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState({ products: [] });

  const logout = useCallback(() => {
    localStorage.removeItem("shopvista_user");
    localStorage.removeItem("shopvista_cart");
    setUser(null);
    setAddresses([]);
    setWishlist({ products: [] });
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const stored = localStorage.getItem("shopvista_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const loginTime = parsed.loginTime || Date.now();
          // Expiration: 7 days if rememberMe is checked, otherwise 24 hours
          const maxAge = parsed.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
          
          if (Date.now() - loginTime > maxAge) {
            console.log("Session expired. Logging out automatically.");
            logout();
          } else {
            setUser(parsed);
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    checkSession();
  }, [logout]);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await API.post("/auth/login", { email, password, rememberMe });
    
    if (data.require2FA) {
      return data;
    }

    const userData = { ...data, loginTime: Date.now(), rememberMe };
    localStorage.setItem("shopvista_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await API.post("/auth/register", {
      name,
      email,
      password,
      phone,
    });
    const userData = { ...data, loginTime: Date.now(), rememberMe: false };
    localStorage.setItem("shopvista_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const guestLogin = async (email, name) => {
    const { data } = await API.post("/auth/guest", { email, name });
    const userData = { ...data, loginTime: Date.now(), rememberMe: false };
    localStorage.setItem("shopvista_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const verify2FA = async (userId, code, rememberMe = false) => {
    const { data } = await API.post("/auth/2fa/verify", { userId, code, rememberMe });
    const userData = { ...data, loginTime: Date.now(), rememberMe };
    localStorage.setItem("shopvista_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put("/auth/profile", profileData);
    const updatedUser = { ...user, ...data };
    localStorage.setItem("shopvista_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  const toggle2FA = async () => {
    const { data } = await API.post("/auth/2fa/toggle");
    const updatedUser = { ...user, twoFactorEnabled: data.twoFactorEnabled };
    localStorage.setItem("shopvista_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  // Addresses API bindings
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await API.get("/addresses");
      setAddresses(data);
    } catch (err) {
      console.error("Error fetching addresses", err);
    }
  }, [user]);

  const addAddress = async (addr) => {
    const { data } = await API.post("/addresses", addr);
    await fetchAddresses();
    return data;
  };

  const updateAddress = async (id, addr) => {
    const { data } = await API.put(`/addresses/${id}`, addr);
    await fetchAddresses();
    return data;
  };

  const deleteAddress = async (id) => {
    const { data } = await API.delete(`/addresses/${id}`);
    await fetchAddresses();
    return data;
  };

  // Wishlist API bindings
  const fetchWishlist = useCallback(async () => {
    if (!user || user.isGuest) return;
    try {
      const { data } = await API.get("/wishlist");
      setWishlist(data);
    } catch (err) {
      console.error("Error fetching wishlist", err);
    }
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user || user.isGuest) return;
    const { data } = await API.post("/wishlist/toggle", { productId });
    await fetchWishlist();
    return data;
  };

  const moveWishlistToCart = async (productId) => {
    if (!user) return;
    const { data } = await API.post("/wishlist/move-to-cart", { productId });
    await fetchWishlist();
    return data;
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchWishlist();
    }
  }, [user, fetchAddresses, fetchWishlist]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        addresses,
        wishlist,
        login,
        register,
        guestLogin,
        verify2FA,
        logout,
        updateProfile,
        toggle2FA,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        fetchWishlist,
        toggleWishlist,
        moveWishlistToCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
