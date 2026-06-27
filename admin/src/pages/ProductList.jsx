import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data } = await API.get('/products');
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products list');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(productId) {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/admin/products/${productId}`);
        setProducts(products.filter((p) => p._id !== productId));
        alert('Product deleted successfully');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  }

  if (loading) return <div className="loading">Loading products list...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: 0 }}>Products</h1>
        <Link to="/products/add" className="btn btn-primary">
          + Add Product
        </Link>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: '20px' }}>{error}</p>}

      {products.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 20px' }}>
          <p className="text-muted">No products available. Click Add Product to create one.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        ★ {p.rating} ({p.numReviews} reviews)
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.sku}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: '600' }}>₹{p.price.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: '600', color: p.stock <= 5 ? '#ef4444' : 'inherit' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/products/edit/${p._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
