import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Navbar = ({ onOpenAddCategory, onOpenAddProduct }) => {
  const { activeUser, activeAdmin, cart, categories, logout } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-color sticky-top" data-bs-theme="dark">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand text-white" to="/">
          <i className="fa-solid fa-bolt me-1" style={{ color: '#fbbf24' }}></i>
          Smart E-Commerce
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
          style={{ boxShadow: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          {activeAdmin ? (
            /* ── Admin Navbar ── */
            <ul className="navbar-nav ms-auto align-items-center gap-1">
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-sm fw-semibold me-1"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px' }}
                  onClick={onOpenAddCategory}
                >
                  <i className="fa-solid fa-plus fa-xs me-1"></i>Category
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-sm fw-semibold me-2"
                  style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '8px' }}
                  onClick={onOpenAddProduct}
                >
                  <i className="fa-solid fa-plus fa-xs me-1"></i>Product
                </button>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white fw-semibold" to="/admin">
                  <i className="fa-solid fa-user-shield me-1" style={{ color: '#a5b4fc' }}></i>
                  {activeAdmin.name}
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="#" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket me-1"></i>Logout
                </a>
              </li>
            </ul>
          ) : (
            /* ── User / Guest Navbar ── */
            <>
              {/* Category Dropdown */}
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle fw-semibold"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="fa-solid fa-grid-2 me-1" style={{ fontSize: '0.8rem' }}></i>
                    Categories
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/products">
                        <i className="fa-solid fa-store me-2 text-primary"></i>All Products
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    {categories.map((c) => (
                      <li key={c.cid}>
                        <Link className="dropdown-item" to={`/products?category=${c.cid}`}>
                          <i className="fa-solid fa-tag me-2" style={{ color: '#818cf8', fontSize: '0.8rem' }}></i>
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>

              {/* Search Bar */}
              <form className="d-flex mx-auto col-12 col-lg-5 my-2 my-lg-0" onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search products, brands and more..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-warning fw-bold" type="submit">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </form>

              {/* User Section */}
              <ul className="navbar-nav ms-auto align-items-center gap-1">
                {activeUser ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link position-relative text-white" to="/cart">
                        <i className="fa-solid fa-bag-shopping me-1"></i>Cart
                        {cartCount > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/wishlist">
                        <i className="fa-solid fa-heart me-1"></i>Wishlist
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link fw-semibold" to="/profile"
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          borderRadius: '20px',
                          padding: '6px 14px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#ffffff',
                          fontSize: '0.88rem',
                        }}
                      >
                        <i className="fa-solid fa-circle-user me-1" style={{ color: '#a5b4fc' }}></i>
                        {activeUser.name.split(' ')[0]}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link text-white opacity-75" href="#" onClick={handleLogout} style={{ fontSize: '0.88rem' }}>
                        <i className="fa-solid fa-right-from-bracket me-1"></i>Logout
                      </a>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/register">
                        <i className="fa-solid fa-user-plus me-1"></i>Register
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link fw-semibold"
                        to="/login"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          borderRadius: '20px',
                          padding: '6px 16px',
                          border: '1px solid rgba(255,255,255,0.25)',
                          color: '#ffffff',
                        }}
                      >
                        <i className="fa-solid fa-right-to-bracket me-1"></i>Login
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white opacity-75" to="/adminlogin" style={{ fontSize: '0.85rem' }}>
                        <i className="fa-solid fa-user-shield me-1"></i>Admin
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
