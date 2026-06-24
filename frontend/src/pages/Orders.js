import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiClipboardList, HiChevronDown, HiChevronUp } from "react-icons/hi";
import API from "../api";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  Processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders");
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-400 text-lg">Please sign in to view orders</p>
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-brand-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-6 px-4">
        <div className="p-6 rounded-full bg-brand-900/50 border border-brand-800/30">
          <HiClipboardList className="w-16 h-16 text-brand-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          No orders yet
        </h2>
        <p className="text-slate-400 text-center max-w-md">
          Once you place an order, it will appear here.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:from-brand-500 hover:to-brand-400 transition-all duration-300"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold text-white mb-8">
          My Orders
          <span className="text-brand-400 text-lg font-normal ml-3">
            ({orders.length})
          </span>
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-brand-900/30 border border-brand-800/30 rounded-2xl overflow-hidden hover:border-brand-700/50 transition-all duration-300"
            >
              <button
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order._id ? null : order._id
                  )
                }
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Order ID
                    </p>
                    <p className="text-white font-mono text-sm">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Date
                    </p>
                    <p className="text-white text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Total
                    </p>
                    <p className="text-white font-bold">
                      ${order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                {expandedOrder === order._id ? (
                  <HiChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedOrder === order._id && (
                <div className="px-5 pb-5 border-t border-brand-800/30 pt-4">
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 py-2"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {item.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-white font-semibold text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-brand-950/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                      Shipping Address
                    </p>
                    <p className="text-slate-300 text-sm">
                      {order.shippingAddress.street},{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode},{" "}
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
