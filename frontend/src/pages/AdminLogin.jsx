import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/admin/login', {
        email: form.email,
        password: form.password,
      });

      // Save token to localStorage separately
      localStorage.setItem('adminToken', data.token);
      
      // Also store admin user info for dashboard sharing
      localStorage.setItem('shopvista_admin_user', JSON.stringify(data));

      setSuccess('Admin authenticated! Redirecting to Merchant Panel...');
      
      setTimeout(() => {
        // Redirect to Vite Admin Panel
        window.location.href = 'http://localhost:5173';
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo" style={{ color: '#e53e3e' }}>ShopVista Admin</span>
        <h1 className="auth-title">Merchant Portal</h1>
        <p className="auth-subtitle">Sign in to manage your store</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Admin Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@shopvista.com"
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <button 
            className="btn btn-primary btn-full btn-lg" 
            type="submit" 
            disabled={loading} 
            style={{ marginTop: '16px', background: '#e53e3e', borderColor: '#e53e3e' }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
          <Link to="/login" style={{ color: '#6c63ff', fontWeight: '600' }}>← Back to user login</Link>
        </p>

        {/* Demo Credentials Box */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', fontSize: '13px' }}>
          <p style={{ fontWeight: '700', color: '#c53030', marginBottom: '8px' }}>Demo Credentials:</p>
          <ul style={{ paddingLeft: '16px', margin: 0, color: '#9b2c2c', lineHeight: '1.6' }}>
            <li>admin@shopvista.com / admin123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
