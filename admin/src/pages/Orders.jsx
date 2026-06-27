import { useEffect, useState } from 'react';
import API from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [trackingNo, setTrackingNo] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
      const { data } = await API.get(url);
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(orderId, nextStatus) {
    try {
      setError('');
      const payload = { status: nextStatus };
      if (nextStatus === 'Shipped' && trackingNo) {
        payload.trackingNumber = trackingNo;
      }
      
      await API.put(`/admin/orders/${orderId}/status`, payload);
      setUpdatingId(null);
      setTrackingNo('');
      fetchOrders();
      alert('Order status updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  }

  const statusClass = {
    Confirmed: 'badge-confirmed',
    Processing: 'badge-processing',
    Shipped: 'badge-shipped',
    Delivered: 'badge-delivered',
    Cancelled: 'badge-cancelled',
  };

  if (loading && orders.length === 0) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: 0 }}>Manage Orders</h1>
        <div>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: '20px' }}>{error}</p>}

      {orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 20px' }}>
          <p className="text-muted">No orders found.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer</th>
                  <th>Items Summary</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>#{o.orderId}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{o.user?.name || 'Guest'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{o.user?.email || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {o.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '13px' }}>
                            • {item.name} <span className="text-muted">× {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: '700' }}>₹{o.totalPrice.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${statusClass[o.status] || 'badge-confirmed'}`}>
                        {o.status}
                      </span>
                      {o.trackingNumber && (
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', marginTop: '4px' }}>
                          Trk: {o.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {o.status === 'Cancelled' || o.status === 'Delivered' ? (
                        <span className="text-muted" style={{ fontSize: '12px' }}>No actions</span>
                      ) : updatingId === o._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                          {o.status === 'Processing' && (
                            <input
                              className="input"
                              placeholder="Enter tracking number"
                              value={trackingNo}
                              onChange={(e) => setTrackingNo(e.target.value)}
                              style={{ width: '180px', padding: '6px 10px', fontSize: '12px' }}
                            />
                          )}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setUpdatingId(null)}>
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const transitions = { Confirmed: 'Processing', Processing: 'Shipped', Shipped: 'Delivered' };
                                handleStatusUpdate(o.orderId, transitions[o.status]);
                              }}
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setUpdatingId(o._id)}
                        >
                          {o.status === 'Confirmed' && 'Mark Processing'}
                          {o.status === 'Processing' && 'Ship Order'}
                          {o.status === 'Shipped' && 'Mark Delivered'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
