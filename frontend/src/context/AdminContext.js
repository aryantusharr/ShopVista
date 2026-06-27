import { createContext, useContext, useState, useCallback } from "react";
import API from "../api";
import { useAuth } from "./AuthContext";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({ products: [], logs: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!user?.isAdmin) return;
    try {
      setLoading(true);
      const { data } = await API.get("/admin/dashboard");
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching admin dashboard", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = useCallback(async (filters = {}) => {
    if (!user?.isAdmin) return;
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const { data } = await API.get(`/admin/orders?${params}`);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching admin orders", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchInventory = useCallback(async () => {
    if (!user?.isAdmin) return;
    try {
      setLoading(true);
      const { data } = await API.get("/admin/inventory");
      setInventory(data);
    } catch (err) {
      console.error("Error fetching inventory", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!user?.isAdmin) return;
    try {
      setLoading(true);
      const { data } = await API.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateOrderStatus = async (orderId, status, trackingNumber = "") => {
    const { data } = await API.put(`/admin/orders/${orderId}/status`, { status, trackingNumber });
    await fetchOrders();
    await fetchDashboard();
    return data;
  };

  const adjustStock = async (productId, quantityAdjusted, reason) => {
    const { data } = await API.post("/admin/inventory/adjust", { productId, quantityAdjusted, reason });
    await fetchInventory();
    await fetchDashboard();
    return data;
  };

  const toggleUserActive = async (userId) => {
    const { data } = await API.put(`/admin/users/${userId}/active`);
    await fetchUsers();
    return data;
  };

  const getUserHistory = async (userId) => {
    const { data } = await API.get(`/admin/users/${userId}/history`);
    return data;
  };

  const bulkUpload = async (csvText) => {
    const { data } = await API.post("/products/bulk", { csvText });
    await fetchInventory();
    await fetchDashboard();
    return data;
  };

  const downloadReport = (type) => {
    window.open(`http://localhost:5001/api/admin/reports/${type}?token=${user?.token}`, "_blank");
  };

  return (
    <AdminContext.Provider
      value={{
        dashboardData,
        orders,
        inventory,
        users,
        loading,
        fetchDashboard,
        fetchOrders,
        fetchInventory,
        fetchUsers,
        updateOrderStatus,
        adjustStock,
        toggleUserActive,
        getUserHistory,
        bulkUpload,
        downloadReport,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
