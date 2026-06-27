import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">Shop<span>Vista</span></div>
            <p className="footer-desc">
              Your one-stop destination for electronics, accessories, and lifestyle products.
              Quality products delivered to your door.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/collection">Collection</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopVista. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
