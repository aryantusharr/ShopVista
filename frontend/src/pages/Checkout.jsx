import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import CheckoutForm from '../components/CheckoutForm';

export default function Checkout() {
  const { user, cart, createOrder } = useShop();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState({
    shippingAddress: null,
    selectedAddressId: null,
    shippingMethod: 'Standard',
    paymentMethod: 'Card',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  async function handlePlaceOrder() {
    setError('');
    setPlacing(true);
    try {
      const order = await createOrder({
        shippingAddress: {
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          zipCode: orderData.shippingAddress.zipCode,
          phone: orderData.shippingAddress.phone,
          country: 'India',
        },
        shippingMethod: orderData.shippingMethod,
        paymentMethod: orderData.paymentMethod,
      });
      navigate(`/orders/${order.orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setPlacing(false);
    }
  }

  const stepLabels = ['Address', 'Shipping', 'Payment', 'Review'];

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '680px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>
          Checkout
        </h1>

        {/* Step Indicator */}
        <div className="steps">
          {stepLabels.map((label, i) => {
            const num = i + 1;
            return (
              <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`step ${step === num ? 'active' : step > num ? 'done' : ''}`}>
                  <div className="step-num">{step > num ? '✓' : num}</div>
                  <span className="step-label">{label}</span>
                </div>
                {i < stepLabels.length - 1 && <div className="step-line" />}
              </div>
            );
          })}
        </div>

        {error && <p className="error-msg" style={{ marginBottom: '20px' }}>{error}</p>}

        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          {placing ? (
            <div className="text-center" style={{ padding: '40px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
              <p style={{ fontWeight: '600' }}>Placing your order...</p>
            </div>
          ) : (
            <CheckoutForm
              step={step}
              onNext={step === 4 ? handlePlaceOrder : () => setStep(step + 1)}
              onBack={() => setStep(step - 1)}
              orderData={orderData}
              setOrderData={setOrderData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
