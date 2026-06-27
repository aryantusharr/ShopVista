import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import API from '../api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, cancelOrder, returnOrder } = useShop();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrder();
  }, [id, user]);

  async function loadOrder() {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    try {
      await cancelOrder(order.orderId);
      setShowCancelModal(false);
      loadOrder();
      alert('Order cancelled successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  }

  async function handleReturn(e) {
    e.preventDefault();
    if (!returnReason.trim()) {
      alert('Please specify a reason for return');
      return;
    }
    try {
      await returnOrder(order.orderId, returnReason);
      setShowReturnModal(false);
      loadOrder();
      alert('Return process initiated');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return order');
    }
  }

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="container section"><p className="error-msg">{error}</p></div>;
  if (!order) return null;

  const isCancellable = order.status === 'Confirmed' || order.status === 'Processing';
  const isReturnable = order.status === 'Delivered'; // Return window is checked on backend
  
  const statusClass = {
    Confirmed: 'badge-confirmed',
    Processing: 'badge-processing',
    Shipped: 'badge-shipped',
    Delivered: 'badge-delivered',
    Cancelled: 'badge-cancelled',
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link to="/orders" className="btn btn-outline btn-sm">← Back to Orders</Link>
        </div>

        <div className="profile-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>Order #{order.orderId}</h1>
              <p className="text-muted" style={{ fontSize: '13px' }}>
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className={`badge ${statusClass[order.status] || 'badge-confirmed'}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'Cancelled' && (
          <div className="profile-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#666', marginBottom: '16px' }}>
              Tracking Progress
            </h3>
            <div className="steps">
              {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                const stepIdx = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].indexOf(order.status);
                const isActive = i <= stepIdx;
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={`step ${isActive ? 'active' : ''}`}>
                      <div className="step-num" style={{ background: isActive ? '#48bb78' : '#e2e8f0', color: '#fff' }}>
                        {i < stepIdx ? '✓' : i + 1}
                      </div>
                      <span className="step-label" style={{ color: isActive ? '#2f855a' : '#999' }}>{step}</span>
                    </div>
                    {i < 3 && <div className="step-line" style={{ background: i < stepIdx ? '#48bb78' : '#e2e8f0' }} />}
                  </div>
                );
              })}
            </div>
            {order.trackingNumber && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '16px' }}>
                Tracking Number: <strong style={{ fontFamily: 'monospace' }}>{order.trackingNumber}</strong>
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="profile-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#666', marginBottom: '16px' }}>
            Order Items
          </h3>
          {order.items.map((item) => (
            <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  ₹{item.price.toLocaleString()} × {item.quantity}
                </p>
              </div>
              <p style={{ fontWeight: '700' }}>₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}

          {/* Pricing summary */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-muted">Subtotal</span>
              <span>₹{(order.totalPrice - order.shippingCharge).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-muted">Shipping ({order.shippingMethod})</span>
              <span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
              <span>Total Price</span>
              <span style={{ color: '#6c63ff' }}>₹{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Address and Shipping */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div className="profile-card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#666', marginBottom: '12px' }}>
              Shipping Address
            </h3>
            <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{user.name}</p>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
            </p>
            <p style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="profile-card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#666', marginBottom: '12px' }}>
              Payment Details
            </h3>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>
              Method: <strong>{order.paymentMethod}</strong>
            </p>
            <p style={{ fontSize: '13px', color: '#555' }}>
              Status: <span style={{ fontWeight: '700', color: order.paymentStatus === 'Paid' ? '#48bb78' : '#e53e3e' }}>{order.paymentStatus}</span>
            </p>
          </div>
        </div>

        {order.refundReason && (
          <div className="error-msg" style={{ marginBottom: '24px' }}>
            <p><strong>Refund / Cancellation Reason:</strong> {order.refundReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {isCancellable && (
            <button className="btn btn-danger" onClick={() => setShowCancelModal(true)}>
              Cancel Order
            </button>
          )}

          {isReturnable && (
            <button className="btn btn-outline" onClick={() => setShowReturnModal(true)}>
              Return Items
            </button>
          )}
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>Cancel Order</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                Are you sure you want to cancel this order? The stock will be restored and payment will be refunded.
              </p>
              <div className="form-group">
                <label className="label">Reason for cancellation</label>
                <select className="select" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found better price elsewhere">Found better price elsewhere</option>
                  <option value="Delay in delivery">Delay in delivery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setShowCancelModal(false)}>Go Back</button>
                <button className="btn btn-danger btn-sm" onClick={handleCancel}>Confirm Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>Return Items</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                Returns are accepted within 7 days of delivery. Please provide a reason.
              </p>
              <form onSubmit={handleReturn}>
                <div className="form-group">
                  <label className="label">Reason for Return</label>
                  <input
                    className="input"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g. Defective item, wrong size"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button className="btn btn-outline btn-sm" type="button" onClick={() => setShowReturnModal(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" type="submit">Submit Return</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
