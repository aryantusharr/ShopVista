import { useEffect, useState } from 'react';
import API from '../api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Restock');

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/inventory');
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch inventory details');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjust(productId) {
    if (!adjustQty || isNaN(adjustQty)) {
      alert('Please enter a valid number for adjustment');
      return;
    }
    try {
      await API.post('/admin/inventory/adjust', {
        productId,
        quantity: parseInt(adjustQty),
        reason: adjustReason,
      });
      setAdjustingId(null);
      setAdjustQty('');
      setAdjustReason('Restock');
      fetchInventory();
      alert('Stock adjusted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    }
  }

  if (loading && products.length === 0) return <div className="loading">Loading inventory...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>Inventory Management</h1>

      {error && <p className="error-msg" style={{ marginBottom: '20px' }}>{error}</p>}

      <div className="card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th style={{ textAlign: 'right' }}>Stock Management</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={p.image}
                        alt=""
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <span style={{ fontWeight: '600' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                  <td>{p.category}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: p.stock === 0 ? '#fee2e2' : p.stock <= 5 ? '#fef3c7' : '#dcfce7',
                        color: p.stock === 0 ? '#b91c1c' : p.stock <= 5 ? '#b45309' : '#15803d',
                      }}
                    >
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {adjustingId === p._id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <input
                          type="number"
                          className="input"
                          placeholder="e.g. 10 or -5"
                          value={adjustQty}
                          onChange={(e) => setAdjustQty(e.target.value)}
                          style={{ width: '100px', padding: '6px 10px', fontSize: '12px' }}
                        />
                        <select
                          className="select"
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                          style={{ width: '120px', padding: '6px 10px', fontSize: '12px' }}
                        >
                          <option value="Restock">Restock</option>
                          <option value="Damage">Damage</option>
                          <option value="Return">Return</option>
                          <option value="Audit">Audit Correction</option>
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAdjust(p._id)}>
                          Save
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setUpdatingId ? setUpdatingId(null) : setAdjustingId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => setAdjustingId(p._id)}>
                        Adjust Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
