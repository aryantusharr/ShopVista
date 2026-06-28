import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';

export default function Login() {
  const { login } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo">ShopVista</span>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
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

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#6c63ff', fontWeight: '600' }}>Sign up</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#888' }}>
          Admin?{' '}
          <Link to="/admin/login" style={{ color: '#e53e3e', fontWeight: '600' }}>Login here →</Link>
        </p>

        {/* Demo Credentials Box */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}>
          <p style={{ fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Demo Credentials:</p>
          <ul style={{ paddingLeft: '16px', margin: 0, color: '#718096', lineHeight: '1.6' }}>
            <li>john@example.com / john123</li>
            <li>jane@example.com / jane123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
