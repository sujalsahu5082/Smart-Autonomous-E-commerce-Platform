import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Navbar = ({ onOpenAddCategory, onOpenAddProduct }) => {
  const { activeUser, activeAdmin, cart, categories, logout } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/products${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1050 }}>
      {/* ─── TOP BAR ─── */}
      <div
        className="navbar-top"
        style={{ boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.25)' }}
      >
        <div className="navbar-top-inner">
          {/* Logo */}
          <Link className="navbar-logo" to="/">
            <div className="navbar-logo-text">
              <i className="fa-solid fa-bolt logo-icon"></i>
              Smart<span style={{ color: '#FF9F00' }}>Shop</span>
            </div>
            <span className="navbar-logo-sub">India's Trusted Store</span>
          </Link>

          {/* Deliver to — desktop only */}
          <div className="navbar-deliver d-none d-lg-flex">
            <span><i className="fa-solid fa-location-dot me-1" style={{ color: '#FF9F00', fontSize: '0.9rem' }}></i>Deliver to</span>
            <strong>India</strong>
          </div>

          {/* Search Bar */}
          {!activeAdmin && (
            <form className="navbar-search" onSubmit={handleSearch}>
              {categories.length > 0 && (
                <select
                  className="navbar-search-select d-none d-md-block"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="">All</option>
                  {categories.map((c) => (
                    <option key={c.cid} value={c.cid}>{c.name}</option>
                  ))}
                </select>
              )}
              <input
                type="text"
                className="navbar-search-input"
                placeholder="Search products, brands and more…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="navbar-search-btn">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          )}

          {/* ADMIN — action buttons and name */}
          {activeAdmin ? (
            <div className="navbar-actions ms-auto">
              <button
                className="admin-nav-btn admin-nav-btn-category"
                onClick={onOpenAddCategory}
                type="button"
              >
                <i className="fa-solid fa-plus fa-xs"></i> Category
              </button>
              <button
                className="admin-nav-btn admin-nav-btn-product ms-2"
                onClick={onOpenAddProduct}
                type="button"
              >
                <i className="fa-solid fa-plus fa-xs"></i> Product
              </button>
              <Link className="navbar-action-item ms-2" to="/admin">
                <span style={{ fontSize: '0.68rem' }}>Admin</span>
                <strong>
                  <i className="fa-solid fa-user-shield me-1" style={{ color: '#a5b4fc' }}></i>
                  {activeAdmin.name}
                </strong>
              </Link>
              <a className="navbar-action-item" href="#" onClick={handleLogout}>
                <span style={{ fontSize: '0.68rem' }}>Sign Out</span>
                <strong><i className="fa-solid fa-right-from-bracket me-1"></i>Logout</strong>
              </a>
            </div>
          ) : (
            /* USER / GUEST */
            <div className="navbar-actions ms-auto d-flex align-items-center">
              {/* Mobile Hamburger */}
              <button
                className="navbar-toggler-custom d-lg-none me-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                type="button"
                aria-label="Toggle navigation"
              >
                <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
              </button>

              {/* Account */}
              {activeUser ? (
                <>
                  <div className="navbar-action-item d-none d-lg-flex">
                    <span style={{ fontSize: '0.68rem' }}>Hello, {activeUser.name.split(' ')[0]}</span>
                    <strong>Account &amp; Lists</strong>
                  </div>
                  <Link className="navbar-action-item d-none d-lg-flex" to="/orders">
                    <span style={{ fontSize: '0.68rem' }}>Returns &amp; Orders</span>
                    <strong>My Orders</strong>
                  </Link>
                  <Link className="navbar-action-item d-none d-lg-flex" to="/wishlist">
                    <span style={{ fontSize: '0.68rem' }}>Saved</span>
                    <strong><i className="fa-solid fa-heart me-1" style={{ color: '#f87171' }}></i>Wishlist</strong>
                  </Link>
                  <Link className="navbar-action-item d-none d-lg-flex" to="/profile">
                    <span style={{ fontSize: '0.68rem' }}>My</span>
                    <strong><i className="fa-solid fa-circle-user me-1" style={{ color: '#a5b4fc' }}></i>Profile</strong>
                  </Link>
                  <a className="navbar-action-item d-none d-lg-flex" href="#" onClick={handleLogout}>
                    <span style={{ fontSize: '0.68rem' }}>Sign Out</span>
                    <strong>Logout</strong>
                  </a>
                </>
              ) : (
                <>
                  <Link className="navbar-action-item d-none d-lg-flex" to="/login">
                    <span style={{ fontSize: '0.68rem' }}>Hello, sign in</span>
                    <strong>Account &amp; Lists</strong>
                  </Link>
                  <Link className="navbar-action-item d-none d-lg-flex" to="/register">
                    <span style={{ fontSize: '0.68rem' }}>New here?</span>
                    <strong>Register</strong>
                  </Link>
                  <Link className="navbar-action-item d-none d-lg-flex" to="/adminlogin">
                    <span style={{ fontSize: '0.68rem' }}>Admin</span>
                    <strong><i className="fa-solid fa-user-shield me-1" style={{ color: '#a5b4fc' }}></i>Sign in</strong>
                  </Link>
                </>
              )}

              {/* Cart */}
              <Link className="navbar-cart" to="/cart">
                <div className="navbar-cart-icon">
                  <i className="fa-solid fa-cart-shopping"></i>
                  {cartCount > 0 && (
                    <span className="navbar-cart-count">{cartCount}</span>
                  )}
                </div>
                <span className="d-none d-sm-inline" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cart</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileOpen && !activeAdmin && (
          <div className="mobile-nav-dropdown" ref={mobileRef}>
            {activeUser ? (
              <>
                <div style={{ padding: '8px 20px 4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hello, {activeUser.name.split(' ')[0]}
                </div>
                <Link className="mobile-nav-link" to="/profile"><i className="fa-solid fa-circle-user me-2"></i>My Profile</Link>
                <Link className="mobile-nav-link" to="/orders"><i className="fa-solid fa-box me-2"></i>My Orders</Link>
                <Link className="mobile-nav-link" to="/wishlist"><i className="fa-solid fa-heart me-2"></i>Wishlist</Link>
                <Link className="mobile-nav-link" to="/cart"><i className="fa-solid fa-cart-shopping me-2"></i>Cart {cartCount > 0 && `(${cartCount})`}</Link>
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                <a className="mobile-nav-link" href="#" onClick={handleLogout} style={{ color: '#f87171' }}>
                  <i className="fa-solid fa-right-from-bracket me-2"></i>Logout
                </a>
              </>
            ) : (
              <>
                <Link className="mobile-nav-link" to="/login"><i className="fa-solid fa-right-to-bracket me-2"></i>Sign In</Link>
                <Link className="mobile-nav-link" to="/register"><i className="fa-solid fa-user-plus me-2"></i>Register</Link>
                <Link className="mobile-nav-link" to="/cart"><i className="fa-solid fa-cart-shopping me-2"></i>Cart {cartCount > 0 && `(${cartCount})`}</Link>
                <Link className="mobile-nav-link" to="/adminlogin"><i className="fa-solid fa-user-shield me-2"></i>Admin Login</Link>
              </>
            )}
            {/* Category list on mobile */}
            <div style={{ padding: '8px 20px 4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
              Categories
            </div>
            <Link className="mobile-nav-link" to="/products"><i className="fa-solid fa-store me-2"></i>All Products</Link>
            {categories.map((c) => (
              <Link key={c.cid} className="mobile-nav-link" to={`/products?category=${c.cid}`}>
                <i className="fa-solid fa-tag me-2" style={{ color: '#FF9F00', fontSize: '0.8rem' }}></i>
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── BOTTOM NAV BAR (Categories) — hidden for admin ─── */}
      {!activeAdmin && (
        <div className="navbar-bottom">
          <div className="navbar-bottom-inner">
            <Link
              className={`nav-cat-link ${location.pathname === '/products' && !new URLSearchParams(location.search).get('category') ? 'active-cat' : ''}`}
              to="/products"
            >
              <i className="fa-solid fa-store fa-xs"></i> All
            </Link>
            {categories.slice(0, 10).map((c) => (
              <Link
                key={c.cid}
                className={`nav-cat-link ${new URLSearchParams(location.search).get('category') === String(c.cid) ? 'active-cat' : ''}`}
                to={`/products?category=${c.cid}`}
              >
                {c.name}
              </Link>
            ))}
            {activeUser && (
              <>
                <Link className="nav-cat-link d-lg-none" to="/orders">Orders</Link>
                <Link className="nav-cat-link d-lg-none" to="/wishlist">Wishlist</Link>
              </>
            )}
            <Link className="nav-cat-link" to="/cart" style={{ marginLeft: 'auto', color: '#FF9F00', fontWeight: 700 }}>
              <i className="fa-solid fa-tag fa-xs me-1"></i> Today's Deals
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
