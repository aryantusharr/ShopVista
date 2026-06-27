import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/shopContext';

export default function Navbar() {
  const { user, logout, cartItemCount } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(path) {
    return location.pathname === path ? 'navbar-link active' : 'navbar-link';
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            Shop<span>Vista</span>
          </Link>

          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <li><Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/collection" className={isActive('/collection')} onClick={() => setMenuOpen(false)}>Collection</Link></li>
            {user && (
              <>
                <li><Link to="/orders" className={isActive('/orders')} onClick={() => setMenuOpen(false)}>Orders</Link></li>
                <li><Link to="/wishlist" className={isActive('/wishlist')} onClick={() => setMenuOpen(false)}>Wishlist</Link></li>
                <li><Link to="/profile" className={isActive('/profile')} onClick={() => setMenuOpen(false)}>Profile</Link></li>
              </>
            )}
          </ul>

          <div className="navbar-actions">
            <Link to="/cart" className="navbar-cart navbar-link">
              🛒
              {cartItemCount > 0 && (
                <span className="navbar-cart-badge">{cartItemCount}</span>
              )}
            </Link>

            {user ? (
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Login
              </Link>
            )}

            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
