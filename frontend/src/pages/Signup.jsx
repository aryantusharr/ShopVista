import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';

export default function Signup() {
  const { register } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo">ShopVista</span>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join ShopVista today</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label className="label">Phone (optional)</label>
            <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
          </div>

          <div className="form-group">
            <label className="label">Confirm Password</label>
            <input className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6c63ff', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
