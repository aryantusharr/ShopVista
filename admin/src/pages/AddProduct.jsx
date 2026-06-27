import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const categories = ['Electronics', 'Audio', 'Computing', 'Accessories', 'Lifestyle'];

export default function AddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    category: 'Electronics',
    description: '',
    image: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      async function fetchProduct() {
        try {
          const { data } = await API.get(`/products/${id}`);
          const p = data.product;
          setForm({
            name: p.name || '',
            sku: p.sku || '',
            price: p.price || '',
            stock: p.stock || '',
            category: p.category || 'Electronics',
            description: p.description || '',
            image: p.image || '',
          });
        } catch (err) {
          setError('Failed to load product details');
        }
      }
      fetchProduct();
    }
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!form.name || !form.sku || !form.price || !form.category || !form.description || !form.image) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
    };

    try {
      if (isEdit) {
        await API.put(`/admin/products/${id}`, payload);
        setSuccess('Product updated successfully!');
      } else {
        await API.post('/admin/products', payload);
        setSuccess('Product created successfully!');
        setForm({
          name: '',
          sku: '',
          price: '',
          stock: '',
          category: 'Electronics',
          description: '',
          image: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Product Name</label>
            <input
              type="text"
              name="name"
              className="input"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Bluetooth Headphones"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="label">SKU</label>
              <input
                type="text"
                name="sku"
                className="input"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. SKU-HEADPHONES-001"
                required
                disabled={isEdit}
                style={isEdit ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
              />
            </div>

            <div className="form-group">
              <label className="label">Category</label>
              <select
                name="category"
                className="select"
                value={form.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="label">Price (₹)</label>
              <input
                type="number"
                name="price"
                className="input"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 1999"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="label">Initial Stock</label>
              <input
                type="number"
                name="stock"
                className="input"
                value={form.stock}
                onChange={handleChange}
                placeholder="e.g. 50"
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Main Image URL</label>
            <input
              type="text"
              name="image"
              className="input"
              value={form.image}
              onChange={handleChange}
              placeholder="e.g. https://picsum.photos/..."
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              name="description"
              className="textarea"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product details..."
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/products')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
