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
    <nav class="navbar navbar-expand-lg navbar-dark custom-color shadow-sm sticky-top" data-bs-theme="dark">
      <div class="container">
        <Link class="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
          <i class="fa-sharp fa-solid fa-house me-2"></i>EazyDeals
        </Link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navContent">
          {activeAdmin ? (
            /* Admin Navbar */
            <ul class="navbar-nav ms-auto align-items-center">
              <li class="nav-item">
                <button
                  type="button"
                  class="btn btn-outline-light btn-sm me-2 my-1"
                  onClick={onOpenAddCategory}
                >
                  <i class="fa-solid fa-plus fa-xs me-1"></i>Add Category
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="btn btn-outline-light btn-sm me-3 my-1"
                  onClick={onOpenAddProduct}
                >
                  <i class="fa-solid fa-plus fa-xs me-1"></i>Add Product
                </button>
              </li>
              <li class="nav-item me-3">
                <Link class="nav-link text-white fw-semibold" to="/admin">
                  <i class="fa-solid fa-user-shield me-1"></i>{activeAdmin.name}
                </Link>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white cursor-pointer" href="#" onClick={handleLogout}>
                  <i class="fa-solid fa-user-slash me-1"></i>Logout
                </a>
              </li>
            </ul>
          ) : (
            /* User / Guest Navbar */
            <>
              {/* Category Dropdown */}
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item dropdown">
                  <a
                    class="nav-link dropdown-toggle active"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Categories
                  </a>
                  <ul class="dropdown-menu">
                    <li>
                      <Link class="dropdown-item" to="/products">
                        All Products
                      </Link>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    {categories.map((c) => (
                      <li key={c.cid}>
                        <Link class="dropdown-item" to={`/products?category=${c.cid}`}>
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>

              {/* Search Bar */}
              <form class="d-flex mx-auto col-12 col-lg-5 my-2 my-lg-0" onSubmit={handleSearch}>
                <div class="input-group">
                  <input
                    type="search"
                    class="form-control"
                    placeholder="Search products, brands and more..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button class="btn btn-warning text-dark fw-semibold" type="submit">
                    <i class="fa-solid fa-magnifying-glass me-1"></i>Search
                  </button>
                </div>
              </form>

              {/* User Section */}
              <ul class="navbar-nav ms-auto align-items-center">
                {activeUser ? (
                  <>
                    <li class="nav-item pe-2">
                      <Link class="nav-link position-relative active text-white" to="/cart">
                        <i class="fa-solid fa-cart-shopping me-1"></i> Cart
                        {cartCount > 0 && (
                          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li class="nav-item pe-2">
                      <Link class="nav-link active text-white" to="/wishlist">
                        <i class="fa-solid fa-heart me-1"></i> Wishlist
                      </Link>
                    </li>
                    <li class="nav-item pe-2">
                      <Link class="nav-link active text-white fw-semibold" to="/profile">
                        <i class="fa-solid fa-user me-1"></i>{activeUser.name}
                      </Link>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link active text-white" href="#" onClick={handleLogout}>
                        <i class="fa-solid fa-user-slash me-1"></i>Logout
                      </a>
                    </li>
                  </>
                ) : (
                  <>
                    <li class="nav-item pe-2">
                      <Link class="nav-link active text-white" to="/register">
                        <i class="fa-solid fa-user-plus me-1"></i>Register
                      </Link>
                    </li>
                    <li class="nav-item pe-2">
                      <Link class="nav-link active text-white" to="/login">
                        <i class="fa-solid fa-user-lock me-1"></i>Login
                      </Link>
                    </li>
                    <li class="nav-item">
                      <Link class="nav-link active text-white" to="/adminlogin">
                        <i class="fa-solid fa-user-shield me-1"></i>Admin
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
