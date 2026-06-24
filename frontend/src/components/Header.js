import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiShoppingCart, HiMenu, HiX, HiUser, HiLogout, HiClipboardList } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-950/90 backdrop-blur-xl border-b border-brand-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-display text-2xl font-bold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent hover:from-brand-300 hover:to-emerald-300 transition-all duration-300"
          >
            ShopVista
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Products
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                Orders
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-white transition-colors duration-200"
            >
              <HiShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-800/50 text-slate-200 hover:bg-brand-700/50 transition-all duration-200 text-sm font-medium"
                >
                  <HiUser className="w-4 h-4" />
                  {user.name}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-900 border border-brand-700 rounded-xl shadow-2xl overflow-hidden">
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-brand-800 hover:text-white transition-colors text-sm"
                    >
                      <HiClipboardList className="w-4 h-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
                    >
                      <HiLogout className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold hover:from-brand-500 hover:to-brand-400 transition-all duration-300 shadow-lg shadow-brand-500/25"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {menuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-brand-800/50 mt-2 pt-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block text-slate-300 hover:text-white transition-colors py-2 text-sm"
            >
              Products
            </Link>
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors py-2 text-sm"
            >
              <HiShoppingCart className="w-5 h-5" />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {user ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="block text-slate-300 hover:text-white transition-colors py-2 text-sm"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block text-red-400 hover:text-red-300 transition-colors py-2 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-brand-400 hover:text-brand-300 transition-colors py-2 text-sm font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
