import { useState } from 'react';
import { useShop } from '../context/shopContext';

export default function AddressForm({ onSaved, existingAddress }) {
  const { addAddress, updateAddress } = useShop();
  const [form, setForm] = useState({
    street: existingAddress?.street || '',
    city: existingAddress?.city || '',
    state: existingAddress?.state || '',
    zipCode: existingAddress?.zipCode || '',
    phone: existingAddress?.phone || '',
    isDefault: existingAddress?.isDefault || false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.street || !form.city || !form.state || !form.zipCode || !form.phone) {
      setError('All fields are required');
      return;
    }

    try {
      setSaving(true);
      if (existingAddress) {
        await updateAddress(existingAddress._id, form);
      } else {
        await addAddress(form);
      }
      onSaved && onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginTop: '16px' }}>
      <div className="form-group">
        <label className="label">Street Address</label>
        <input className="input" name="street" value={form.street} onChange={handleChange} placeholder="123 Main Street" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="label">City</label>
          <input className="input" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
        </div>
        <div className="form-group">
          <label className="label">State</label>
          <input className="input" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="label">ZIP Code</label>
          <input className="input" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="400001" />
        </div>
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <input type="checkbox" id="isDefault" name="isDefault" checked={form.isDefault} onChange={handleChange} />
        <label htmlFor="isDefault" style={{ fontSize: '14px', cursor: 'pointer' }}>Set as default address</label>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : existingAddress ? 'Update Address' : 'Save Address'}
        </button>
        {onSaved && (
          <button type="button" className="btn btn-outline" onClick={() => onSaved()}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
