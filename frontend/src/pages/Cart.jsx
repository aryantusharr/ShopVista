import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { user, cart, cartLoading, fetchCart } = useShop();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  if (cartLoading) return <div className="loading">Loading cart...</div>;

  const subtotal = cart.items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>
          Shopping Cart ({cart.items.length} items)
        </h1>

        {cart.warnings && cart.warnings.length > 0 && (
          <div className="error-msg" style={{ marginBottom: '20px' }}>
            {cart.warnings.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse our collection and add some products!</p>
            <Link to="/collection" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px' }}>
            <div>
              {cart.items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            <div>
              <div className="cart-summary">
                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Order Summary</h3>
                <div className="cart-summary-row">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span style={{ color: '#48bb78' }}>Calculated at checkout</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: '16px' }}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>

                <Link to="/collection" className="btn btn-outline btn-full" style={{ marginTop: '10px' }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
