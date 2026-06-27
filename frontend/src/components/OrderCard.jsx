import { Link } from 'react-router-dom';

export default function OrderCard({ order }) {
  const statusClass = {
    Confirmed: 'badge-confirmed',
    Processing: 'badge-processing',
    Shipped: 'badge-shipped',
    Delivered: 'badge-delivered',
    Cancelled: 'badge-cancelled',
  };

  return (
    <Link to={`/orders/${order.orderId}`} style={{ display: 'block' }}>
      <div className="order-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="order-id">Order #{order.orderId}</p>
            <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p className="order-total">₹{order.totalPrice.toLocaleString()}</p>
            <span className={`badge ${statusClass[order.status] || 'badge-confirmed'}`} style={{ marginTop: '6px', display: 'inline-block' }}>
              {order.status}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555' }}>
              <img src={item.image} alt={item.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
              <span>{item.name}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <span style={{ fontSize: '12px', color: '#888' }}>+{order.items.length - 3} more</span>
          )}
        </div>
      </div>
    </Link>
  );
}
