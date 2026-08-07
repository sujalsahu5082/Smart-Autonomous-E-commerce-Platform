import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const AdminDashboard = ({ onOpenAddCategory, onOpenAddProduct }) => {
  const { categories, products, users, orders, admins, activeAdmin } = useStore();
  const navigate = useNavigate();

  if (!activeAdmin) {
    return (
      <div class="container py-5 text-center">
        <h4>Access Denied - Admin Login Required</h4>
        <button class="btn btn-dark mt-3" onClick={() => navigate('/adminlogin')}>Admin Login</button>
      </div>
    );
  }

  return (
    <div class="container py-5">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold m-0"><i class="fa-solid fa-gauge-high text-primary me-2"></i>Admin Dashboard</h3>
          <p class="text-muted small mb-0">Welcome back, {activeAdmin.name}</p>
        </div>
        <div class="d-flex gap-2 mt-2 mt-sm-0">
          <button class="btn btn-primary btn-sm fw-semibold" onClick={onOpenAddCategory}>
            <i class="fa-solid fa-plus me-1"></i>Add Category
          </button>
          <button class="btn btn-success btn-sm fw-semibold" onClick={onOpenAddProduct}>
            <i class="fa-solid fa-plus me-1"></i>Add Product
          </button>
        </div>
      </div>

      {/* Dashboard Stat Cards Grid */}
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {/* Categories Card */}
        <div class="col">
          <div class="card admin-stat-card bg-white p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <img src="/Images/categories.png" alt="Categories" style={{ width: '50px' }} />
              <span class="fs-2 fw-bold text-primary">{categories.length}</span>
            </div>
            <h5 class="fw-bold mb-1">Categories</h5>
            <p class="text-muted small">Manage product classification hierarchy</p>
            <Link to="/admin/display-category" class="btn btn-outline-primary btn-sm fw-semibold mt-auto">
              View Categories <i class="fa-solid fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>

        {/* Products Card */}
        <div class="col">
          <div class="card admin-stat-card bg-white p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <img src="/Images/products.png" alt="Products" style={{ width: '50px' }} />
              <span class="fs-2 fw-bold text-success">{products.length}</span>
            </div>
            <h5 class="fw-bold mb-1">Products</h5>
            <p class="text-muted small">Manage inventory stock & pricing</p>
            <Link to="/admin/display-products" class="btn btn-outline-success btn-sm fw-semibold mt-auto">
              View All Products <i class="fa-solid fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>

        {/* Orders Card */}
        <div class="col">
          <div class="card admin-stat-card bg-white p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <img src="/Images/order.png" alt="Orders" style={{ width: '50px' }} />
              <span class="fs-2 fw-bold text-warning">{orders.length}</span>
            </div>
            <h5 class="fw-bold mb-1">Orders</h5>
            <p class="text-muted small">Track customer order dispatch status</p>
            <Link to="/admin/display-orders" class="btn btn-outline-warning btn-sm fw-semibold text-dark mt-auto">
              View All Orders <i class="fa-solid fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>

        {/* Users Card */}
        <div class="col">
          <div class="card admin-stat-card bg-white p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <img src="/Images/users.png" alt="Users" style={{ width: '50px' }} />
              <span class="fs-2 fw-bold text-info">{users.length}</span>
            </div>
            <h5 class="fw-bold mb-1">Registered Users</h5>
            <p class="text-muted small">View customer accounts & info</p>
            <Link to="/admin/display-users" class="btn btn-outline-info btn-sm fw-semibold mt-auto">
              View Registered Users <i class="fa-solid fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>

        {/* Admins Card */}
        <div class="col">
          <div class="card admin-stat-card bg-white p-4 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <img src="/Images/add-admin.png" alt="Admins" style={{ width: '50px' }} />
              <span class="fs-2 fw-bold text-dark">{admins.length}</span>
            </div>
            <h5 class="fw-bold mb-1">Admin Team</h5>
            <p class="text-muted small">Manage administrative accounts</p>
            <Link to="/admin/display-admin" class="btn btn-outline-dark btn-sm fw-semibold mt-auto">
              View Admin Team <i class="fa-solid fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
