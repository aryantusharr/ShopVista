import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import API from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToCart, toggleWishlist, isInWishlist } = useShop();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
      setSimilarProducts(data.similarProducts);
    } catch {
      navigate('/collection');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleWishlist() {
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product._id);
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError('');
    if (!reviewForm.comment.trim()) {
      setReviewError('Please write a comment');
      return;
    }
    try {
      setSubmittingReview(true);
      await API.post(`/products/${id}/reviews`, reviewForm);
      await loadProduct();
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="section">
      <div className="container">
        {/* Product Detail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '60px' }}>
          {/* Image */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', aspectRatio: '4/3' }}
            />
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {product.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', opacity: 0.8 }}
                    onClick={() => setProduct({ ...product, image: img })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="product-category">{product.category}</p>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', lineHeight: 1.3 }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ color: '#f59e0b', fontSize: '18px' }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
              <span className="text-muted">{product.numReviews} reviews</span>
            </div>

            <p style={{ fontSize: '32px', fontWeight: '700', color: '#6c63ff', marginBottom: '16px' }}>
              ₹{product.price.toLocaleString()}
            </p>

            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#555', marginBottom: '20px' }}>
              {product.description}
            </p>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '16px', borderRadius: '10px' }}>
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: '#888', minWidth: '120px' }}>{key}</span>
                    <span style={{ fontWeight: '600' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {lowStock && <p className="product-stock-warn">Only {product.stock} left in stock!</p>}

            {product.stock > 0 ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <label className="label" style={{ marginBottom: 0 }}>Qty:</label>
                  <div className="cart-qty">
                    <button className="cart-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                    <span className="cart-qty-num">{quantity}</span>
                    <button className="cart-qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={addingToCart}>
                    {addingToCart ? 'Adding...' : 'Add to Cart 🛒'}
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={handleWishlist}>
                    {inWishlist ? '❤️ Saved' : '🤍 Wishlist'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="product-out-of-stock" style={{ fontSize: '16px', padding: '16px' }}>Out of Stock</div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="section-title">Customer Reviews</h2>

          {product.reviews && product.reviews.length > 0 ? (
            <div style={{ marginBottom: '32px' }}>
              {product.reviews.map((review, i) => (
                <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '10px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontWeight: '600' }}>{review.name}</p>
                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#555' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ marginBottom: '24px' }}>No reviews yet. Be the first!</p>
          )}

          {user && (
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="label">Rating</label>
                  <select className="select" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{'★'.repeat(r)} {r} star{r !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Comment</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your thoughts about this product..."
                  />
                </div>
                {reviewError && <p className="error-msg">{reviewError}</p>}
                <button className="btn btn-primary" type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <h2 className="section-title">Similar Products</h2>
            <div className="product-grid">
              {similarProducts.map((p) => (
                <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} style={{ cursor: 'pointer' }}>
                  <div className="product-card">
                    <img src={p.image} alt={p.name} className="product-image" />
                    <div className="product-info">
                      <p className="product-title">{p.name}</p>
                      <p className="product-price">₹{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
