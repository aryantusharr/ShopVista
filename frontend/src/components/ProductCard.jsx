import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';

export default function ProductCard({ product }) {
  const { user, addToCart, toggleWishlist, isInWishlist } = useShop();
  const navigate = useNavigate();

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart');
    }
  }

  async function handleWishlist() {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error(err);
    }
  }

  const inWishlist = isInWishlist(product._id);
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        </Link>
        <button
          className="wishlist-btn"
          onClick={handleWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-price">₹{product.price.toLocaleString()}</p>
        <p className="product-rating">
          <span>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          {' '}{product.numReviews} reviews
        </p>

        {lowStock && (
          <p className="product-stock-warn">Only {product.stock} left in stock!</p>
        )}

        {product.stock > 0 ? (
          <button className="btn btn-primary btn-full" onClick={handleAddToCart}>
            Add to Cart
          </button>
        ) : (
          <div className="product-out-of-stock">Out of Stock</div>
        )}
      </div>
    </div>
  );
}
