import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import ProductCard from '../components/ProductCard';

const categories = ['All', 'Electronics', 'Audio', 'Computing', 'Accessories', 'Lifestyle'];

export default function Collection() {
  const { fetchProducts } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sort: 'newest',
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  async function loadProducts() {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category !== 'All') params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.inStock) params.inStock = 'true';
    if (filters.sort) params.sort = filters.sort;

    const data = await fetchProducts(params);
    setProducts(data);
    setLoading(false);
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadProducts();
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>All Products</h1>
        </div>
      </div>

      <div className="container">
        <div className="collection-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filter-group">
              <p className="filter-title">Search</p>
              <form onSubmit={handleSearchSubmit}>
                <input
                  className="input"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </form>
            </div>

            <div className="filter-group">
              <p className="filter-title">Category</p>
              {categories.map((cat) => (
                <label key={cat} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat}
                    onChange={() => updateFilter('category', cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <p className="filter-title">Price Range</p>
              <input
                className="input"
                placeholder="Min ₹"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <input
                className="input"
                placeholder="Max ₹"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => updateFilter('inStock', e.target.checked)}
                />
                In Stock Only
              </label>
            </div>

            <button className="btn btn-outline btn-full btn-sm" onClick={() => setFilters({ search: '', category: 'All', minPrice: '', maxPrice: '', inStock: false, sort: 'newest' })}>
              Clear Filters
            </button>
          </aside>

          {/* Products */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p className="text-muted" style={{ fontSize: '14px' }}>
                {loading ? 'Loading...' : `${products.length} products`}
              </p>
              <select
                className="select"
                style={{ width: 'auto' }}
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>

            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
