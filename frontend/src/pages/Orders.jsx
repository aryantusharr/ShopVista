import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import OrderCard from '../components/OrderCard';

export default function Orders() {
  const { user, orders, fetchOrders, loading } = useShop();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>
          My Orders
          {orders.length > 0 && (
            <span className="text-muted" style={{ fontSize: '16px', fontWeight: '400', marginLeft: '12px' }}>
              ({orders.length})
            </span>
          )}
        </h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No orders yet</h3>
            <p>Your purchase history is empty.</p>
            <Link to="/collection" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
