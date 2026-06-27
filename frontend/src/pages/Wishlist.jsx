import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';

export default function Wishlist() {
  const { user, wishlist, fetchWishlist, toggleWishlist, moveToCart, loading } = useShop();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  async function handleRemove(productId) {
    await toggleWishlist(productId);
  }

  async function handleMoveToCart(productId) {
    try {
      await moveToCart(productId);
      alert('Item moved to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to move item to cart');
    }
  }

  if (loading) return <div className="loading">Loading wishlist...</div>;

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>
          My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you like to buy them later.</p>
            <Link to="/collection" className="btn btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="product-grid">
            {wishlist.map((product) => {
              if (!product) return null;
              return (
                <div key={product._id} className="product-card">
                  <div className="product-image-wrap">
                    <Link to={`/product/${product._id}`}>
                      <img src={product.image} alt={product.name} className="product-image" />
                    </Link>
                    <button
                      className="wishlist-btn"
                      onClick={() => handleRemove(product._id)}
                      title="Remove from wishlist"
                    >
                      ❤️
                    </button>
                  </div>

                  <div className="product-info">
                    <p className="product-category">{product.category}</p>
                    <Link to={`/product/${product._id}`}>
                      <h3 className="product-title">{product.name}</h3>
                    </Link>
                    <p className="product-price">₹{product.price.toLocaleString()}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button
                        className="btn btn-primary btn-full btn-sm"
                        onClick={() => handleMoveToCart(product._id)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                      </button>
                      <button
                        className="btn btn-danger btn-outline btn-sm"
                        onClick={() => handleRemove(product._id)}
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
