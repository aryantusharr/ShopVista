import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/auth/login', form);
      
      if (!data.isAdmin) {
        setError('Access denied. Admin account required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('shopvista_admin_user', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">ShopVista</h1>
        <p className="login-subtitle">Admin Dashboard Login</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Admin Email</label>
            <input
              type="email"
              name="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@shopvista.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
