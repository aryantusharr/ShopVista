import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? 'sidebar-link active' : 'sidebar-link';
  }

  function handleLogout() {
    localStorage.removeItem('shopvista_admin_user');
    window.location.href = '/login';
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Shop<span>Vista</span> Admin
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/" className={isActive('/')}>
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link to="/products" className={isActive('/products')}>
            📦 Products List
          </Link>
        </li>
        <li>
          <Link to="/products/add" className={isActive('/products/add')}>
            ➕ Add Product
          </Link>
        </li>
        <li>
          <Link to="/orders" className={isActive('/orders')}>
            🛒 Orders
          </Link>
        </li>
        <li>
          <Link to="/inventory" className={isActive('/inventory')}>
            📈 Inventory
          </Link>
        </li>
      </ul>
      <button
        onClick={handleLogout}
        className="btn btn-danger btn-outline btn-sm"
        style={{ marginTop: 'auto', width: '100%' }}
      >
        Logout
      </button>
    </aside>
  );
}
