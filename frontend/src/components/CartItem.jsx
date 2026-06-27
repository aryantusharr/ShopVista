import { useShop } from '../context/shopContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useShop();

  const product = item.product;
  if (!product) return null;

  async function handleDecrease() {
    if (item.quantity <= 1) {
      await removeFromCart(item._id);
    } else {
      await updateQuantity(item._id, item.quantity - 1);
    }
  }

  async function handleIncrease() {
    if (item.quantity >= product.stock) {
      alert(`Only ${product.stock} units available`);
      return;
    }
    await updateQuantity(item._id, item.quantity + 1);
  }

  async function handleRemove() {
    await removeFromCart(item._id);
  }

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} className="cart-item-image" />

      <div className="cart-item-info">
        <p className="cart-item-name">{product.name}</p>
        <p className="cart-item-price">₹{product.price.toLocaleString()}</p>

        {product.stock <= 5 && product.stock > 0 && (
          <p style={{ fontSize: '11px', color: '#e53e3e', marginTop: '4px' }}>
            Only {product.stock} left!
          </p>
        )}

        <div className="cart-qty">
          <button className="cart-qty-btn" onClick={handleDecrease}>−</button>
          <span className="cart-qty-num">{item.quantity}</span>
          <button className="cart-qty-btn" onClick={handleIncrease}>+</button>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <p style={{ fontWeight: '700', marginBottom: '8px' }}>
          ₹{(product.price * item.quantity).toLocaleString()}
        </p>
        <button className="btn btn-danger btn-sm" onClick={handleRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}
