import { useState } from 'react';
import AddressForm from './AddressForm';
import { useShop } from '../context/shopContext';

export default function CheckoutForm({ step, onNext, onBack, orderData, setOrderData }) {
  const { cart, addresses } = useShop();
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Step 1: Address
  if (step === 1) {
    return (
      <div>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
          Delivery Address
        </h2>

        {addresses.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`address-card ${orderData.selectedAddressId === addr._id ? 'default' : ''}`}
                onClick={() => setOrderData({ ...orderData, selectedAddressId: addr._id, shippingAddress: addr })}
                style={{ cursor: 'pointer' }}
              >
                {addr.isDefault && <span className="address-default-tag">Default</span>}
                <p style={{ fontWeight: '600' }}>{addr.street}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>{addr.city}, {addr.state} - {addr.zipCode}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>📞 {addr.phone}</p>
              </div>
            ))}
          </div>
        )}

        {showAddressForm ? (
          <AddressForm onSaved={() => setShowAddressForm(false)} />
        ) : (
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(true)}>
            + Add New Address
          </button>
        )}

        <div style={{ marginTop: '24px' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={onNext}
            disabled={!orderData.shippingAddress}
          >
            Continue to Shipping →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Shipping method
  if (step === 2) {
    const methods = [
      { value: 'Standard', label: 'Standard Delivery', price: 'Free', days: '5-7 days' },
      { value: 'Express', label: 'Express Delivery', price: '₹99', days: '2-3 days' },
      { value: 'NextDay', label: 'Next Day Delivery', price: '₹199', days: '1 day' },
    ];

    return (
      <div>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
          Shipping Method
        </h2>

        {methods.map((method) => (
          <div
            key={method.value}
            className={`address-card ${orderData.shippingMethod === method.value ? 'default' : ''}`}
            onClick={() => setOrderData({ ...orderData, shippingMethod: method.value })}
            style={{ cursor: 'pointer', marginBottom: '12px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: '600' }}>{method.label}</p>
                <p style={{ fontSize: '13px', color: '#888' }}>{method.days}</p>
              </div>
              <p style={{ fontWeight: '700', color: '#6c63ff' }}>{method.price}</p>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn btn-outline" onClick={onBack}>← Back</button>
          <button className="btn btn-primary btn-lg" onClick={onNext}>Continue to Payment →</button>
        </div>
      </div>
    );
  }

  // Step 3: Payment method
  if (step === 3) {
    const methods = ['Card', 'UPI', 'NetBanking'];

    return (
      <div>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
          Payment Method
        </h2>

        {methods.map((method) => (
          <div
            key={method}
            className={`address-card ${orderData.paymentMethod === method ? 'default' : ''}`}
            onClick={() => setOrderData({ ...orderData, paymentMethod: method })}
            style={{ cursor: 'pointer', marginBottom: '12px' }}
          >
            <p style={{ fontWeight: '600' }}>{method}</p>
            <p style={{ fontSize: '12px', color: '#888' }}>Simulated — no real payment</p>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn btn-outline" onClick={onBack}>← Back</button>
          <button className="btn btn-primary btn-lg" onClick={onNext}>Review Order →</button>
        </div>
      </div>
    );
  }

  // Step 4: Review
  if (step === 4) {
    const shippingCharge = orderData.shippingMethod === 'Express' ? 99 : orderData.shippingMethod === 'NextDay' ? 199 : 0;
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + shippingCharge;
    const addr = orderData.shippingAddress;

    return (
      <div>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
          Review Your Order
        </h2>

        <div className="profile-card">
          <p style={{ fontWeight: '700', marginBottom: '8px' }}>Delivering to</p>
          <p>{addr?.street}, {addr?.city}, {addr?.state} - {addr?.zipCode}</p>
          <p style={{ fontSize: '13px', color: '#888' }}>📞 {addr?.phone}</p>
        </div>

        <div className="profile-card">
          <p style={{ fontWeight: '700', marginBottom: '12px' }}>Items ({cart.items.length})</p>
          {cart.items.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>{item.product.name} × {item.quantity}</span>
              <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div className="cart-summary-row"><span>Shipping ({orderData.shippingMethod})</span><span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span></div>
          <div className="cart-summary-row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn btn-outline" onClick={onBack}>← Back</button>
          <button className="btn btn-primary btn-lg btn-full" onClick={onNext}>
            Place Order
          </button>
        </div>
      </div>
    );
  }

  return null;
}
