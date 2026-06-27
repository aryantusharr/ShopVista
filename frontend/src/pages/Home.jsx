import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const categories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Audio', icon: '🎧' },
  { name: 'Computing', icon: '💻' },
  { name: 'Accessories', icon: '🎒' },
  { name: 'Lifestyle', icon: '✨' },
];

export default function Home() {
  const { fetchProducts } = useShop();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      const data = await fetchProducts({ sort: 'rating' });
      setFeatured(data.slice(0, 6));
      setLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Shop <span>Smarter</span>, <br />Live Better
          </h1>
          <p className="hero-subtitle">
            Discover premium electronics, accessories, and lifestyle products
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <SearchBar />
          </div>
          <Link to="/collection" className="btn btn-primary btn-lg">
            Browse Collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ backgroundColor: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/collection?category=${cat.name}`)}
              >
                <div className="category-icon">{cat.icon}</div>
                <p className="category-name">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Featured Products</h2>
            <Link to="/collection" className="btn btn-outline btn-sm">View All</Link>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : featured.length > 0 ? (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products yet</h3>
              <p>Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
